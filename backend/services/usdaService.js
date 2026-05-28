import axios from 'axios';

const USDA_API_KEY = process.env.USDA_API_KEY;
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';

export async function getCaloriesFromUSDA(foodName, grams) {
  if (!USDA_API_KEY) return null;
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        api_key: USDA_API_KEY,
        query: foodName,
        pageSize: 1,
        dataType: ['Foundation', 'SR Legacy']
      },
      timeout: 5000
    });
    const food = response.data.foods?.[0];
    if (!food) return null;
    const nutrients = food.foodNutrients || [];
    const getNutrient = (id) => {
      const n = nutrients.find(n => n.nutrientId === id);
      return n ? n.value : 0;
    };
    const calPer100g = getNutrient(1008);
    if (calPer100g === 0) return null;
    const multiplier = grams / 100;
    return {
      name: food.description,
      quantity: `${grams}g`,
      calories: Math.round(calPer100g * multiplier),
      protein: Math.round(getNutrient(1003) * multiplier),
      fat: Math.round(getNutrient(1004) * multiplier),
      carbs: Math.round(getNutrient(1005) * multiplier),
      source: 'USDA'
    };
  } catch (err) {
    console.error('USDA error:', err.message);
    return null;
  }
}