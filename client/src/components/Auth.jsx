import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, AlertCircle } from 'lucide-react';

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    try {
      const { data, error } = isLogin 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (error) {
        // This catches the 400 error and displays the specific reason
        setErrorMsg(error.message);
      } else if (data.user) {
        // Success!
        onAuthSuccess(data.user);
      } else if (!isLogin) {
        alert("Check your email for a confirmation link (if enabled)!");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl"
      >
        <div className="text-center mb-8">
          <motion.div
            key={isLogin ? 'login-icon' : 'signup-icon'}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-500"
          >
            {isLogin ? <LogIn size={28} /> : <UserPlus size={28} />}
          </motion.div>
          <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Golf Charity Platform</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <AnimatePresence>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold"
              >
                <AlertCircle size={14} /> {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-4 top-4 text-zinc-600" size={18} />
            <input 
              type="email" placeholder="Email Address" 
              className="w-full bg-black border border-zinc-800 rounded-2xl p-4 pl-12 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              onChange={(e) => setEmail(e.target.value)} required 
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-zinc-600" size={18} />
            <input 
              type="password" placeholder="Password" 
              className="w-full bg-black border border-zinc-800 rounded-2xl p-4 pl-12 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              onChange={(e) => setPassword(e.target.value)} required 
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20 mt-2"
          >
            {loading ? 'PROCESSING...' : isLogin ? 'SIGN IN' : 'JOIN NOW'}
          </button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-zinc-800/50">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-tight">
            {isLogin ? "New to the platform?" : "Already a member?"}
            <button 
              onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
              className="text-blue-500 ml-2 hover:text-blue-400 transition-colors"
            >
              {isLogin ? 'CREATE ACCOUNT' : 'LOG IN'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}