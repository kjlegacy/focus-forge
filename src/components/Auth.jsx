import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { GiAnvil, GiFireBowl } from 'react-icons/gi';

/**
 * Auth Component
 * Premium iOS Welcome Screen using the "Shadow Email" strategy.
 */
export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Shadow Email Logic: Append constant suffix for GDPR/Privacy
    const shadowEmail = `${username.toLowerCase().trim()}@focusforge.com`;

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: shadowEmail,
          password: password,
          options: {
            data: {
              username: username
            }
          }
        });
        if (signUpError) throw signUpError;
        alert("Smith profile created! You can now ignite your first forge.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: shadowEmail,
          password: password,
        });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'Forging failed. Identity not recognized.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-8 relative overflow-hidden select-none antialiased">

      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-orange-950/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm flex flex-col items-center z-10"
      >
        {/* VERCEL DEPLOYMENT WARNING */}
        {!import.meta.env.VITE_SUPABASE_URL && (
          <div className="w-full max-w-sm bg-red-950/40 border-2 border-red-600/50 p-6 rounded-3xl mb-8 flex flex-col items-center text-center shadow-[0_0_50px_rgba(220,38,38,0.2)] backdrop-blur-md">
            <h2 className="text-red-500 font-black uppercase tracking-[0.2em] mb-3 text-sm italic">System Vault Locked</h2>
            <p className="text-zinc-300 text-[10px] uppercase font-bold tracking-widest leading-relaxed">
              Vercel Deployment Detected.
              <br/><br/>
              Supabase Environment Variables are missing from your Vercel Project Settings.
              <br/><br/>
              To forge ahead: Add <span className="text-white">VITE_SUPABASE_URL</span> and <span className="text-white">VITE_SUPABASE_ANON_KEY</span> to Vercel and redeploy.
            </p>
          </div>
        )}
        <div className="mb-10 relative">
          <GiAnvil size={120} className="text-orange-600 drop-shadow-[0_0_30px_rgba(234,88,12,0.4)]" />
          <motion.div
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute -top-4 -right-4"
          >
            <GiFireBowl size={35} className="text-orange-900" />
          </motion.div>
        </div>

        <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase text-center mb-2 leading-none">
          {isSignUp ? "Join the Forge" : "The Vault Entry"}
        </h1>
        <p className="text-zinc-600 text-[11px] uppercase font-black tracking-[0.5em] mb-12 italic opacity-60">
          Smithing Protocol 1.0
        </p>

        <form onSubmit={handleAuth} className="w-full space-y-4">
          <div className="space-y-2">
            <label className="text-zinc-700 text-[9px] uppercase font-black tracking-[0.3em] pl-4">Smith Name</label>
            <input
              type="text"
              required
              disabled={loading}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-zinc-950/50 border border-zinc-900 rounded-3xl py-4 px-6 text-white text-sm outline-none focus:border-orange-900 transition-all uppercase italic placeholder:text-zinc-800"
              placeholder="Username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-zinc-700 text-[9px] uppercase font-black tracking-[0.3em] pl-4">Security Key</label>
            <input
              type="password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950/50 border border-zinc-900 rounded-3xl py-4 px-6 text-white text-sm outline-none focus:border-orange-900 transition-all placeholder:text-zinc-800"
              placeholder="••••••••"
            />
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-red-950/10 border border-red-900/20 p-4 rounded-2xl text-red-600 text-[10px] font-black text-center uppercase tracking-widest italic"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-900 py-[1.25rem] rounded-3xl text-black font-black uppercase text-xs tracking-widest shadow-[0_0_30px_#ea580c33] transition-all active:scale-[0.97] mt-6"
          >
            {loading ? "INITIALIZING..." : isSignUp ? "Forging Identity" : "Entering Vault"}
          </button>
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="mt-12 text-zinc-600 text-[10px] uppercase font-black tracking-widest hover:text-white transition-colors italic"
        >
          {isSignUp ? "Already a Smith? Sign In" : "New Smith? Create Profile"}
        </button>
      </motion.div>
    </div>
  );
}
