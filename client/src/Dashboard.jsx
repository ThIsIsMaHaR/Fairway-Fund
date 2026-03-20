import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { supabase } from './supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Activity, LogOut, User, Zap, Star, 
  CheckCircle2, Heart, Download, TrendingUp, UploadCloud, ShieldCheck 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import ScoreEntry from './components/ScoreEntry';
import CharitySelector from './components/CharitySelector';
import confetti from 'canvas-confetti';

export default function Dashboard({ user }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [role, setRole] = useState('user'); 
  const [winningRecord, setWinningRecord] = useState(null); 
  const navigate = useNavigate(); 
  
  const userId = user?.id; 

  const totalImpact = scores.reduce((acc, curr) => acc + curr.score_value, 0);

  const chartData = [...scores].reverse().map(s => ({
    date: new Date(s.date_played).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: s.score_value
  }));

  // --- CORE SYSTEM: SYNC STATUS, ROLE & WINNINGS ---
  useEffect(() => {
    const syncStatus = async () => {
      if (!userId) return;
      const query = new URLSearchParams(window.location.search);
      
      // 1. Fetch User Profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_subscriber, role')
        .eq('id', userId)
        .single();
      
      if (profile) {
        console.log("✅ ROLE FETCHED FROM SUPABASE:", profile.role);
        setRole(profile.role);
        if (profile.is_subscriber) setIsPro(true);
      } else {
        console.error("❌ ERROR FETCHING ROLE:", error);
      }

      // 2. Handle Payment Success Redirect
      if (query.get('payment') === 'success') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_subscriber: true, subscription_status: 'active' })
          .eq('id', userId);

        if (!updateError) {
          setIsPro(true);
          navigate("/dashboard", { replace: true });
        }
      }
    };

    const checkWinnings = async () => {
      const { data } = await supabase
        .from('winners')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .single();
      if (data) setWinningRecord(data);
    };

    if (userId) {
      syncStatus();
      checkWinnings();
    }
  }, [userId, navigate]);

  // --- DATA FETCHING ---
  const fetchScores = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/scores/${userId}`);
      setScores(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching scores", err);
    }
  };

  useEffect(() => { fetchScores(); }, [userId]);

  // --- HANDLERS ---
  const uploadProof = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('proof-screenshots')
      .upload(fileName, file);

    if (data) {
      const { data: { publicUrl } } = supabase.storage.from('proof-screenshots').getPublicUrl(fileName);
      await supabase.from('winners').update({ proof_image_url: publicUrl }).eq('id', winningRecord.id);
      alert("Verification proof submitted!");
      setWinningRecord(null);
    }
  };

  const handleAddScore = async (scoreValue) => {
    if (!selectedCharity) return alert("Please select a charity first!");
    const score = parseInt(scoreValue);
    if (isNaN(score) || score < 1 || score > 45) return alert("Score must be between 1 and 45.");

    try {
      await axios.post('http://localhost:5000/api/scores/add', {
        userId, scoreValue: score, datePlayed: new Date().toISOString().split('T')[0]
      });
      if (score >= 35) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      fetchScores(); 
    } catch (err) {
      alert("Error updating score.");
    }
  };

  const handlePayment = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/create-checkout-session', {
        userId: userId, email: user?.email, planType: 'monthly' 
      });
      if (response.data.url) window.location.href = response.data.url;
    } catch (err) {
      alert("Gateway Error: Check server connection.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto">
        
        {/* --- WINNER NOTIFICATION --- */}
        <AnimatePresence>
          {winningRecord && (
            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
              className="bg-blue-600 border border-white/20 p-6 rounded-[2.5rem] mb-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
              <div>
                <h3 className="text-white font-black italic text-xl uppercase tracking-tighter">Match Detected!</h3>
                <p className="text-blue-100 text-xs">Upload your screenshot to verify your reward.</p>
              </div>
              <label className="bg-white text-blue-600 font-black px-8 py-3 rounded-2xl cursor-pointer transition-all active:scale-95 text-xs uppercase tracking-widest flex items-center gap-2">
                <UploadCloud size={16} /> Upload Proof
                <input type="file" className="hidden" onChange={uploadProof} accept="image/*" />
              </label>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <motion.h1 initial={{ x: -20 }} animate={{ x: 0 }} className="text-5xl font-black tracking-tighter bg-gradient-to-r from-white via-zinc-400 to-zinc-600 bg-clip-text text-transparent italic">
            GOLF CHARITY
          </motion.h1>
          
          <div className="flex flex-wrap gap-4 items-center">
            {/* --- ADMIN TERMINAL BUTTON --- */}
            {role === 'admin' && (
              <button 
                onClick={() => navigate('/admin')} 
                className="bg-amber-500/20 border border-amber-500/50 text-amber-500 px-5 py-2.5 rounded-xl text-xs font-black uppercase hover:bg-amber-500 hover:text-black transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              >
                <ShieldCheck size={14} /> Admin Terminal
              </button>
            )}
            
            {isPro && (
              <div className="bg-blue-500/10 text-blue-400 text-[10px] px-4 py-2 rounded-xl border border-blue-500/30 flex items-center gap-2 font-bold uppercase tracking-widest">
                <Star size={12} fill="currentColor"/> Pro Member
              </div>
            )}
            <button onClick={() => supabase.auth.signOut()} className="bg-zinc-900 border border-zinc-800 px-5 py-2.5 rounded-xl text-xs font-bold uppercase hover:bg-red-500/10 transition-all">
              Logout
            </button>
          </div>
        </header>

        {/* REST OF YOUR DASHBOARD UI... */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            {!isPro && (
              <motion.div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[2rem] shadow-xl border border-white/10">
                <h4 className="font-black text-xl text-white mb-1 uppercase tracking-tighter">Go Professional</h4>
                <p className="text-blue-100 text-xs mb-6 italic">Unlock rewards & premium analytics.</p>
                <button onClick={handlePayment} className="w-full bg-white text-blue-700 font-black py-3.5 rounded-2xl hover:bg-zinc-100 transition-all">UPGRADE NOW</button>
              </motion.div>
            )}

            <CharitySelector selectedId={selectedCharity} onSelect={setSelectedCharity} />
            <div className="relative">
              <ScoreEntry onAddScore={handleAddScore} />
              {!selectedCharity && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-zinc-800/50">
                   <p className="text-amber-500 text-xs font-bold bg-zinc-950 px-4 py-2 rounded-full border border-amber-500/20 uppercase tracking-tight">Select Charity First</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-6 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-6 text-blue-500 font-black uppercase tracking-widest text-[10px]">
                <TrendingUp size={16} /> Performance Trend
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} domain={[1, 45]} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-6 backdrop-blur-md">
              <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-8">
                <Trophy size={16} className="text-yellow-500" /> Rolling 5 Leaderboard
              </h3>
              <div className="space-y-4">
                <AnimatePresence mode='popLayout'>
                  {scores.map((s, index) => (
                    <motion.div key={s.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl flex justify-between items-center group">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-zinc-950 flex items-center justify-center text-blue-500 font-black text-lg shadow-inner">{index + 1}</div>
                        <div>
                          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-tighter">Round Date</p>
                          <p className="font-bold text-zinc-200">{new Date(s.date_played).toDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-tighter">Stableford</p>
                        <p className="text-4xl font-black text-white italic tracking-tighter">{s.score_value}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}