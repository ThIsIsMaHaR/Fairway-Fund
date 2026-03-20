import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard'; 
import Auth from './components/Auth';
// Try importing WITHOUT the 'components' folder first to see if it's in src/
import AdminLogin from './AdminLogin'; 

function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState('user');

  useEffect(() => {
    // 1. Immediate Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchRole(session.user.id);
    });

    // 2. Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchRole(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId) => {
    const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (data) setRole(data.role);
  };

  return (
    <div className="App">
      <Routes>
        {/* Main User Entry */}
        <Route path="/" element={!session ? <Auth /> : <Navigate to="/dashboard" />} />
        
        {/* Admin Specific Entry */}
        <Route path="/admin-portal" element={!session ? <AdminLogin /> : (role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />)} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={session ? <Dashboard user={session.user} /> : <Navigate to="/" />} />
        <Route path="/admin" element={(session && role === 'admin') ? <AdminDashboard /> : <Navigate to="/admin-portal" />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;