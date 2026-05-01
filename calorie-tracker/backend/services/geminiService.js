import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const NUTRITION_PROMPT = `
You are a precise nutrition analyzer. Given a meal description, return ONLY valid JSON with this exact structure:

{
  "foods": [
    { "name": "food item name", "estimated_calories": number }
  ],
  "total_calories": number
}

Rules:
- Estimate calories per serving (standard portion). For example, "2 roti" → 2 items each ~120 cal = 240 total.
- Use realistic calorie values based on typical Indian/western foods.
- If quantity not specified, assume 1 serving.
- Respond with ONLY the JSON, no additional text.

Meal description: `;

export const analyzeMealWithGemini = async (mealDescription) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // fast & cheap
    const result = await model.generateContent(NUTRITION_PROMPT + mealDescription);
    const responseText = result.response.text();
    // Remove any markdown code blocks if present
    const cleanJson = responseText.replace(/```json|```/g, '').trim();
    const nutritionData = JSON.parse(cleanJson);
    return nutritionData;
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw new Error("Failed to analyze meal with Gemini");
  }
};