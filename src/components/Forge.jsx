import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { GiAnvil } from 'react-icons/gi';

/**
 * Forge Component
 * Enhanced with automated "shatter" animations on cancel (no more alerts).
 */
export default function Forge() {
  const [endTime, setEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isFlawless, setIsFlawless] = useState(true);
  const [motionWarning, setMotionWarning] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const warningTimeoutRef = useRef(null);
  const startTimeRef = useRef(null);

  // Focus duration constant
  const FOCUS_MINUTES = 1; // Testing value

  // Check localStorage when the app boots up
  useEffect(() => {
    const savedTime = localStorage.getItem('forgeEndTime');
    if (savedTime && parseInt(savedTime) > Date.now()) {
      setEndTime(parseInt(savedTime));
      startTimeRef.current = parseInt(savedTime) - (FOCUS_MINUTES * 60 * 1000);
    } else {
      localStorage.removeItem('forgeEndTime');
    }
  }, []);

  // Standard Timer Logic
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
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [endTime]);

  // Motion Sensor Tracking
  useEffect(() => {
    if (!endTime) return;
    const handleMotion = (event) => {
      const now = Date.now();
      if (startTimeRef.current && now < startTimeRef.current + 5000) return;
      const accel = event.acceleration;
      if (!accel) return;
      const threshold = 1.5;
      const moved = Math.abs(accel.x||0)>threshold || Math.abs(accel.y||0)>threshold || Math.abs(accel.z||0)>threshold;
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
    const duration = FOCUS_MINUTES * 60 * 1000;
    const newEndTime = Date.now() + duration;
    startTimeRef.current = Date.now();
    setEndTime(newEndTime);
    setIsFlawless(true);
    setStatusMessage(null);
    localStorage.setItem('forgeEndTime', newEndTime.toString());
    triggerSparks();
  };

  const cancelForge = () => {
    // Elegant shattering transition
    setStatusMessage("SHATTERED");
    setEndTime(null);
    setTimeLeft(null);
    localStorage.removeItem('forgeEndTime');
    
    // Quick vibration/feedback (visual only in PWA)
    setTimeout(() => setStatusMessage(null), 2000);
  };

  const finishForge = () => {
    const durationMins = FOCUS_MINUTES;
    const flawless = isFlawless;

    let rarityColor = '#9d9d9d'; 
    if (durationMins >= 60 && flawless) rarityColor = '#ff8000';
    else if (durationMins >= 45 && flawless) rarityColor = '#a335ee';
    else if (durationMins >= 25 && flawless) rarityColor = '#0070dd';
    else if (durationMins >= 15 && flawless) rarityColor = '#1eff00';
    else if (durationMins >= 15 && !flawless) rarityColor = '#ffffff';

    const weapon = {
      id: Date.now(),
      name: "Focus Session",
      duration: durationMins,
      rarity: rarityColor,
      isFlawless: flawless,
      date: new Date().toISOString()
    };

    const inv = JSON.parse(localStorage.getItem('forgeInventory') || '[]');
    localStorage.setItem('forgeInventory', JSON.stringify([weapon, ...inv]));

    setStatusMessage(flawless ? "MASTERPIECE" : "FORGED");
    setEndTime(null);
    setTimeLeft(null);
    localStorage.removeItem('forgeEndTime');
    triggerSparks([rarityColor]);

    setTimeout(() => setStatusMessage(null), 2500);
  };

  const formatTime = (ms) => {
    if (!ms) return "00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-center selection:bg-none">
      <AnimatePresence mode="wait">
        {statusMessage ? (
          <motion.div
            key="status"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="flex flex-col items-center justify-center"
          >
            <h1 className={`text-5xl font-black italic tracking-tighter uppercase px-8 py-4 ${
              statusMessage === 'SHATTERED' ? 'text-red-600' : 'text-orange-500'
            }`}>
              {statusMessage}
            </h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em] mt-4">
              Return to Heat
            </p>
          </motion.div>
        ) : !endTime ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center px-4"
          >
            <h2 className="text-zinc-500 text-sm font-black tracking-[0.4em] uppercase mb-16 italic opacity-80">
              Ready to Ignite
            </h2>
            <motion.button
              onClick={startForge}
              className="text-orange-600 outline-none p-4"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              whileTap={{ scale: 0.85, rotate: -2 }}
            >
              <GiAnvil size={150} className="filter drop-shadow-[0_0_40px_rgba(255,128,0,0.5)]" />
            </motion.button>
            <p className="text-zinc-600 text-[10px] mt-16 text-center max-w-[220px] font-bold uppercase tracking-widest leading-relaxed">
              Strike the anvil to begin a session.
            </p>
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
            
            <h1 className="text-8xl font-black tracking-tighter text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.2)] tabular-nums italic">
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
                  <motion.p
                    key="flawless-lost"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-orange-900 font-black tracking-widest text-[10px] uppercase italic"
                  >
                    Flawless Lost
                  </motion.p>
                ) : (
                  <motion.p
                    key="forging"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    className="text-orange-500 font-black tracking-[0.4em] uppercase text-[11px]"
                  >
                    Forging in progress
                  </motion.p>
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