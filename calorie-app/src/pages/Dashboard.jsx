import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLogs } from '../hooks/useLogs';
import CalorieCard from '../components/CalorieCard';
import BottomNav from '../components/BottomNav';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import Confetti from '../components/Confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, Coffee, Utensils, Sunset } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, logs } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const { loading } = useLogs(today);
  const total = logs.reduce((sum, l) => sum + l.calories, 0);
  const goal = user?.dailyGoal || 2000;
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (total >= goal && total > 0 && total !== goal) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      toast.success('Goal achieved! 🎉 Keep it up!', { icon: '🏆' });
    }
  }, [total, goal]);

  const navigate = useNavigate();
  const quickAddMeals = [
    { label: 'Breakfast', meal: 'breakfast', icon: Coffee },
    { label: 'Lunch', meal: 'lunch', icon: Utensils },
    { label: 'Dinner', meal: 'dinner', icon: Sunset }
  ];

  // Group today's meals
  const mealsMap = { breakfast: [], lunch: [], dinner: [] };
  logs.forEach(log => mealsMap[log.meal]?.push(log));

  return (
    <PageTransition>
      <Navbar />
      <div className="p-5 space-y-5 pb-24">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold premium-gradient-text">Dashboard</h2>
          <div className="text-sm text-slate-500">📅 {new Date().toDateString()}</div>
        </div>

        <CalorieCard consumed={total} goal={goal} />

        {/* Quick Add Row */}
        <div className="grid grid-cols-3 gap-3">
          {quickAddMeals.map(({ label, meal, icon: Icon }) => (
            <button
              key={meal}
              onClick={() => navigate('/diary', { state: { selectedMeal: meal } })}
              className="glass-card py-3 flex flex-col items-center gap-1 hover:scale-105 transition-transform"
            >
              <Icon size={22} className="text-sky-500" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp size={18} className="text-sky-500" />
              Today's Meals
            </h3>
            <button onClick={() => navigate('/diary')} className="text-xs text-sky-500 hover:underline">
              View all
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Utensils size={32} className="mx-auto mb-2 opacity-50" />
              <p>No meals logged today</p>
              <button onClick={() => navigate('/diary')} className="mt-2 btn-secondary text-sm px-4 py-2">
                Add your first meal
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {['breakfast', 'lunch', 'dinner'].map(meal => {
                const items = mealsMap[meal];
                if (!items || items.length === 0) return null;
                const totalCal = items.reduce((sum, i) => sum + i.calories, 0);
                return (
                  <div key={meal} className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="capitalize font-medium text-slate-600">{meal}</span>
                    <span className="text-sm text-slate-500">{items.length} item(s)</span>
                    <span className="font-semibold text-sky-600">{totalCal} cal</span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Motivational Quote */}
        <div className="glass-card p-4 text-center">
          <p className="text-sm text-slate-500 italic">"The only bad workout is the one that didn't happen."</p>
        </div>
      </div>
      <BottomNav />
      <Confetti active={showConfetti} />
    </PageTransition>
  );
}