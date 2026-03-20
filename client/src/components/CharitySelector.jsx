import React from 'react';
import { motion } from 'framer-motion';
import { Heart, CheckCircle2 } from 'lucide-react';

const charities = [
  { id: 'ocean-1', name: 'Ocean CleanUp', desc: 'Removing plastic from the seas.', icon: '🌊' },
  { id: 'green-2', name: 'Green Earth', desc: 'Reforestation & wildlife.', icon: '🌳' },
  { id: 'water-3', name: 'Water.org', desc: 'Safe water for families.', icon: '💧' }
];

export default function CharitySelector({ selectedId, onSelect }) {
  return (
    <div className="space-y-4">
      <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
        <Heart size={16} className="text-red-500" /> Select Your Cause
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {charities.map((c) => (
          <motion.div
            key={c.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(c.id)}
            className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
              selectedId === c.id 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{c.icon}</span>
              <div>
                <p className="font-bold text-white">{c.name}</p>
                <p className="text-zinc-500 text-xs">{c.desc}</p>
              </div>
            </div>
            {selectedId === c.id && <CheckCircle2 className="text-blue-500" size={20} />}
          </motion.div>
        ))}
      </div>
    </div>
  );
}