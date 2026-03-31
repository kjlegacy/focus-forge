import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GiAnvil, GiFireBowl, GiSwordsEmblem, GiPowerButton, GiWingedSword, GiDeathSkull, GiHourglass, GiBullseye, GiBroadsword } from 'react-icons/gi';
import { supabase } from '../lib/supabase';
import { getLevelFromXP, getXPForLevel } from '../utils/levelingLogic';

/**
 * Character Component
 * Now pulls live lifetime stats from the Supabase 'weapons' table.
 */
export default function Character({ userProfile, onUpdate }) {
  const [stats, setStats] = useState({
    lvl: 1,
    xpIntoLevel: 0,
    xpRequiredForNext: 100,
    totalMinutes: 0,
    legendaries: 0,
    flawless: 0,
    totalWeapons: 0,
    totalXP: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('weapons')
        .select('focus_duration, rarity_color, quality')
        .eq('user_id', user.id);

      if (error) throw error;

      calculateStats(userProfile?.xp || 0, data || []);
    } catch (err) {
      console.error("Transmission Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLevel = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Reset Statistics
      await supabase.from('profiles').update({
        xp: 0,
        forge_level: 1,
        gold: 0,
        total_focus_minutes: 0,
        blacksmith_rank: 'Soot-Stained Novice'
      }).eq('id', user.id);

      // 2. Delete Weapons
      await supabase.from('weapons').delete().eq('user_id', user.id);

      if (onUpdate) onUpdate();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const calculateStats = (profileXP, inventory) => {
    let legendaryCount = 0;
    let flawlessCount = 0;

    inventory.forEach(item => {
      if (item.rarity_color === '#ff8000') legendaryCount++;
      if (item.quality === 'Flawless') flawlessCount++;
    });

    const currentLvl = getLevelFromXP(profileXP);
    const baseXPForCurrentLvl = getXPForLevel(currentLvl);
    const baseXPForNextLvl = getXPForLevel(currentLvl + 1);

    // XP within current bracket
    const xpIntoLevel = profileXP - baseXPForCurrentLvl;
    const xpRequiredForNext = baseXPForNextLvl - baseXPForCurrentLvl;

    setStats({
      lvl: currentLvl,
      xpIntoLevel,
      xpRequiredForNext,
      nextLevelTotal: baseXPForNextLvl,
      totalMinutes: userProfile?.total_focus_minutes || 0,
      legendaries: legendaryCount,
      flawless: flawlessCount,
      totalWeapons: inventory.length,
      totalXP: profileXP
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const currentXP = userProfile?.xp || 0;
  const currentLvl = getLevelFromXP(currentXP);
  const baseXPForCurrentLvl = getXPForLevel(currentLvl);
  const baseXPForNextLvl = getXPForLevel(currentLvl + 1);

  const xpIntoLevel = currentXP - baseXPForCurrentLvl;
  const xpRequiredForNextBracket = baseXPForNextLvl - baseXPForCurrentLvl;
  const progressPercent = (xpIntoLevel / xpRequiredForNextBracket) * 100;

  if (loading) return (
    <div className="flex h-full items-center justify-center opacity-30">
      <p className="text-[10px] uppercase font-black tracking-widest italic animate-pulse">Syncing Smith Identity...</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full h-full px-6 overflow-y-auto no-scrollbar pb-32">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mt-16 text-center">
        <div className="flex justify-center mb-6 relative">
          {userProfile?.faction === 'Undead' ? (
            <GiDeathSkull size={70} className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
          ) : userProfile?.faction === 'Living' ? (
            <GiWingedSword size={70} className="text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] animate-pulse" />
          ) : (
            <GiFireBowl size={60} className="text-orange-600 drop-shadow-[0_0_15px_rgba(234,88,12,0.6)] animate-pulse" />
          )}
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none italic">Level {currentLvl}</h1>
        <h2 className="text-orange-500 text-[10px] font-black uppercase tracking-[0.5em] mt-2 italic shadow-orange-500/10 mb-2">
          {userProfile?.blacksmith_rank || 'Apprentice Smith'}
        </h2>
        {userProfile?.faction && (
          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 italic">
            Faction: {userProfile.faction}
          </p>
        )}
      </motion.div>

      <div className="w-full mt-16 px-4">
        <div className="flex justify-between items-end mb-3">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic opacity-60">Experience</span>
          <span className="text-[10px] font-black text-white italic tabular-nums">XP: {Math.floor(currentXP)} / {baseXPForNextLvl}</span>
        </div>
        <div className="h-4 w-full bg-zinc-950 rounded-full border border-zinc-900 overflow-hidden relative shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
          <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-gradient-to-r from-orange-900 via-orange-500 to-yellow-400 shadow-[0_0_20px_rgba(249,115,22,0.8)] relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay"></div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full mt-16">
        <StatsCard icon={<GiHourglass />} label="Stamina" value={`${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`} delay={0.1} />
        <StatsCard icon={<GiBullseye />} label="Precision" value={`${stats.flawless} Flawless`} delay={0.2} />
        <StatsCard icon={<GiBroadsword />} label="Crafted" value={stats.totalWeapons} delay={0.3} />
        <StatsCard icon={<GiSwordsEmblem />} label="Legendaries" value={stats.legendaries} delay={0.4} />
      </div>

      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} whileHover={{ opacity: 1, color: '#ef4444' }} onClick={handleSignOut} className="mt-20 flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.3em] transition-all italic underline-offset-4 decoration-red-900 active:scale-95">
        <GiPowerButton /> Extinguish Forge (Sign Out)
      </motion.button>

      {userProfile?.role === 'admin' && (
        <button
          onClick={handleClearLevel}
          className="mt-8 text-red-500 text-[10px] uppercase font-black tracking-widest italic border border-red-900/20 px-6 py-2 rounded-full hover:bg-red-950/20 transition-all active:scale-95"
        >
          Dev: Clear Level
        </button>
      )}
    </div>
  );
}

function StatsCard({ icon, label, value, delay }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay }} className="bg-zinc-950/50 border border-zinc-900 p-5 rounded-3xl flex flex-col items-center text-center">
      <div className="text-zinc-700 mb-3 text-2xl">{icon}</div>
      <div className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-1 italic leading-none">{label}</div>
      <div className="text-lg font-black text-white italic tracking-tighter tabular-nums leading-none mt-2">{value}</div>
    </motion.div>
  );
}
