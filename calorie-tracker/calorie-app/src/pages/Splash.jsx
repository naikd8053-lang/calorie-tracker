import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';

export default function Splash() {
  const { token, loading } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      navigate(token ? '/dashboard' : '/login');
    }
  }, [loading, token, navigate]);

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-5xl font-bold bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent"
      >
        CalorieTracker
      </motion.div>
    </div>
  );
}