import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function MealCard({ meal, items, onDelete }) {
  const total = items.reduce((sum, i) => sum + i.calories, 0);
  const mealColors = {
    breakfast: 'bg-orange-500',
    lunch: 'bg-blue-500',
    dinner: 'bg-purple-500'
  };
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="glass-card p-4 mb-4"
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${mealColors[meal]}`} />
          <h3 className="capitalize font-semibold text-lg text-slate-800">{meal}</h3>
        </div>
        <span className="premium-gradient-text font-bold">{total} cal</span>
      </div>
      {items.length === 0 ? (
        <p className="text-slate-400 text-sm italic text-center py-4">Nothing logged yet</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="flex justify-between items-center py-2 border-b border-slate-100"
            >
              <div>
                <p className="font-medium text-slate-700">{item.name}</p>
                <p className="text-xs text-slate-400">{item.quantity}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600">{item.calories} cal</span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(item._id)}
                  disabled={deletingId === item._id}
                  className="text-slate-400 hover:text-red-500 transition"
                >
                  {deletingId === item._id ? (
                    <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}