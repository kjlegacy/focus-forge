import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { GiAnvil, GiFireBowl, GiPowerButton, GiTrophy, GiTwoCoins } from 'react-icons/gi';

/**
 * AccountSettings Component
 * Allows users to change username, password, and wipe their forge data.
 */
export default function AccountSettings({ user, profile, onUpdate, onClose }) {
  const [newUsername, setNewUsername] = useState(profile?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // 1. Update Username in Profiles
      if (newUsername !== profile?.username) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ username: newUsername })
          .eq('id', user.id);
        if (profileError) throw profileError;
      }

      // 2. Update Password in Auth
      if (newPassword) {
        const { error: authError } = await supabase.auth.updateUser({
          password: newPassword
        });
        if (authError) throw authError;
      }

      setMessage({ text: 'VAULT UPDATED SUCCESSFULLY', type: 'success' });
      if (onUpdate) onUpdate();
    } catch (err) {
      setMessage({ text: err.message.toUpperCase(), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const resetAllData = async () => {
    setLoading(true);
    try {
      // WIPE EVERYTHING
      await supabase.from('weapons').delete().eq('user_id', user.id);
      await supabase.from('profiles').update({ xp: 0, gold: 0 }).eq('id', user.id);
      
      setMessage({ text: 'FORGE HAS BEEN EXTINGUISHED. DATA WIPED.', type: 'success' });
      setShowConfirmReset(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      setMessage({ text: 'FAILED TO WIPE DATA', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[200] overflow-y-auto no-scrollbar flex flex-col items-center px-8 py-16 antialiased select-none">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm flex flex-col items-center">
        
        <button onClick={onClose} className="absolute top-8 left-8 text-zinc-600 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors italic">
          ← Close Vault
        </button>

        <GiFireBowl size={50} className="text-orange-600 mb-8 drop-shadow-[0_0_15px_rgba(234,88,12,0.4)]" />
        
        <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase text-center mb-1">
          Vault Settings
        </h1>
        <p className="text-zinc-600 text-[10px] uppercase font-black tracking-[0.4em] mb-12 italic">
          Identity Management
        </p>

        <form onSubmit={handleUpdateAccount} className="w-full space-y-6">
          <div className="space-y-2">
            <label className="text-zinc-700 text-[8px] uppercase font-black tracking-[0.3em] pl-4">Change Smith Name</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl py-4 px-6 text-white text-sm outline-none focus:border-zinc-500 transition-all uppercase italic"
              placeholder="Username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-zinc-700 text-[8px] uppercase font-black tracking-[0.3em] pl-4">New Security Key</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl py-4 px-6 text-white text-sm outline-none focus:border-zinc-500 transition-all placeholder:text-zinc-800"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-800 hover:bg-zinc-700 py-4 rounded-3xl text-white font-black uppercase text-[10px] tracking-widest transition-all active:scale-[0.98] mt-6 italic"
          >
            {loading ? "SAVING..." : "Apply Vault Changes"}
          </button>
        </form>

        <AnimatePresence>
          {message.text && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`mt-8 text-center text-[9px] font-black uppercase tracking-widest italic ${message.type === 'success' ? 'text-green-500' : 'text-red-600'}`}>
               {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* DANGER ZONE */}
        <div className="w-full mt-24 pt-12 border-t border-zinc-900">
           <h3 className="text-[10px] text-zinc-700 font-black uppercase tracking-widest text-center mb-8">Danger Zone</h3>
           
           {!showConfirmReset ? (
             <button 
               onClick={() => setShowConfirmReset(true)}
               className="w-full bg-red-950/10 border border-red-900/30 text-red-900 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-red-900 hover:text-white transition-all italic"
             >
               Shatter All Progress
             </button>
           ) : (
             <div className="flex flex-col gap-4 animate-bounce">
                <p className="text-white text-[9px] font-black uppercase tracking-widest text-center">Are you absolute? <br/>Items, Gold, and XP will be deleted.</p>
                <div className="flex gap-4">
                  <button onClick={() => setShowConfirmReset(false)} className="flex-1 bg-zinc-900 text-zinc-500 py-4 rounded-2xl text-[9px] font-black uppercase italic">Cancel</button>
                  <button onClick={resetAllData} className="flex-1 bg-red-600 text-black py-4 rounded-2xl text-[9px] font-black uppercase italic">Shatter Now</button>
                </div>
             </div>
           )}
        </div>

      </motion.div>
    </div>
  );
}
