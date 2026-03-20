import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Target } from 'lucide-react';

export default function ScoreEntry({ onAddScore }) {
  const [score, setScore] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (score >= 1 && score <= 45) {
      onAddScore(score);
      setScore('');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-500/10 p-2 rounded-lg">
          <Target className="text-blue-500" size={24} />
        </div>
        <h2 className="text-xl font-bold text-white">Post New Score</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-zinc-500 text-sm mb-2 block">Stableford Points (1-45)</label>
          <input 
            type="number" 
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="Enter score..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
          />
        </div>
        
        <button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          Update Rolling 5 <Send size={18} />
        </button>
      </form>
    </motion.div>
  );
}