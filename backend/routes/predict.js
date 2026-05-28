import express from 'express';
import auth from '../middleware/auth.js';
import { analyzeMealWithGemini } from '../services/geminiService.js';
import { getCaloriesFromUSDA } from '../services/usdaService.js';

const router = express.Router();

// ---------- Typical piece weights (grams) for common count‑based foods ----------
const pieceWeight = {
  apple: 150, banana: 120, orange: 130, roti: 40, chapati: 40,
  egg: 50, bread: 30, samosa: 75, paratha: 80, idli: 40,
  dosa: 150, default: 100
};

// Convert unit to grams
function toGrams(quantity, unit) {
  const u = unit.toLowerCase();
  if (u === 'g') return quantity;
  if (u === 'kg') return quantity * 1000;
  if (u === 'ml') return quantity;
  if (u === 'l') return quantity * 1000;
  if (u === 'cup') return quantity * 240;
  if (u === 'tbsp') return quantity * 15;
  if (u === 'tsp') return quantity * 5;
  return quantity;
}

// Parse a single phrase into { type, name, grams, count? }
function parseSingleItem(phrase) {
  let s = phrase.trim().toLowerCase();
  s = s.replace(/(\w+)s$/, '$1'); // remove trailing 's'

  // 1) weight+unit+food (e.g., "100g rice", "1.5 kg chicken")
  let match = s.match(/^(\d+(?:\.\d+)?)\s*(g|kg|ml|l|cup|tbsp|tsp)\s+([a-z]+)/);
  if (match) {
    let qty = parseFloat(match[1]);
    let unit = match[2];
    let food = match[3];
    let grams = toGrams(qty, unit);
    return { type: 'weight', name: food, grams };
  }

  // 2) number + food (count) : "2 apple"
  match = s.match(/^(\d+)\s+([a-z]+)/);
  if (match) {
    let count = parseInt(match[1]);
    let food = match[2];
    return { type: 'count', name: food, count };
  }

  // 3) food + number : "apple 2"
  match = s.match(/^([a-z]+)\s+(\d+)/);
  if (match) {
    let food = match[1];
    let count = parseInt(match[2]);
    return { type: 'count', name: food, count };
  }

  // 4) "2apples"
  match = s.match(/^(\d+)([a-z]+)/);
  if (match) {
    let count = parseInt(match[1]);
    let food = match[2];
    return { type: 'count', name: food, count };
  }

  // 5) single word : "apple"
  if (!s.includes(' ')) {
    return { type: 'count', name: s, count: 1 };
  }

  return null; // complex
}

// ---------- Get accurate calories using USDA (or fallback) ----------
async function getAccurateCalories(item) {
  if (item.type === 'weight') {
    // Use USDA for grams-based input
    const usda = await getCaloriesFromUSDA(item.name, item.grams);
    if (usda) return usda;
    // Fallback to per100g table (simplified)
    const per100g = { rice:130, chicken:165, milk:42, apple:52, default:150 };
    const calPer100 = per100g[item.name] || per100g.default;
    const calories = (calPer100 * item.grams) / 100;
    return {
      name: item.name,
      quantity: `${item.grams}g`,
      calories: Math.round(calories),
      protein: 0, fat: 0, carbs: 0,
      source: 'Fallback (per100g)'
    };
  } 
  else if (item.type === 'count') {
    // Convert count to grams using typical piece weight, then query USDA
    const weightPerPiece = pieceWeight[item.name] || pieceWeight.default;
    const totalGrams = weightPerPiece * item.count;
    const usda = await getCaloriesFromUSDA(item.name, totalGrams);
    if (usda) return usda;
    // Fallback: use perPiece table (last resort)
    const perPiece = { apple:80, banana:90, roti:120, egg:70, default:100 };
    const calEach = perPiece[item.name] || perPiece.default;
    return {
      name: item.name,
      quantity: `${item.count} ${item.name}${item.count>1?'s':''}`,
      calories: calEach * item.count,
      protein: 0, fat: 0, carbs: 0,
      source: 'Fallback (per piece)'
    };
  }
  return null;
}

// ---------- Split input into items ----------
function splitInput(input) {
  const parts = input.split(/[\+,&]|\band\b/).map(p => p.trim()).filter(p => p);
  const items = [];
  for (let part of parts) {
    const parsed = parseSingleItem(part);
    if (parsed) items.push(parsed);
    else return null; // complex – use Gemini
  }
  return items;
}

// ---------- Main API Endpoint ----------
router.post('/predict', auth, async (req, res) => {
  const { query, type } = req.body;
  if (!query) return res.status(400).json({ error: 'No query' });

  // 1. Try to split and get accurate calories (using USDA)
  const parsedItems = splitInput(query);
  if (parsedItems && parsedItems.length > 0) {
    const results = [];
    for (let item of parsedItems) {
      const cal = await getAccurateCalories(item);
      if (cal) results.push(cal);
    }
    if (results.length > 0) {
      return res.json({ foods: results, source: 'USDA + Lookup' });
    }
  }

  // 2. Complex sentence → Gemini AI
  try {
    const gemini = await analyzeMealWithGemini(query);
    const foods = gemini.foods.map(f => ({
      name: f.name,
      quantity: '1 serving',
      calories: f.estimated_calories,
      protein: f.protein_g || 0,
      fat: f.fat_g || 0,
      carbs: f.carbs_g || 0,
      source: 'Gemini AI'
    }));
    return res.json({ foods });
  } catch (err) {
    // 3. Ultimate fallback
    const fallback = [{
      name: query,
      quantity: '1 serving',
      calories: 200,
      protein: 0, fat: 0, carbs: 0,
      source: 'Fallback'
    }];
    return res.json({ foods: fallback });
  }
});

export default router;