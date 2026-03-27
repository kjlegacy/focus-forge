import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GiBroadsword } from 'react-icons/gi';

/**
 * Armory Component
 * Displays a grid of weapons collected from focus sessions.
 */
export default function Armory() {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    const savedInventory = localStorage.getItem('forgeInventory');
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    }
  }, []);

  return (
    <div className="flex flex-col items-center w-full h-full px-4 overflow-y-auto pb-20 no-scrollbar">
      <header className="mt-12 mb-10 text-center">
        <h1 className="text-3xl font-black italic tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          YOUR ARMORY
        </h1>
        <p className="text-zinc-600 text-[10px] uppercase font-black tracking-[0.4em] mt-2 italic">
          Vault of Focal Might
        </p>
      </header>

      {inventory.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 mt-20">
          <GiBroadsword size={60} className="text-zinc-700 mb-6" />
          <p className="text-zinc-500 uppercase tracking-[0.3em] font-black text-xs">
            Your armory is empty.<br />Go forge.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6 w-full">
          {inventory.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.95 }}
              className="aspect-square bg-zinc-900/50 rounded-2xl border border-zinc-800/50 flex flex-col items-center justify-center p-2 relative overflow-hidden group active:bg-zinc-800 transition-colors"
            >
              {/* Rarity Glow */}
              <div 
                className="absolute inset-0 opacity-10 blur-xl group-hover:opacity-20 transition-opacity" 
                style={{ backgroundColor: item.rarity }} 
              />
              
              <GiBroadsword 
                size={32} 
                style={{ color: item.rarity, filter: `drop-shadow(0 0 8px ${item.rarity}66)` }} 
              />
              
              <div className="mt-2 text-[8px] font-black uppercase tracking-tighter text-zinc-500 truncate w-full text-center">
                {item.duration}m
              </div>

              {/* Flawless Marker */}
              {item.isFlawless && (
                <div className="absolute top-1 right-2 text-[8px] text-orange-500 font-bold italic">
                  ★
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
