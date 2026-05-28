import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BookOpen, BarChart2, User, Calendar } from 'lucide-react';

export default function BottomNav() {
  const links = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/diary', icon: BookOpen, label: 'Diary' },
    { to: '/progress', icon: BarChart2, label: 'Progress' },
    { to: '/planner', icon: Calendar, label: 'Plan' },
    { to: '/profile', icon: User, label: 'Profile' }
  ];
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="glass-card fixed bottom-4 left-4 right-4 flex justify-around py-2 z-10"
    >
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center p-2 rounded-xl transition-all ${
              isActive ? 'text-sky-600 bg-sky-50' : 'text-gray-500'
            }`
          }
        >
          {({ isActive }) => (
            <motion.div whileTap={{ scale: 0.9 }}>
              <Icon size={24} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-xs mt-1">{label}</span>
            </motion.div>
          )}
        </NavLink>
      ))}
    </motion.div>
  );
}