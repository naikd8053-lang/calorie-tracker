import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { LogOut, CloudSun, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const initial = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-card sticky top-0 z-30 px-5 py-3 flex justify-between items-center mx-4 mt-2"
    >
      <Link to="/dashboard" className="flex items-center gap-2 group">
        <CloudSun className="text-sky-500 group-hover:scale-110 transition-transform" size={28} />
        <span className="text-xl font-bold premium-gradient-text">CalorieTracker</span>
      </Link>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 bg-white/60 rounded-full pl-2 pr-3 py-1 border border-white/40 hover:bg-white/80 transition"
        >
          <div className="w-8 h-8 rounded-full premium-gradient flex items-center justify-center text-white font-semibold text-sm">
            {initial}
          </div>
          <ChevronDown size={16} className="text-slate-500" />
        </button>
        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 glass-card py-2 z-40 animate-scale-in">
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="text-sm font-medium truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        )}
      </div>
    </motion.nav>
  );
}