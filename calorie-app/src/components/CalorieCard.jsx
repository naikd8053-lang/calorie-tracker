import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react'; // ← import from React

export default function CalorieCard({ consumed, goal }) {
  const percentage = Math.min(100, (consumed / goal) * 100);
  const remaining = Math.max(0, goal - consumed);
  const [displayRemaining, setDisplayRemaining] = useState(remaining);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayRemaining(remaining), 50);
    return () => clearTimeout(timer);
  }, [remaining]);

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="glass-card p-5 flex items-center gap-5"
    >
      <div className="w-28 h-28">
        <CircularProgressbar
          value={percentage}
          text={`${Math.round(percentage)}%`}
          styles={buildStyles({
            textSize: '24px',
            pathColor: 'url(#ringGradient)',
            trailColor: '#e2e8f0',
            textColor: '#0ea5e9',
            pathTransition: 'stroke-dashoffset 0.5s ease 0s'
          })}
        />
        <svg width="0" height="0">
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div>
        <p className="text-slate-500 text-sm">Remaining</p>
        <motion.p
          key={displayRemaining}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl font-bold premium-gradient-text"
        >
          {displayRemaining}
        </motion.p>
        <p className="text-sm text-slate-500">of {goal} cal</p>
        <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full premium-gradient"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
}