import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseFoodInputAI } from '../utils/foodParser';
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
      const items = await parseFoodInputAI(text);
      await Promise.all(items.map(item =>
        onAdd({
          meal: mealType,
          name: item.name,
          quantity: item.quantity,
          calories: item.calories,
          date: today
        })
      ));
      toast.success(`${items.length} item${items.length !== 1 ? 's' : ''} added`, {
        icon: '✅',
        style: { background: '#fff', borderLeft: '4px solid #38bdf8' }
      });
      setText('');
    } catch (err) {
      toast.error('AI parsing failed. Please try again.', { icon: '⚠️' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="mb-6"
    >
      <div className="relative">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g., 2 roti + rice, or 'chicken sandwich'..."
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
      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
        <Sparkles size={12} /> AI-powered recognition
      </p>
    </motion.form>
  );
}