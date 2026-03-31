import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GiWingedSword, GiDeathSkull, GiAnvil } from 'react-icons/gi';
import { setFactionAndInitializeResources } from '../lib/profileService';

export default function FactionSelection({ onComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSelection = async (faction) => {
    setLoading(true);
    setError(null);
    try {
      await setFactionAndInitializeResources(faction);
      onComplete(); // Tells App.jsx to re-fetch the profile and proceed
    } catch (err) {
      setError(err.message === 'No authenticated user.' 
        ? 'Session lost. Please sign out and back in.' 
        : 'Failed to align with faction. Ensure the Phase 1 Database script has been run.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black w-full flex flex-col items-center justify-center p-6 relative overflow-hidden antialiased select-none">
      
      {/* Heavy vignette shadow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] pointer-events-none z-10" />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center z-20 mb-12"
      >
        <GiAnvil size={40} className="mx-auto text-zinc-600 mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
        <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
          Swear Allegiance
        </h1>
        <p className="text-zinc-500 text-[10px] uppercase font-black tracking-[0.4em] mt-3 italic">
          Your path dictates your materials
        </p>
      </motion.div>

      <div className="w-full max-w-sm space-y-6 z-20">
        
        {/* Living Faction Card */}
        <motion.button
          disabled={loading}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => handleSelection('Living')}
          className="w-full relative group overflow-hidden rounded-xl border-2 border-amber-900/50 bg-gradient-to-b from-zinc-900 to-black p-6 flex flex-col items-center justify-center text-center transition-all hover:border-amber-500 hover:shadow-[0_0_40px_rgba(245,158,11,0.2)] active:scale-[0.98]"
        >
          {/* Inner metallic bevel */}
          <div className="absolute inset-1 border border-amber-900/30 rounded-lg pointer-events-none" />
          {/* Ambient Holy Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] group-hover:bg-amber-500/20 transition-colors pointer-events-none" />

          <GiWingedSword size={64} className="text-amber-500 mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)] group-hover:scale-110 transition-transform duration-500" />
          <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none drop-shadow-md">
            The Living
          </h2>
          <p className="text-amber-700/80 text-[10px] uppercase font-black tracking-widest mt-2 italic shadow-black drop-shadow-lg">
            Angelic Fire & Radiant Steel
          </p>
        </motion.button>

        {/* Undead Faction Card */}
        <motion.button
          disabled={loading}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => handleSelection('Undead')}
          className="w-full relative group overflow-hidden rounded-xl border-2 border-emerald-900/50 bg-gradient-to-b from-zinc-900 to-black p-6 flex flex-col items-center justify-center text-center transition-all hover:border-emerald-500 hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] active:scale-[0.98]"
        >
          {/* Inner metallic bevel */}
          <div className="absolute inset-1 border border-emerald-900/30 rounded-lg pointer-events-none" />
          {/* Ambient Necro Glow */}
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 blur-[50px] group-hover:bg-emerald-500/20 transition-colors pointer-events-none" />

          <GiDeathSkull size={64} className="text-emerald-500 mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.6)] group-hover:scale-110 transition-transform duration-500" />
          <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none drop-shadow-md">
            The Undead
          </h2>
          <p className="text-emerald-700/80 text-[10px] uppercase font-black tracking-widest mt-2 italic shadow-black drop-shadow-lg">
            Corrupted Iron & Soul Magic
          </p>
        </motion.button>

      </div>

      {/* Error Message Display */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 z-20 text-center bg-red-950/40 border border-red-900 p-4 rounded-xl max-w-sm"
        >
          <p className="text-red-500 text-[10px] uppercase font-black tracking-widest italic">{error}</p>
        </motion.div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <p className="text-[10px] text-white uppercase font-black tracking-[0.5em] italic animate-pulse">
            Forging Destiny...
          </p>
        </div>
      )}
    </div>
  );
}
