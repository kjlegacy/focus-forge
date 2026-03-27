import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GiAnvil, GiFireBowl, GiSwordsEmblem } from 'react-icons/gi';

/**
 * Character Component
 * Manages XP, Leveling, and Lifetime Stats derived from forgeInventory.
 */
export default function Character() {
  const [stats, setStats] = useState({
    lvl: 1,
    xpIntoLevel: 0,
    xpRequiredForNext: 100,
    totalMinutes: 0,
    legendaries: 0,
    totalXP: 0
  });

  useEffect(() => {
    const inventory = JSON.parse(localStorage.getItem('forgeInventory') || '[]');
    
    // 1. Calculate base stats
    let totalXP = 0;
    let totalMinutes = 0;
    let legendaryCount = 0;

    inventory.forEach(item => {
      let sessionXP = item.duration * 10;
      if (item.isFlawless) sessionXP *= 1.5;
      
      totalXP += sessionXP;
      totalMinutes += item.duration;
      if (item.rarity === '#ff8000') legendaryCount++; // Orange is legendary
    });

    // 2. Calculate Level and Progress
    // Logic: Lvl 1: 100, Lvl 2: 150 (100*1.5), Lvl 3: 225...
    let currentLvl = 1;
    let xpRemaining = totalXP;
    let nextLevelReq = 100;

    while (xpRemaining >= nextLevelReq) {
      xpRemaining -= nextLevelReq;
      currentLvl++;
      nextLevelReq = Math.floor(nextLevelReq * 1.5);
    }

    setStats({
      lvl: currentLvl,
      xpIntoLevel: xpRemaining,
      xpRequiredForNext: nextLevelReq,
      totalMinutes,
      legendaries: legendaryCount,
      totalXP
    });
  }, []);

  const progressPercent = (stats.xpIntoLevel / stats.xpRequiredForNext) * 100;

  return (
    <div className="flex flex-col items-center w-full h-full px-6 overflow-y-auto no-scrollbar pb-24">
      {/* Level Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-16 text-center"
      >
        <div className="flex justify-center mb-6">
           <GiFireBowl size={60} className="text-orange-600 drop-shadow-[0_0_15px_rgba(234,88,12,0.6)] animate-pulse" />
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
          Level {stats.lvl}
        </h1>
        <h2 className="text-orange-500 text-[10px] font-black uppercase tracking-[0.5em] mt-2 italic">
          Master Blacksmith
        </h2>
      </motion.div>

      {/* XP Progress Bar */}
      <div className="w-full mt-16 px-4">
        <div className="flex justify-between items-end mb-3">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Experience</span>
          <span className="text-[10px] font-black text-white italic tabular-nums">
            {Math.floor(stats.xpIntoLevel)} / {stats.xpRequiredForNext} XP
          </span>
        </div>
        
        <div className="h-4 w-full bg-zinc-900/80 rounded-full border border-zinc-800 overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-orange-800 via-orange-500 to-yellow-400 shadow-[0_0_15px_rgba(251,146,60,0.5)]"
          />
        </div>
      </div>

      {/* Lifetime Stats Grid */}
      <div className="grid grid-cols-2 gap-4 w-full mt-16">
        <StatsCard 
          icon={<GiAnvil />} 
          label="Forging Time" 
          value={`${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`} 
          delay={0.2}
        />
        <StatsCard 
          icon={<GiSwordsEmblem />} 
          label="Legendaries" 
          value={stats.legendaries} 
          delay={0.3}
        />
      </div>

      {/* Global Totals */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <p className="text-[9px] text-zinc-600 uppercase tracking-[0.3em] font-black">
          Lifetime Yield: {Math.floor(stats.totalXP)} total energy
        </p>
      </motion.div>
    </div>
  );
}

function StatsCard({ icon, label, value, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-zinc-950/50 border border-zinc-900 p-5 rounded-3xl flex flex-col items-center text-center"
    >
      <div className="text-zinc-700 mb-3 text-2xl">{icon}</div>
      <div className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-1 italic">
        {label}
      </div>
      <div className="text-lg font-black text-white italic tracking-tighter tabular-nums">
        {value}
      </div>
    </motion.div>
  );
}
