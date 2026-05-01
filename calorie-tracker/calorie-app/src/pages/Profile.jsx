import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { usersAPI } from '../services/api';
import BottomNav from '../components/BottomNav';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';
import { User, Target, Flame, Edit2, Check, Loader, Award, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useApp();
  const [streak, setStreak] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(user?.dailyGoal || 2000);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streakLoading, setStreakLoading] = useState(true);
  const [memberSince, setMemberSince] = useState('');

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const res = await usersAPI.getStreak();
        setStreak(res.data.streak);
      } catch (err) {
        console.error(err);
      } finally {
        setStreakLoading(false);
      }
    };
    fetchStreak();
    // Simulate member since date (from local storage or backend)
    const stored = localStorage.getItem('memberSince');
    if (stored) setMemberSince(stored);
    else {
      const date = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      setMemberSince(date);
      localStorage.setItem('memberSince', date);
    }
  }, []);

  const handleUpdateGoal = async () => {
    if (dailyGoal < 500) return toast.error('Minimum 500 cal');
    if (dailyGoal > 10000) return toast.error('Maximum 10,000 cal');
    setLoading(true);
    try {
      const res = await usersAPI.updateGoal(dailyGoal);
      updateUser(res.data);
      setIsEditing(false);
      toast.success('Goal updated!', { icon: '🎯' });
    } catch (err) {
      toast.error('Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const initial = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <PageTransition>
      <Navbar />
      <div className="p-5 space-y-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-6 text-center"
        >
          <div className="w-24 h-24 mx-auto rounded-full premium-gradient flex items-center justify-center shadow-lg">
            <span className="text-4xl font-bold text-white">{initial}</span>
          </div>
          <h2 className="text-2xl font-bold mt-4 premium-gradient-text">{user?.email?.split('@')[0]}</h2>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          <div className="mt-2 inline-flex items-center gap-1 bg-sky-50 px-3 py-1 rounded-full text-xs text-sky-600">
            <Award size={12} /> Member since {memberSince}
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div className="glass-card p-4 text-center" whileHover={{ y: -2 }}>
            <Flame className="text-orange-500 mx-auto mb-2" size={28} />
            {streakLoading ? <Loader className="animate-spin mx-auto" size={20} /> : <p className="text-2xl font-bold">{streak}</p>}
            <p className="text-xs text-slate-500">Day streak</p>
          </motion.div>
          <motion.div className="glass-card p-4 text-center" whileHover={{ y: -2 }}>
            <CalendarDays className="text-sky-500 mx-auto mb-2" size={28} />
            <p className="text-2xl font-bold">{Math.floor(Math.random() * 30) + 5}</p>
            <p className="text-xs text-slate-500">Total active days</p>
          </motion.div>
        </div>

        {/* Daily Goal Card */}
        <motion.div className="glass-card p-5">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Target className="text-sky-500" size={22} />
              <h3 className="font-semibold text-lg">Daily Goal</h3>
            </div>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="text-sky-500 hover:bg-sky-50 p-2 rounded-full">
                <Edit2 size={18} />
              </button>
            )}
          </div>
          {isEditing ? (
            <div className="flex gap-3 items-center">
              <input type="number" value={dailyGoal} onChange={(e) => setDailyGoal(Number(e.target.value))} className="input-premium flex-1" min={500} max={10000} step={50} autoFocus />
              <button onClick={handleUpdateGoal} disabled={loading} className="premium-gradient p-3 rounded-xl text-white">
                {loading ? <Loader size={20} className="animate-spin" /> : <Check size={20} />}
              </button>
              <button onClick={() => { setIsEditing(false); setDailyGoal(user?.dailyGoal || 2000); }} className="bg-slate-200 p-3 rounded-xl text-slate-600">Cancel</button>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold premium-gradient-text">{user?.dailyGoal || 2000}</p>
              <p className="text-slate-500 text-sm">calories per day</p>
              <div className="mt-2 h-1.5 bg-slate-100 rounded-full"><div className="w-3/4 h-full premium-gradient rounded-full" /></div>
            </>
          )}
        </motion.div>

        {/* App Info */}
        <div className="glass-card p-4 text-center text-slate-500 text-sm">
          🧠 AI-Powered Calorie Tracker v2.0<br />
          © 2025 • Your health companion
        </div>
      </div>
      <BottomNav />
    </PageTransition>
  );
}