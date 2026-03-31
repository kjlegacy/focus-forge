import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GiBroadsword, GiAxeSwing, GiWarhammer, GiDrippingSword, GiCursedStar,
  GiDervishSwords, GiTwoHandedSword, GiBattleAxe, GiHammerDrop, GiSpikedBall, 
  GiRoundShield, GiShield
} from 'react-icons/gi';
import { supabase } from '../lib/supabase';

const ICON_COMPONENTS = {
  GiBroadsword, GiDrippingSword, GiDervishSwords, GiTwoHandedSword,
  GiAxeSwing, GiBattleAxe, GiWarhammer, GiHammerDrop,
  GiCursedStar, GiSpikedBall, GiRoundShield, GiShield
};

/**
 * Armory Component
 * Now fully powered by Supabase. Fetches real-time weapon data for the current Smith.
 */
export default function Armory({ userProfile }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (!selectedItem) setShowDeleteMenu(false);
  }, [selectedItem]);

  const fetchInventory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('weapons')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInventory(data || []);
    } catch (err) {
      console.error("Vault Access Denied:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('weapons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state & close views
      setInventory(prev => prev.filter(item => item.id !== id));
      setSelectedItem(null);
      setShowDeleteMenu(false);
    } catch (err) {
      console.error("Deletion failed:", err.message);
    }
  };

  const getIconForItem = (item) => {
    if (item.item_icon && ICON_COMPONENTS[item.item_icon]) {
      const Icon = ICON_COMPONENTS[item.item_icon];
      return <Icon size={32} />;
    }
    
    // Fallback for older items
    const name = item.item_name || '';
    if (name.includes('Dagger')) return <GiDrippingSword size={32} />;
    if (name.includes('Axe')) return <GiAxeSwing size={32} />;
    if (name.includes('Mace')) return <GiCursedStar size={32} />;
    if (name.includes('Hammer')) return <GiWarhammer size={32} />;
    return <GiBroadsword size={32} />;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full opacity-20">
      <div className="w-12 h-1 bg-zinc-800 rounded-full animate-pulse mb-2" />
      <p className="text-[10px] uppercase font-black tracking-widest italic">Inventory Scan...</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full h-full px-6 pt-16 overflow-y-auto no-scrollbar relative selection:bg-none">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          YOUR ARMORY
        </h1>
        <p className="text-zinc-600 text-[10px] uppercase font-black tracking-[0.4em] mt-2 italic">
          Vault of Recorded Sessions
        </p>
      </header>

      {inventory.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 mt-20">
          <GiBroadsword size={60} className="text-zinc-700 mb-6" />
          <p className="text-zinc-500 uppercase tracking-[0.3em] font-black text-[10px] italic leading-relaxed">
            Your vault is empty.<br />Ignite the forge to begin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6 w-full pb-32">
          {inventory.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => setSelectedItem(item)}
              style={{
                borderColor: `${item.rarity_color}40`,
                boxShadow: `inset 0 0 20px ${item.rarity_color}10, 0 0 15px ${item.rarity_color}20`
              }}
              className="aspect-square bg-zinc-950/80 rounded-2xl border-2 flex flex-col items-center justify-center relative overflow-hidden group active:bg-zinc-900 transition-all hover:scale-105"
            >
              <div
                className="absolute inset-0 opacity-20 blur-2xl group-hover:opacity-40 transition-opacity"
                style={{ backgroundColor: item.rarity_color }}
              />
              <div style={{ color: item.rarity_color, filter: `drop-shadow(0 0 10px ${item.rarity_color}66)` }}>
                {getIconForItem(item)}
              </div>
              {item.quality === 'Flawless' && (
                <div className="absolute top-1 right-2 text-[8px] text-orange-500 font-black italic">★</div>
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Item Card Overlay */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteMenu(false);
              }}
              className="w-full max-w-[280px] bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 flex flex-col items-center shadow-[0_0_50px_rgba(0,0,0,1)] relative"
            >
              {/* Options Menu Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteMenu(!showDeleteMenu);
                }}
                className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors z-[110] p-2"
              >
                <div className="flex flex-col gap-1">
                  <div className="w-1 h-1 bg-current rounded-full" />
                  <div className="w-1 h-1 bg-current rounded-full" />
                  <div className="w-1 h-1 bg-current rounded-full" />
                </div>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showDeleteMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-16 right-8 bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 shadow-2xl z-[120] min-w-[100px]"
                  >
                    <button
                      onClick={() => handleDelete(selectedItem.id)}
                      className="w-full text-left text-red-500 text-[10px] font-black uppercase tracking-widest py-1 hover:text-red-400 transition-colors italic"
                    >
                      Delete Item
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="p-6 rounded-full mb-6 relative" style={{ backgroundColor: `${selectedItem.rarity_color}0D` }}>
                <div className="absolute inset-0 blur-2xl opacity-20" style={{ backgroundColor: selectedItem.rarity_color }} />
                <div style={{ color: selectedItem.rarity_color, filter: `drop-shadow(0 0 15px ${selectedItem.rarity_color})` }}>
                  {getIconForItem(selectedItem)}
                </div>
              </div>

              <h2 className="text-xl font-black italic tracking-tighter text-white mb-2 uppercase text-center">{selectedItem.item_name}</h2>
              <div className="text-[9px] font-black uppercase tracking-[0.3em] mb-8 italic" style={{ color: selectedItem.rarity_color }}>
                {getRarityLabel(selectedItem.rarity_color)}
              </div>

              <div className="w-full space-y-4 pt-6 border-t border-zinc-900">
                <StatRow label="Focus Time" value={`${selectedItem.focus_duration} MINS`} />
                <StatRow label="Forged On" value={new Date(selectedItem.created_at).toLocaleDateString()} />
                <StatRow label="Task Name" value={selectedItem.active_task || 'Unspecified'} />
                <StatRow label="Craftsmanship" value={selectedItem.quality.toUpperCase()} />
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="mt-10 text-zinc-600 uppercase tracking-widest text-[9px] font-black hover:text-white transition-colors italic"
              >
                Close Vault
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between items-center w-full">
      <span className="text-zinc-600 text-[8px] uppercase font-black tracking-widest italic">{label}</span>
      <span className="text-white text-[10px] font-black italic tracking-tighter">{value}</span>
    </div>
  );
}

function getRarityLabel(hex) {
  switch (hex) {
    case '#ff8000': return 'Legendary';
    case '#a335ee': return 'Epic';
    case '#0070dd': return 'Rare';
    case '#1eff00': return 'Uncommon';
    case '#9d9d9d': return 'Poor';
    default: return 'Common';
  }
}
