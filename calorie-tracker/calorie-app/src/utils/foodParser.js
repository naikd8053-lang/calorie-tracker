// src/utils/foodParser.js
import { aiAPI } from '../services/api';

/**
 * Main AI-powered food parser.
 * Calls backend Gemini endpoint, falls back to local parser on error.
 */
export async function parseFoodInputAI(text) {
  if (!text || text.trim() === '') return [];

  try {
    const response = await aiAPI.parseFood(text);
    if (response.data && response.data.foods && response.data.foods.length > 0) {
      return response.data.foods;
    } else {
      // Empty result from AI – fallback
      console.warn('AI returned no items, using local fallback');
      return localParseFood(text);
    }
  } catch (error) {
    console.error('AI parsing failed, using local fallback:', error.message);
    return localParseFood(text);
  }
}

/**
 * Local intelligent food parser (offline / fallback)
 * Supports quantity prefixes like "2 roti", "half cup rice", etc.
 */
function localParseFood(text) {
  const items = text.split(/[\+,&]| and /).map(s => s.trim()).filter(s => s);
  const parsed = [];

  // Extended food database (calories per standard serving)
  const foodDatabase = {
    // Indian staples
    roti: 120, chapati: 120, paratha: 300, naan: 260, poori: 250,
    rice: 150, pulao: 220, biryani: 400,
    dal: 160, sambar: 90, curry: 200,
    paneer: 300, butter: 100, ghee: 120,
    // Western
    pizza: 300, burger: 250, sandwich: 200, bread: 80,
    pasta: 220, noodles: 200, frenchfries: 300,
    // Proteins
    chicken: 200, fish: 150, egg: 70, tofu: 90,
    // Fruits
    banana: 90, apple: 80, orange: 60, mango: 100,
    // Veggies
    salad: 50, broccoli: 30, spinach: 20,
    // Dairy
    milk: 100, yogurt: 140, cheese: 110,
    // Beverages
    coffee: 5, tea: 30, juice: 110, soda: 140,
    // Snacks
    samosa: 280, pakora: 250, chips: 150, chocolate: 150,
    // Default fallback
    default: 180
  };

  for (let item of items) {
    // Parse quantity and unit (e.g., "2 roti", "half cup rice")
    let quantity = 1;
    let unitMultiplier = 1;
    let name = item;

    // Check for fractional or numeric quantity
    const quantityMatch = item.match(/^(\d+(?:\.\d+)?|\w+)\s+(.+)$/i);
    if (quantityMatch) {
      let qtyStr = quantityMatch[1].toLowerCase();
      name = quantityMatch[2];
      if (qtyStr === 'half') {
        quantity = 0.5;
      } else if (qtyStr === 'quarter') {
        quantity = 0.25;
      } else {
        quantity = parseFloat(qtyStr);
        if (isNaN(quantity)) quantity = 1;
      }
    }

    // Check for unit keywords that modify serving size
    const unitMatch = name.match(/^(cup|glass|bowl|plate|slice|piece|serving)s?\s+(.*)$/i);
    if (unitMatch) {
      const unit = unitMatch[1].toLowerCase();
      name = unitMatch[2];
      if (unit === 'cup') unitMultiplier = 1.5;
      else if (unit === 'glass') unitMultiplier = 1.2;
      else if (unit === 'bowl') unitMultiplier = 2;
      else if (unit === 'plate') unitMultiplier = 2.5;
      else if (unit === 'slice') unitMultiplier = 0.8;
      else unitMultiplier = 1;
    }

    // Find base calories
    let baseCalories = foodDatabase.default;
    for (const [key, cal] of Object.entries(foodDatabase)) {
      if (name.toLowerCase().includes(key)) {
        baseCalories = cal;
        break;
      }
    }

    const totalCalories = Math.round(baseCalories * quantity * unitMultiplier);

    parsed.push({
      name: `${quantity} ${name}${quantity !== 1 ? 's' : ''}`.trim(),
      quantity: `${quantity} serving(s)`,
      calories: totalCalories
    });
  }

  return parsed;
}