import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GiFireBowl, GiTwoCoins, GiThermometerScale } from 'react-icons/gi';
import { fetchUserProfile } from '../lib/profileService';

/**
 * ProfileView Component
 * Displays the Smith's progression: XP (as a molten thermometer) and Gold.
 */
export default function ProfileView() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const data = await fetchUserProfile();
      setProfile(data);
      setLoading(false);
    }
    loadProfile();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-8 opacity-20">
      <div className="w-12 h-12 border-2 border-orange-500 rounded-full border-t-transparent animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Accessing Ledger...</p>
    </div>
  );

  if (!profile) return null;

  // Level Logic: XP = 100 * (Level - 1)^2
  const currentXP = profile.xp || 0;
  const level = Math.floor(Math.sqrt(currentXP / 100)) + 1;
  const currentLevelXP = 100 * Math.pow(level - 1, 2);
  const nextLevelXP = 100 * Math.pow(level, 2);
  const xpNeededForNext = nextLevelXP - currentLevelXP;
  const xpProgress = currentXP - currentLevelXP;
  const progressPercent = Math.min(Math.max((xpProgress / xpNeededForNext) * 100, 0), 100);

  return (
    <div className="w-full max-w-xs bg-zinc-950/20 rounded-[2.5rem] p-8 border border-zinc-900/50 backdrop-blur-sm relative overflow-hidden group">
      {/* Molten Ambience */}
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-600/5 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex flex-col">
          <h3 className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em] mb-1 italic">
            Rank: {profile.blacksmith_rank}
          </h3>
          <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none">
            {profile.username}
          </h2>
          
          <div className="mt-8 flex flex-col gap-1">
             <div className="flex items-center gap-2 text-orange-500">
                <GiTwoCoins size={16} className="drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                <span className="text-lg font-black italic tracking-tighter tabular-nums">{profile.gold} <span className="text-[10px] opacity-40 uppercase ml-1">Gold</span></span>
             </div>
          </div>
        </div>

        {/* The Furnace Thermometer */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-6 h-36 bg-zinc-900 rounded-full border-2 border-zinc-950 shadow-inner flex flex-col justify-end p-0.5 overflow-hidden">
            {/* Heat markers */}
            <div className="absolute inset-0 flex flex-col justify-between py-4 opacity-20 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full h-[1px] bg-zinc-400" />
              ))}
            </div>

            {/* Molten Mercury (XP) */}
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: `${progressPercent}%` }}
              className="w-full bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 rounded-full relative shadow-[0_0_15px_rgba(234,88,12,0.6)]"
            >
              {/* Highlight Bloom */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/30 blur-md rounded-full shadow-[0_0_20px_white]" />
              {/* Bubbling effect (CSS only) */}
              <div className="absolute inset-0 overflow-hidden opacity-30">
                 <div className="absolute bottom-0 left-0 right-0 h-full animate-pulse bg-gradient-to-t from-transparent via-white/20 to-transparent" />
              </div>
            </motion.div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-white italic">LVL {level}</span>
            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-tighter italic whitespace-nowrap">
               {Math.floor(xpProgress)} / {xpNeededForNext} XP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
