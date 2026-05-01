import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BookOpen, BarChart2, User } from 'lucide-react';

export default function BottomNav() {
  const links = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/diary', icon: BookOpen, label: 'Diary' },
    { to: '/progress', icon: BarChart2, label: 'Progress' },
    { to: '/profile', icon: User, label: 'Profile' }
  ];
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="glass-card fixed bottom-4 left-4 right-4 flex justify-around py-2 z-20 shadow-2xl"
    >
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${
              isActive ? 'text-sky-600 bg-sky-50/80' : 'text-slate-500 hover:text-sky-400'
            }`
          }
        >
          {({ isActive }) => (
            <motion.div whileTap={{ scale: 0.9 }} whileHover={{ y: -2 }} className="relative">
              <Icon size={24} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[11px] mt-1 font-medium">{label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sky-500"
                />
              )}
            </motion.div>
          )}
        </NavLink>
      ))}
    </motion.div>
  );
}