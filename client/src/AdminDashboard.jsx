import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, Gift, Heart, Send } from 'lucide-react';
import axios from 'axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, prizePool: 0 });
  const [isDrawing, setIsDrawing] = useState(false);

  // PRD Requirement: Access Reports & Analytics [cite: 39]
  useEffect(() => {
    const fetchAdminStats = async () => {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      setStats({ users: count || 0, prizePool: (count || 0) * 4 }); // Simple 40% logic [cite: 70]
    };
    fetchAdminStats();
  }, []);

  // PRD Requirement: Configure & Run Draws [cite: 36, 102]
  const runMonthlyDraw = async () => {
    setIsDrawing(true);
    try {
      const res = await axios.post('http://localhost:5000/api/admin/run-draw');
      alert(`Draw Published! Winning Numbers: ${res.data.winningNumbers.join(', ')}`);
    } catch (err) {
      alert("Draw failed. Check server connection.");
    } finally {
      setIsDrawing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center gap-4 mb-12">
          <div className="bg-blue-500/20 p-3 rounded-2xl border border-blue-500/50">
            <ShieldCheck className="text-blue-500" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter italic">ADMIN CONTROL</h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Platform Management Terminal</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard icon={<Users size={20}/>} label="Total Subscribers" value={stats.users} />
          <StatCard icon={<Gift size={20}/>} label="Current Prize Pool" value={`$${stats.prizePool}`} />
          <StatCard icon={<Heart size={20}/>} label="Charity Impact" value={`$${stats.users * 1}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Draw Management Module [cite: 102] */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8">
            <h2 className="text-xl font-black mb-2 uppercase italic">Monthly Draw Engine</h2>
            <p className="text-zinc-500 text-sm mb-8">Execute the 5-number match algorithm for the current cycle[cite: 53, 61].</p>
            
            <button 
              onClick={runMonthlyDraw}
              disabled={isDrawing}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <Send size={18} /> {isDrawing ? 'PROCESSING DRAW...' : 'RUN & PUBLISH DRAW'}
            </button>
          </section>

          {/* Charity Management Module [cite: 106] */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8">
            <h2 className="text-xl font-black mb-2 uppercase italic">Charity Directory</h2>
            <p className="text-zinc-500 text-sm mb-8">Add or spotlight verified charitable organizations[cite: 83, 107].</p>
            <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-black py-4 rounded-2xl border border-zinc-700 transition-all">
              MANAGE LISTINGS
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-3xl">
      <div className="text-blue-500 mb-4">{icon}</div>
      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black italic">{value}</p>
    </div>
  );
}