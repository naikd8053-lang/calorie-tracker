import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight, CloudSun, Users } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.email.split('@')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Demo users for quick testing
  const demoUsers = [
    { email: 'alice@example.com', password: '123456', name: 'Alice' },
    { email: 'bob@example.com', password: '123456', name: 'Bob' },
    { email: 'charlie@example.com', password: '123456', name: 'Charlie' },
  ];

  const loginAsDemo = async (demoEmail, demoPassword) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email: demoEmail, password: demoPassword });
      login(res.data.user, res.data.token);
      toast.success(`Logged in as ${demoEmail.split('@')[0]}`);
      navigate('/dashboard');
    } catch (err) {
      // If demo user doesn't exist, register first
      if (err.response?.status === 400) {
        try {
          await authAPI.register({ email: demoEmail, password: demoPassword });
          const loginRes = await authAPI.login({ email: demoEmail, password: demoPassword });
          login(loginRes.data.user, loginRes.data.token);
          toast.success(`Created & logged in as ${demoEmail.split('@')[0]}`);
          navigate('/dashboard');
        } catch (regErr) {
          toast.error('Could not create demo user');
        }
      } else {
        toast.error('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-100 p-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 w-full max-w-md"
      >
        <div className="text-center mb-6">
          <CloudSun size={48} className="mx-auto text-sky-500" />
          <h1 className="text-3xl font-bold premium-gradient-text mt-3">Welcome Back</h1>
          <p className="text-gray-500 mt-1">Sign in to track your meals</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-premium w-full pl-10"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-premium w-full pl-10"
              required
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="premium-gradient w-full py-3 rounded-xl text-white font-bold shadow-md sky-glow flex items-center justify-center gap-2"
          >
            {loading ? 'Signing in...' : <>Sign In <ArrowRight size={18} /></>}
          </motion.button>
        </form>

        {/* Demo Users Section */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-400">Quick Demo Users</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {demoUsers.map((user) => (
              <button
                key={user.email}
                onClick={() => loginAsDemo(user.email, user.password)}
                disabled={loading}
                className="text-sm bg-sky-50 hover:bg-sky-100 text-sky-700 py-2 rounded-lg transition flex items-center justify-center gap-1"
              >
                <Users size={14} />
                {user.name}
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-3">
            Click any demo user – auto creates account if needed
          </p>
        </div>

        <p className="text-center mt-6 text-gray-500">
          New here?{' '}
          <Link to="/register" className="text-sky-600 font-semibold hover:underline">
            Create account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}