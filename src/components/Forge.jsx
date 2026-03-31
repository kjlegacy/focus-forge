import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  GiAnvil, GiFireBowl, 
  GiBroadsword, GiDrippingSword, GiDervishSwords, GiTwoHandedSword,
  GiAxeSwing, GiBattleAxe,
  GiWarhammer, GiHammerDrop,
  GiCursedStar, GiSpikedBall, 
  GiRoundShield, GiShield
} from 'react-icons/gi';
import { supabase } from '../lib/supabase';
import { calculatePotentialXP, getLevelFromXP, getTitleForLevel } from '../utils/levelingLogic';

const ICON_MAP = {
  Dagger: ['GiDrippingSword', 'GiDervishSwords'],
  Sword: ['GiBroadsword', 'GiTwoHandedSword'],
  Axe: ['GiAxeSwing', 'GiBattleAxe'],
  Hammer: ['GiWarhammer', 'GiHammerDrop'],
  Warhammer: ['GiWarhammer', 'GiHammerDrop'],
  Mace: ['GiCursedStar', 'GiSpikedBall'],
  Shield: ['GiRoundShield', 'GiShield']
};

/**
 * Forge Component
 * Synced with Supabase 'weapons' table for persistent storage.
 */
export default function Forge({ userProfile }) {
  const [endTime, setEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isFlawless, setIsFlawless] = useState(true);
  const [motionWarning, setMotionWarning] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [activeDuration, setActiveDuration] = useState(null);
  const [activeTask, setActiveTask] = useState('');
  const [selectedBlueprint, setSelectedBlueprint] = useState('Dagger');
  const [savedBlueprint, setSavedBlueprint] = useState('Dagger');
  const [savedTask, setSavedTask] = useState('');
  const [levelUpData, setLevelUpData] = useState(null);
  const [forgedItem, setForgedItem] = useState(null);
  const warningTimeoutRef = useRef(null);
  const startTimeRef = useRef(null);

  // Focus duration constant
  const FOCUS_MINUTES = 0.1;

  useEffect(() => {
    const savedTime = localStorage.getItem('forgeEndTime');
    const savedDuration = localStorage.getItem('forgeSessionDuration');
    const stask = localStorage.getItem('forgeActiveTask');
    const sblue = localStorage.getItem('forgeBlueprint');
    if (savedTime && parseInt(savedTime) > Date.now()) {
      setEndTime(parseInt(savedTime));
      setActiveDuration(savedDuration ? parseInt(savedDuration) : 25);
      setSavedTask(stask || '');
      setSavedBlueprint(sblue || 'Dagger');
      startTimeRef.current = parseInt(savedTime) - ((savedDuration ? parseInt(savedDuration) : 25) * 60 * 1000);
    } else {
      localStorage.removeItem('forgeEndTime');
      localStorage.removeItem('forgeSessionDuration');
      localStorage.removeItem('forgeActiveTask');
      localStorage.removeItem('forgeBlueprint');
    }
  }, []);

  useEffect(() => {
    let interval;
    if (endTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const difference = endTime - now;
        if (difference <= 0) {
          clearInterval(interval);
          finishForge();
        } else {
          setTimeLeft(difference);
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [endTime]);

  useEffect(() => {
    if (!endTime) return;
    const handleMotion = (event) => {
      const now = Date.now();
      if (startTimeRef.current && now < startTimeRef.current + 5000) return;
      const accel = event.acceleration;
      if (!accel) return;
      const threshold = 1.5;
      const moved = Math.abs(accel.x || 0) > threshold || Math.abs(accel.y || 0) > threshold || Math.abs(accel.z || 0) > threshold;
      if (moved) {
        setIsFlawless(false);
        setMotionWarning(true);
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = setTimeout(() => setMotionWarning(false), 3000);
      }
    };
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [endTime]);

  const triggerSparks = (colors = null) => {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.7 },
      colors: colors || ['#ff8000', '#ff0000', '#ffff00'],
      gravity: 1.5,
      ticks: 300,
      startVelocity: 45,
    });
  };

  const startForge = async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const r = await DeviceMotionEvent.requestPermission();
        if (r !== 'granted') return;
      } catch (e) { console.error(e); }
    }
    const duration = selectedMinutes * 60 * 1000;
    const newEndTime = Date.now() + duration;
    startTimeRef.current = Date.now();
    setEndTime(newEndTime);
    setTimeLeft(duration); // Initialize timeLeft immediately
    setActiveDuration(selectedMinutes);
    setSavedTask(activeTask);
    setSavedBlueprint(selectedBlueprint);
    setIsFlawless(true);
    setStatusMessage(null);
    localStorage.setItem('forgeEndTime', newEndTime.toString());
    localStorage.setItem('forgeSessionDuration', selectedMinutes.toString());
    localStorage.setItem('forgeActiveTask', activeTask);
    localStorage.setItem('forgeBlueprint', selectedBlueprint);
    triggerSparks();
  };

  const cancelForge = () => {
    setStatusMessage("SHATTERED");
    setEndTime(null);
    setTimeLeft(null);
    setActiveDuration(null);
    setSavedTask('');
    setSavedBlueprint('Dagger');
    localStorage.removeItem('forgeEndTime');
    localStorage.removeItem('forgeSessionDuration');
    localStorage.removeItem('forgeActiveTask');
    localStorage.removeItem('forgeBlueprint');
    setTimeout(() => setStatusMessage(null), 2000);
  };

  const finishForge = async (mockMins = null) => {
    const durationMins = mockMins || activeDuration || selectedMinutes;
    const flawless = isFlawless;
    const finalBlueprint = savedBlueprint || 'Dagger';
    const finalTask = savedTask || 'Unspecified Work';

    let rarityColor = '#9d9d9d';
    let prefix = "Brittle";

    if (durationMins >= 60 && flawless) {
      rarityColor = '#ff8000'; prefix = "Legendary";
    } else if (durationMins >= 45 && flawless) {
      rarityColor = '#a335ee'; prefix = "Epic";
    } else if (durationMins >= 25 && flawless) {
      rarityColor = '#0070dd'; prefix = "Rare";
    } else if (durationMins >= 15 && flawless) {
      rarityColor = '#1eff00'; prefix = "Uncommon";
    } else if (durationMins >= 15 && !flawless) {
      rarityColor = '#ffffff'; prefix = "Common";
    }

    const weaponName = `${prefix} ${finalBlueprint}`;
    const possibleIcons = ICON_MAP[finalBlueprint] || ['GiBroadsword'];
    const randomIcon = possibleIcons[Math.floor(Math.random() * possibleIcons.length)];

    // --- SUPABASE PERSISTENCE ---
    const earnedXP = calculatePotentialXP(Math.floor(durationMins), flawless);
    
    // Random Price based on Rarity Tier
    let minGold = 5;
    let maxGold = 15;

    if (rarityColor === '#ff8000') { minGold = 500; maxGold = 850; }       // Legendary
    else if (rarityColor === '#a335ee') { minGold = 250; maxGold = 400; }  // Epic
    else if (rarityColor === '#0070dd') { minGold = 100; maxGold = 180; }  // Rare
    else if (rarityColor === '#1eff00') { minGold = 45; maxGold = 85; }    // Uncommon
    else if (rarityColor === '#ffffff') { minGold = 20; maxGold = 40; }    // Common

    const goldValue = Math.floor(Math.random() * (maxGold - minGold + 1) + minGold);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('weapons').insert({
          user_id: user.id,
          item_name: weaponName,
          weapon_type: finalBlueprint,
          rarity_color: rarityColor, 
          quality: flawless ? 'Flawless' : 'Standard',
          focus_duration: Math.floor(durationMins),
          gold_value: goldValue,
          active_task: finalTask,
          item_icon: randomIcon
        });
        if (error) throw error;

        // Add Exp to Profile & Check for Level Up
        const { data: profile } = await supabase.from('profiles').select('xp, total_focus_minutes').eq('id', user.id).single();
        if (profile) {
          const oldXp = profile.xp || 0;
          const newXp = oldXp + earnedXP;
          const oldTotalMinutes = profile.total_focus_minutes || 0;
          const newTotalMinutes = oldTotalMinutes + Math.floor(durationMins);
          
          const oldLevel = getLevelFromXP(oldXp);
          const newLevel = getLevelFromXP(newXp);

          const updates = { xp: newXp, total_focus_minutes: newTotalMinutes };
          let leveledUp = false;

          if (newLevel > oldLevel) {
            updates.forge_level = newLevel;
            updates.blacksmith_rank = getTitleForLevel(newLevel);
            leveledUp = true;
          }

          await supabase.from('profiles').update(updates).eq('id', user.id);

          if (leveledUp) {
            setLevelUpData({ title: updates.blacksmith_rank });
            confetti({
              particleCount: 200,
              spread: 120,
              origin: { y: 0.6 },
              colors: ['#ff4500', '#ff8c00', '#ffd700'],
              gravity: 1.2,
              ticks: 400,
              startVelocity: 55,
            });
            setTimeout(() => setLevelUpData(null), 5000);
          }
        }
      }
    } catch (err) {
      console.error("Transmission Error:", err.message);
    }

    setForgedItem({
      name: weaponName,
      icon: randomIcon,
      color: rarityColor,
      isMasterpiece: flawless
    });
    
    setStatusMessage(flawless ? "MASTERPIECE" : "FORGED");
    setEndTime(null);
    setTimeLeft(null);
    setActiveDuration(null);
    setSavedTask('');
    setSavedBlueprint('Dagger');
    localStorage.removeItem('forgeEndTime');
    localStorage.removeItem('forgeSessionDuration');
    localStorage.removeItem('forgeActiveTask');
    localStorage.removeItem('forgeBlueprint');
    triggerSparks([rarityColor]);

    setTimeout(() => setStatusMessage(null), 2500);
  };

  const formatTime = (ms) => {
    if (ms === null || ms < 0) return '00:00';
    // Use Math.ceil or add 999ms to ensure the first second stays at 25:00
    const totalSeconds = Math.ceil(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-center selection:bg-none relative overflow-hidden">
      <AnimatePresence>
        {levelUpData && (
          <motion.div
            key="levelup"
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.2, y: -50 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/95 backdrop-blur-xl"
          >
            <GiFireBowl size={100} className="text-orange-500 animate-pulse mb-6 drop-shadow-[0_0_40px_rgba(249,115,22,0.8)]" />
            <h2 className="text-xl font-black uppercase tracking-[0.5em] text-red-600 italic mb-2">Rank Increased</h2>
            <h1 className="text-4xl font-black tracking-tighter text-yellow-500 italic drop-shadow-[0_0_20px_rgba(234,179,8,0.5)] text-center px-4">
              {levelUpData.title}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {statusMessage && forgedItem ? (
          <motion.div
            key="status"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(20px)' }}
            className="flex flex-col items-center justify-center"
          >
            <div className="relative mb-6">
              <div 
                className="absolute inset-0 blur-3xl opacity-30 animate-pulse" 
                style={{ backgroundColor: forgedItem.color }} 
              />
              <div 
                className="p-8 rounded-full border-2 border-white/5 bg-zinc-950/50 relative z-10" 
                style={{ color: forgedItem.color, filter: `drop-shadow(0 0 20px ${forgedItem.color})` }}
              >
                {React.createElement((() => {
                    const ICON_COMPONENTS = {
                      GiBroadsword, GiDrippingSword, GiDervishSwords, GiTwoHandedSword,
                      GiAxeSwing, GiBattleAxe, GiWarhammer, GiHammerDrop,
                      GiCursedStar, GiSpikedBall, GiRoundShield, GiShield
                    };
                    return ICON_COMPONENTS[forgedItem.icon] || GiBroadsword;
                })(), { size: 100 })}
              </div>
            </div>

            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[10px] font-black uppercase tracking-[0.6em] mb-2 italic"
              style={{ color: forgedItem.color }}
            >
              {forgedItem.isMasterpiece ? "Masterpiece Unveiled" : "Item Forged"}
            </motion.h2>

            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-black italic tracking-tighter uppercase text-white px-8"
            >
              {forgedItem.name}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 1 }}
              className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.5em] mt-8 italic"
            >
              Added to Armory
            </motion.p>
          </motion.div>
        ) : !endTime ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center px-4 w-full"
          >
            {/* Forge State Visuals */}
            <div className="mb-12 relative flex justify-center items-center">
               <span className="absolute top-[-30px] font-black uppercase text-[10px] tracking-widest text-zinc-600 italic">Level {userProfile?.forge_level || 1} Forge</span>
               {userProfile && userProfile.forge_level >= 3 ? (
                 <GiFireBowl size={50} className="text-orange-500 animate-pulse absolute bottom-6 opacity-50 blur-xl" />
               ) : null}
            </div>

            {/* Task & Blueprint Inputs */}
            <div className="w-full max-w-[280px] mb-12 space-y-4">
              <input 
                type="text" 
                placeholder="Active Task (e.g. Physics Homework)" 
                value={activeTask}
                onChange={(e) => setActiveTask(e.target.value)}
                maxLength={40}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl py-3 px-4 text-white text-[11px] font-black uppercase tracking-widest italic outline-none focus:border-orange-500/50 transition-all text-center"
              />
              <select 
                value={selectedBlueprint} 
                onChange={(e) => setSelectedBlueprint(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl py-3 px-4 text-orange-500 text-[11px] font-black uppercase tracking-widest italic outline-none focus:border-orange-500/50 transition-all text-center appearance-none cursor-pointer"
              >
                <option value="Dagger">Blueprint: Dagger</option>
                <option value="Sword">Blueprint: Sword</option>
                <option value="Axe">Blueprint: Axe</option>
                <option value="Mace">Blueprint: Mace</option>
                <option value="Warhammer">Blueprint: Warhammer</option>
                <option value="Shield">Blueprint: Shield</option>
              </select>
            </div>

            <motion.button
              onClick={startForge}
              className="text-orange-600 outline-none p-4 relative"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              whileTap={{ scale: 0.85, rotate: -2 }}
            >
              <GiAnvil size={150} className={`filter drop-shadow-[0_0_40px_rgba(255,128,0,0.5)] ${(userProfile?.forge_level || 1) >= 2 ? 'text-orange-500' : 'text-zinc-600'}`} />
            </motion.button>
            
            {/* Intensity Slider */}
            <div className="w-full max-w-[240px] mt-12 bg-zinc-950/50 border border-zinc-900 rounded-3xl p-6 backdrop-blur-md">
                <div className="flex justify-between items-center mb-6">
                   <div className="flex flex-col items-start">
                     <span className="text-zinc-600 text-[8px] uppercase font-black tracking-widest italic">Heat Intensity</span>
                     <span className="text-white text-xl font-black italic tracking-tighter tabular-nums">{selectedMinutes} <span className="text-[10px] opacity-40 italic">MINS</span></span>
                   </div>
                   <div className="text-orange-950 text-xl"><GiAnvil /></div>
                </div>
                <input 
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={selectedMinutes}
                  onChange={(e) => setSelectedMinutes(parseInt(e.target.value))}
                  className="w-full accent-orange-600 bg-zinc-900 rounded-full h-1 cursor-pointer appearance-none"
                />
                <div className="flex justify-between mt-4">
                   <span className="text-[7px] text-zinc-700 font-black uppercase">Slow Burn</span>
                   <span className="text-[7px] text-zinc-700 font-black uppercase">Inferno</span>
                </div>
                <div className="mt-6 flex flex-col items-center">
                   <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-black italic mb-1">Potential XP Output</span>
                   <span className="text-xl font-black italic tracking-tighter text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                     +{calculatePotentialXP(selectedMinutes, true)}
                   </span>
                </div>
            </div>

            <p className="text-zinc-600 text-[10px] mt-12 text-center max-w-[220px] font-bold uppercase tracking-widest leading-relaxed">Adjust your intensity and strike to begin.</p>
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className="flex flex-col items-center justify-center w-full px-4 relative"
          >
            <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}>
              <GiAnvil size={60} className="text-orange-500 mb-10 drop-shadow-[0_0_15px_rgba(255,128,0,0.8)] opacity-40" />
            </motion.div>

            <h1 
              onDoubleClick={() => {
                if (userProfile?.role === 'admin') {
                  finishForge();
                }
              }}
              className="text-8xl font-black italic tracking-tighter text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.2)] tabular-nums italic cursor-pointer active:scale-95 transition-transform"
            >
              {formatTime(timeLeft)}
            </h1>

            <div className="h-10 mt-8 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                {motionWarning ? (
                  <motion.p
                    key="motion-warning"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.1, opacity: 0 }}
                    className="text-red-500 font-bold tracking-widest text-xs uppercase animate-bounce"
                  >
                    ⚠️ METAL COOLING! PUT DOWN!
                  </motion.p>
                ) : !isFlawless ? (
                  <motion.p key="flawless-lost" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-orange-900 font-black tracking-widest text-[10px] uppercase italic">Flawless Lost</motion.p>
                ) : (
                  <motion.div key="forging" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center pt-2">
                    <p className="text-orange-500 font-black tracking-[0.4em] uppercase text-[9px] opacity-60 italic mb-1">Forging: {savedBlueprint}</p>
                    {savedTask && <p className="text-white font-black tracking-widest uppercase text-xs truncate max-w-[200px]">{savedTask}</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              onClick={cancelForge}
              whileTap={{ scale: 0.95 }}
              className="mt-24 text-red-600/40 hover:text-red-500 text-[9px] font-black uppercase tracking-[0.5em] border border-red-900/10 px-6 py-2 rounded-full transition-all italic active:bg-red-950/20"
            >
              Shatter Metal
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}