import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Mail } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    // Role verification for Section 13/15 Compliance
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profile?.role === 'admin') {
      navigate('/admin'); 
    } else {
      await supabase.auth.signOut();
      alert("⚠️ ACCESS DENIED: Authorized Personnel Only.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-4 bg-amber-500/10 rounded-full mb-4">
            <ShieldAlert className="text-amber-500" size={32} />
          </div>
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">Admin Terminal</h1>
          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-1">Digital Heroes Platform Control</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input 
              type="email" placeholder="Admin Email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-2xl py-4 pl-12 text-sm text-white focus:border-amber-500 outline-none transition-all placeholder:text-zinc-700"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input 
              type="password" placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-2xl py-4 pl-12 text-sm text-white focus:border-amber-500 outline-none transition-all placeholder:text-zinc-700"
              required
            />
          </div>
          <button 
            type="submit" disabled={loading}
            className="w-full bg-amber-500 text-black font-black py-4 rounded-2xl hover:bg-amber-400 transition-all uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(245,158,11,0.2)] active:scale-95"
          >
            {loading ? 'Authorizing...' : 'Unlock Terminal'}
          </button>
        </form>
      </div>
    </div>
  );
}