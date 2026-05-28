import axios from 'axios';

const BASE_URL = 'https://world.openfoodfacts.org/cgi/search.pl';

/**
 * Search Open Food Facts for a product
 * @param {string} productName - e.g., "Coca-Cola", "Lays chips"
 * @returns {Promise<Object|null>} - Returns { name, caloriesPer100g, protein, fat, carbs } or null
 */
export async function searchOpenFoodFacts(productName) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        search_terms: productName,
        search_simple: 1,
        action: 'process',
        json: 1,
        page_size: 1
      },
      timeout: 5000
    });

    const products = response.data.products;
    if (!products || products.length === 0) return null;

    const product = products[0];
    const nutriments = product.nutriments || {};

    // Extract per 100g values
    const caloriesPer100g = nutriments['energy-kcal_100g'] || nutriments['energy_100g'] || 0;
    const protein = nutriments['proteins_100g'] || 0;
    const fat = nutriments['fat_100g'] || 0;
    const carbs = nutriments['carbohydrates_100g'] || 0;

    if (caloriesPer100g === 0) return null;

    return {
      name: product.product_name || productName,
      caloriesPer100g: Math.round(caloriesPer100g),
      protein: Math.round(protein),
      fat: Math.round(fat),
      carbs: Math.round(carbs),
      source: 'Open Food Facts'
    };
  } catch (error) {
    console.error(`Open Food Facts error for "${productName}":`, error.message);
    return null;
  }
}

/**
 * Calculate calories for a given weight (grams) using Open Food Facts data
 * @param {string} productName 
 * @param {number} grams 
 * @returns {Promise<Object|null>}
 */
export async function getCaloriesFromOpenFoodFacts(productName, grams) {
  const foodData = await searchOpenFoodFacts(productName);
  if (!foodData) return null;

  const multiplier = grams / 100;
  return {
    name: foodData.name,
    quantity: `${grams}g`,
    calories: Math.round(foodData.caloriesPer100g * multiplier),
    protein: Math.round(foodData.protein * multiplier),
    fat: Math.round(foodData.fat * multiplier),
    carbs: Math.round(foodData.carbs * multiplier),
    source: 'Open Food Facts'
  };
}