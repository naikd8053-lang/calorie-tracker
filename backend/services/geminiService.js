import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const NUTRITION_PROMPT = `You are a nutrition expert. Analyze the meal description and return ONLY valid JSON with this structure:
{
  "foods": [
    {
      "name": "food name",
      "estimated_calories": number,
      "protein_g": number,
      "fat_g": number,
      "carbs_g": number
    }
  ],
  "total_calories": number
}
Use realistic values. Respond ONLY with JSON, no extra text.

Meal description: `;

export const analyzeMealWithGemini = async (mealDescription) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(NUTRITION_PROMPT + mealDescription);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw new Error("Failed to analyze meal with Gemini");
  }
};