import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import auth from '../middleware/auth.js';

const router = express.Router();

// Food database with accurate calories per serving (as before)
const foodDB = {
  breakfast: [
    { name: "2 scrambled eggs", calories: 140 },
    { name: "1 slice whole wheat bread", calories: 80 },
    { name: "1 tbsp peanut butter", calories: 95 },
    { name: "1 banana", calories: 90 },
    { name: "1 cup milk", calories: 100 },
    { name: "1 cup oatmeal", calories: 150 },
    { name: "1 apple", calories: 80 },
    { name: "1 cup yogurt", calories: 120 },
    { name: "2 idli with sambar", calories: 150 },
    { name: "1 bowl poha", calories: 250 }
  ],
  lunch: [
    { name: "150g grilled chicken", calories: 248 },
    { name: "100g cooked rice", calories: 130 },
    { name: "100g vegetable curry", calories: 90 },
    { name: "2 roti", calories: 240 },
    { name: "150g dal", calories: 165 },
    { name: "100g paneer curry", calories: 265 },
    { name: "1 cup curd", calories: 60 },
    { name: "1 bowl salad", calories: 50 },
    { name: "150g fish curry", calories: 280 },
    { name: "1 bowl biryani", calories: 400 }
  ],
  dinner: [
    { name: "2 roti", calories: 240 },
    { name: "150g chicken curry", calories: 280 },
    { name: "100g rice", calories: 130 },
    { name: "1 bowl dal", calories: 150 },
    { name: "150g fish", calories: 280 },
    { name: "100g quinoa", calories: 120 },
    { name: "mixed salad", calories: 50 },
    { name: "1 bowl vegetable soup", calories: 100 },
    { name: "2 chapati + subzi", calories: 300 }
  ]
};

// Helper to build a meal exactly (or as close as possible) to target calories
function buildMeal(targetCal, mealType) {
  if (targetCal <= 0) return { items: [], calories: 0 };
  const options = foodDB[mealType];
  let remaining = targetCal;
  let selected = [];
  // Shuffle for variety
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  for (let food of shuffled) {
    if (food.calories <= remaining) {
      selected.push(food.name);
      remaining -= food.calories;
    }
    if (remaining < 50) break;
  }
  // If remaining > 50 and no more items fit, add a note
  if (remaining > 50) {
    selected.push(`${Math.round(remaining)} cal extra (adjust portion or add fruit/nuts)`);
  }
  return { items: selected, calories: targetCal - remaining };
}

function generateAccuratePlan(goal) {
  // Ensure goal is within realistic range (e.g., 500-4000 for normal adult)
  let realisticGoal = Math.min(Math.max(goal, 500), 4000);
  if (goal > 4000) {
    console.warn(`Goal ${goal} exceeds realistic range, capping to 4000`);
  }
  // Distribute: breakfast 25%, lunch 35%, dinner 40% (adjustable)
  let breakfastTarget = Math.round(realisticGoal * 0.25);
  let lunchTarget = Math.round(realisticGoal * 0.35);
  let dinnerTarget = realisticGoal - breakfastTarget - lunchTarget;
  // Ensure minimum calories per meal
  breakfastTarget = Math.max(breakfastTarget, 200);
  lunchTarget = Math.max(lunchTarget, 300);
  dinnerTarget = Math.max(dinnerTarget, 300);
  // Readjust sum to match realisticGoal exactly (since rounding)
  const total = breakfastTarget + lunchTarget + dinnerTarget;
  if (total !== realisticGoal) {
    // Add difference to dinner (or largest meal)
    dinnerTarget += (realisticGoal - total);
  }

  return {
    breakfast: buildMeal(breakfastTarget, 'breakfast'),
    lunch: buildMeal(lunchTarget, 'lunch'),
    dinner: buildMeal(dinnerTarget, 'dinner')
  };
}

router.post('/suggest', auth, async (req, res) => {
  let { goal } = req.body;
  if (!goal || goal < 500) {
    return res.status(400).json({ error: 'Goal must be at least 500 calories' });
  }
  // Convert to number and limit to max 4000 (realistic)
  goal = Number(goal);
  if (isNaN(goal)) return res.status(400).json({ error: 'Invalid goal' });
  
  // Cap unrealistic high goals
  const cappedGoal = Math.min(goal, 4000);
  if (goal > 4000) {
    console.log(`Goal ${goal} capped to 4000 for planning`);
  }

  // Try Gemini if key exists
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are a nutritionist. Suggest a one-day meal plan to reach exactly ${cappedGoal} calories.
Return ONLY valid JSON with this structure:
{
  "breakfast": { "items": ["food item 1", "food item 2"], "calories": number },
  "lunch": { "items": ["food item 1", "food item 2"], "calories": number },
  "dinner": { "items": ["food item 1", "food item 2"], "calories": number }
}
Make sure the sum of calories = ${cappedGoal}. Use realistic food items. Respond ONLY with JSON.`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const clean = text.replace(/```json|```/g, '').trim();
      const plan = JSON.parse(clean);
      return res.json(plan);
    } catch (err) {
      console.warn('Gemini failed, using rule-based:', err.message);
    }
  }

  // Rule-based planner (accurate, capped)
  const plan = generateAccuratePlan(cappedGoal);
  res.json(plan);
});

export default router;