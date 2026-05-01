import { motion } from 'framer-motion';

export default function Skeleton() {
  return (
    <div className="space-y-3">
      {[1,2,3].map(i => (
        <div key={i} className="glass-card p-4">
          <div className="flex justify-between">
            <div className="space-y-2 flex-1">
              <motion.div className="h-4 bg-slate-200 rounded w-3/4" animate={{ opacity: [0.5,1,0.5] }} transition={{ repeat: Infinity, duration: 1.5, delay: i*0.1 }} />
              <motion.div className="h-3 bg-slate-100 rounded w-1/2" animate={{ opacity: [0.5,1,0.5] }} transition={{ repeat: Infinity, duration: 1.5, delay: i*0.15 }} />
            </div>
            <motion.div className="w-12 h-6 bg-slate-200 rounded" animate={{ opacity: [0.5,1,0.5] }} transition={{ repeat: Infinity, duration: 1.5, delay: i*0.2 }} />
          </div>
        </div>
      ))}
    </div>
  );
}