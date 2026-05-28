import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { predictAPI, logsAPI } from '../services/api';
import BottomNav from '../components/BottomNav';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';
import { Loader2, Utensils, Coffee, Sun, Moon, Plus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MealPlanner() {
  const { user, logs, setLogs } = useApp();
  const [goal, setGoal] = useState(user?.dailyGoal || 2000);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addingMeal, setAddingMeal] = useState(null);

  const generatePlan = async () => {
    setLoading(true);
    setPlan(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/planner/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ goal })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Server error');
      }
      const data = await res.json();
      setPlan(data);
      toast.success('Meal plan generated!');
    } catch (err) {
      console.error('Planner error:', err);
      toast.error(err.message || 'Failed to generate plan. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const addMealToDiary = async (mealType, items, plannedCalories) => {
    setAddingMeal(mealType);
    const today = new Date().toISOString().split('T')[0];
    let addedCount = 0;
    try {
      for (const itemName of items) {
        // Use your existing prediction API to get accurate calories (USDA + fallback)
        const res = await predictAPI.getCalories(itemName, 'text');
        const food = res.data.foods[0];
        if (food && food.calories) {
          const newLog = {
            meal: mealType,
            name: food.name,
            quantity: food.quantity || '1 serving',
            calories: food.calories,
            protein: food.protein || 0,
            fat: food.fat || 0,
            carbs: food.carbs || 0,
            date: today
          };
          await logsAPI.create(newLog);
          addedCount++;
        } else {
          console.warn(`Could not get calories for: ${itemName}`);
        }
      }
      toast.success(`Added ${addedCount} item(s) to ${mealType}`);
      // Optionally refresh logs – you can call a global refresh function if needed
    } catch (err) {
      console.error(`Failed to add ${mealType}:`, err);
      toast.error(`Failed to add some items to ${mealType}`);
    } finally {
      setAddingMeal(null);
    }
  };

  const mealIcons = { breakfast: Coffee, lunch: Sun, dinner: Moon };
  const mealColors = {
    breakfast: 'from-orange-400 to-amber-500',
    lunch: 'from-blue-500 to-indigo-600',
    dinner: 'from-purple-500 to-pink-500'
  };

  return (
    <PageTransition>
      <Navbar />
      <div className="p-5 space-y-5 pb-24">
        <h2 className="text-2xl font-bold premium-gradient-text">Meal Planner</h2>
        <div className="glass-card p-4 flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="text-sm text-slate-500">Your daily calorie goal</label>
            <input
              type="number"
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              className="input-premium w-full mt-1"
              min={500}
              max={5000}
              step={50}
            />
          </div>
          <button
            onClick={generatePlan}
            disabled={loading}
            className="premium-gradient px-6 py-2 rounded-xl text-white font-medium disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? <Loader2 className="animate-spin inline mr-1" size={18} /> : null}
            {loading ? 'Generating...' : 'Generate Plan'}
          </button>
        </div>

        {loading && (
          <div className="glass-card p-8 text-center">
            <Loader2 className="animate-spin mx-auto mb-2 text-sky-500" size={32} />
            <p className="text-slate-500">AI is creating your personalized meal plan...</p>
          </div>
        )}

        {plan && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {['breakfast', 'lunch', 'dinner'].map((meal) => {
              const Icon = mealIcons[meal];
              const data = plan[meal];
              if (!data || !data.items || data.items.length === 0) return null;
              return (
                <div key={meal} className="glass-card overflow-hidden">
                  <div className={`bg-gradient-to-r ${mealColors[meal]} px-4 py-2 text-white flex justify-between items-center`}>
                    <div className="flex items-center gap-2">
                      <Icon size={20} />
                      <h3 className="capitalize font-bold text-lg">{meal}</h3>
                    </div>
                    <span className="font-medium">{data.calories} cal</span>
                  </div>
                  <div className="p-4">
                    <ul className="list-disc list-inside text-slate-600 text-sm space-y-1 mb-3">
                      {data.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                    <button
                      onClick={() => addMealToDiary(meal, data.items, data.calories)}
                      disabled={addingMeal === meal}
                      className="flex items-center gap-1 text-sm bg-sky-50 text-sky-600 px-3 py-1.5 rounded-full hover:bg-sky-100 transition disabled:opacity-50"
                    >
                      {addingMeal === meal ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Plus size={14} />
                      )}
                      <span>{addingMeal === meal ? 'Adding...' : `Add to ${meal}`}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {!plan && !loading && (
          <div className="glass-card p-8 text-center text-slate-400">
            <Utensils size={40} className="mx-auto mb-2 opacity-50" />
            <p>Click "Generate Plan" to get AI-powered meal suggestions.</p>
            <p className="text-xs mt-1">Based on your daily goal of {goal} calories</p>
          </div>
        )}
      </div>
      <BottomNav />
    </PageTransition>
  );
}