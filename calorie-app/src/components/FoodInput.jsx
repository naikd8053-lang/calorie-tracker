import { useState } from 'react';
import { motion } from 'framer-motion';
import { predictAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Sparkles, Loader2 } from 'lucide-react';

export default function FoodInput({ onAdd, mealType }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    try {
      const res = await predictAPI.getCalories(text, 'text');
      const foods = res.data.foods;
      for (const food of foods) {
        await onAdd({
          meal: mealType,
          name: food.name,
          quantity: food.quantity,
          calories: food.calories,
          protein: food.protein || 0,
          fat: food.fat || 0,
          carbs: food.carbs || 0,
          date: today
        });
      }
      // ✅ Updated toast message – clean and grammatically correct
      toast.success(`${foods.length} ${foods.length === 1 ? 'item added' : 'items added'}`);
      setText('');
    } catch (err) {
      toast.error('Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., 100g rice, 2 roti, or 'chicken sandwich'"
            className="input-premium w-full pr-24"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-1 top-1/2 -translate-y-1/2 premium-gradient text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 disabled:opacity-70"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            <span>{loading ? 'AI...' : 'Add'}</span>
          </button>
        </div>
      </form>
      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
        <Sparkles size={12} /> Numeric (100g rice) → Linear Regression | Natural language → Gemini AI
      </p>
    </motion.div>
  );
}