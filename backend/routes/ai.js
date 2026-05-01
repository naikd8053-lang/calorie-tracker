import express from 'express';
import auth from '../middleware/auth.js';
import { analyzeMealWithGemini } from '../services/geminiService.js';

const router = express.Router();

router.post('/parse-food', auth, async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ message: 'Query required' });

  try {
    const aiResult = await analyzeMealWithGemini(query);
    const foods = aiResult.foods.map(food => ({
      name: food.name,
      quantity: '1 serving',
      calories: food.estimated_calories
    }));
    res.json({ foods, source: 'Gemini AI' });
  } catch (error) {
    console.error('Gemini parsing error:', error);
    // Fallback to local estimation if Gemini fails
    const fallbackFoods = fallbackLocalEstimation(query);
    res.json({ foods: fallbackFoods, fallback: true, source: 'Local Fallback' });
  }
});

// Simple local fallback (keep your existing logic)
function fallbackLocalEstimation(text) {
  const items = text.split(/[\+,&]/).map(s => s.trim());
  const parsed = [];
  const localDB = {
    roti: 120, rice: 150, milk: 100, pizza: 300, burger: 250,
    salad: 50, chicken: 200, fish: 150, egg: 70, banana: 90,
    apple: 80, bread: 80, cheese: 110, yogurt: 140, oats: 150
  };
  for (let item of items) {
    const match = item.match(/^(\d+)\s*(.+)$/);
    let quantity = 1;
    let name = item;
    if (match) {
      quantity = parseInt(match[1]);
      name = match[2].trim();
    }
    const baseCal = localDB[name.toLowerCase()] || 180;
    const totalCal = baseCal * quantity;
    parsed.push({
      name: `${quantity} ${name}`,
      quantity: `${quantity} serving(s)`,
      calories: totalCal
    });
  }
  return parsed;
}

export default router;