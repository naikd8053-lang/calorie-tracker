import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLogs } from '../hooks/useLogs';
import MealCard from '../components/MealCard';
import FoodInput from '../components/FoodInput';
import BottomNav from '../components/BottomNav';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import Skeleton from '../components/Skeleton';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';

export default function Diary() {
  const { logs } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const { addLog, deleteLog, loading } = useLogs(dateStr);

  const meals = { breakfast: [], lunch: [], dinner: [] };
  logs.forEach(log => { if (meals[log.meal]) meals[log.meal].push(log); });

  const handleDateChange = (direction) => {
    if (direction === 'prev') setSelectedDate(subDays(selectedDate, 1));
    else setSelectedDate(addDays(selectedDate, 1));
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <PageTransition>
      <Navbar />
      <div className="p-5 space-y-4 pb-24">
        <div className="flex items-center justify-between">
          <button onClick={() => handleDateChange('prev')} className="p-2 rounded-full hover:bg-white/50">
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500 flex items-center gap-1 justify-center">
              <Calendar size={14} /> {format(selectedDate, 'EEEE')}
            </p>
            <p className="text-lg font-bold">{format(selectedDate, 'MMM d, yyyy')}</p>
          </div>
          <button onClick={() => handleDateChange('next')} disabled={isToday} className="p-2 rounded-full hover:bg-white/50 disabled:opacity-30">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {['breakfast', 'lunch', 'dinner'].map(meal => (
            <button
              key={meal}
              onClick={() => setSelectedMeal(meal)}
              className={`px-5 py-2 rounded-full capitalize font-medium transition-all ${
                selectedMeal === meal
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'bg-white/60 text-slate-600 hover:bg-white/80'
              }`}
            >
              {meal}
            </button>
          ))}
        </div>

        <FoodInput mealType={selectedMeal} onAdd={addLog} />

        {loading ? (
          <Skeleton />
        ) : (
          <>
            {Object.entries(meals).map(([meal, items]) => (
              <MealCard key={meal} meal={meal} items={items} onDelete={deleteLog} />
            ))}
            {logs.length === 0 && (
              <div className="text-center py-12 glass-card">
                <p className="text-slate-400">No meals logged for this day</p>
              </div>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </PageTransition>
  );
}