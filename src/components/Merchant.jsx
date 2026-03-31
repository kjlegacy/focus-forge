import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GiBroadsword, GiAxeSwing, GiWarhammer, GiDrippingSword, GiCursedStar,
  GiDervishSwords, GiTwoHandedSword, GiBattleAxe, GiHammerDrop, GiSpikedBall, 
  GiRoundShield, GiShield,
  GiTwoCoins, GiOre, GiFireBowl, GiAnvil 
} from 'react-icons/gi';
import { supabase } from '../lib/supabase';

const ICON_COMPONENTS = {
  GiBroadsword, GiDrippingSword, GiDervishSwords, GiTwoHandedSword,
  GiAxeSwing, GiBattleAxe, GiWarhammer, GiHammerDrop,
  GiCursedStar, GiSpikedBall, GiRoundShield, GiShield
};

/**
 * Merchant Component
 * Phase 2 Overhaul: 3 Sub-tabs (Sell, Ore Trader, Master Smith)
 */
export default function Merchant({ userProfile, onSell }) {
  const [activeSubTab, setActiveSubTab] = useState('Sell');

  // Sell State
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Ore Shop Data Mock
  const ores = [
    { id: 1, name: 'Copper Ore', price: 10, color: '#b87333' },
    { id: 2, name: 'Iron Ore', price: 50, color: '#e2e8f0' },
    { id: 3, name: 'Steel Ingot', price: 200, color: '#94a3b8' },
    { id: 4, name: 'Mithril Ore', price: 1000, color: '#38bdf8' }
  ];

  useEffect(() => {
    if (activeSubTab === 'Sell') fetchInventory();
    else setLoading(false);
  }, [activeSubTab]);

  const fetchInventory = async () => {
    setLoading(true);
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
      console.error("Market Access Denied:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage(null), 3000);
  };

  // --- SELL WARE LOGIC ---
  const handleSell = async (item) => {
    setActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: deleteError } = await supabase.from('weapons').delete().eq('id', item.id);
      if (deleteError) throw deleteError;

      const newGold = (userProfile?.gold || 0) + (item.gold_value || 0);
      const { error: updateError } = await supabase.from('profiles').update({ gold: newGold }).eq('id', user.id);
      if (updateError) throw updateError;

      setInventory(prev => prev.filter(w => w.id !== item.id));
      setSelectedItem(null);
      showMessage(`Traded for ${item.gold_value || 0} Gold`);
      if (onSell) onSell();
    } catch (err) {
      showMessage(err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  // --- BUY ORE LOGIC ---
  const handleBuyOre = async (ore) => {
    if ((userProfile?.gold || 0) < ore.price) {
      showMessage("Not enough gold.", true);
      return;
    }
    setActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Upsert into user_resources (Phase 1 schema: user_id, ore_id, quantity)
      const { data: existing } = await supabase.from('user_resources').select('quantity').eq('user_id', user.id).eq('ore_id', ore.id).single();
      const newQuantity = (existing?.quantity || 0) + 1;

      const { error: resourceError } = await supabase.from('user_resources').upsert({
        user_id: user.id,
        ore_id: ore.id,
        quantity: newQuantity
      });
      if (resourceError) throw resourceError;

      const newGold = (userProfile?.gold || 0) - ore.price;
      await supabase.from('profiles').update({ gold: newGold }).eq('id', user.id);

      showMessage(`Purchased ${ore.name} x1`);
      if (onSell) onSell();
    } catch (err) {
      showMessage(err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  // --- UPGRADE FORGE LOGIC ---
  const handleUpgradeForge = async () => {
    const currentLevel = userProfile?.forge_level || 1;
    const cost = currentLevel * 1000;

    if ((userProfile?.gold || 0) < cost) {
      showMessage("Not enough gold to forge upgrade.", true);
      return;
    }
    setActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const newGold = (userProfile?.gold || 0) - cost;

      await supabase.from('profiles').update({
        gold: newGold,
        forge_level: currentLevel + 1
      }).eq('id', user.id);

      showMessage(`Forge upgraded to Level ${currentLevel + 1}!`);
      if (onSell) onSell();
    } catch (err) {
      showMessage(err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  const getIconForItem = (item) => {
    if (item.item_icon && ICON_COMPONENTS[item.item_icon]) {
      const Icon = ICON_COMPONENTS[item.item_icon];
      return <Icon size={32} />;
    }
    
    // Fallback for older items
    const name = (item.item_name || '').toLowerCase();
    if (name.includes('dagger')) return <GiDrippingSword size={32} />;
    if (name.includes('axe')) return <GiAxeSwing size={32} />;
    if (name.includes('mace')) return <GiCursedStar size={32} />;
    if (name.includes('hammer')) return <GiWarhammer size={32} />;
    return <GiBroadsword size={32} />;
  };

  const getRarityLabel = (hex) => {
    switch (hex) {
      case '#ff8000': return 'Legendary';
      case '#a335ee': return 'Epic';
      case '#0070dd': return 'Rare';
      case '#1eff00': return 'Uncommon';
      case '#9d9d9d': return 'Poor';
      default: return 'Common';
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-full px-4 pt-16 overflow-hidden relative selection:bg-none">

      {/* Toast Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`absolute top-6 left-1/2 z-[200] px-6 py-3 rounded-full border shadow-2xl ${message.isError ? 'bg-red-950 border-red-900 text-red-500' : 'bg-yellow-950 border-yellow-900 text-yellow-500'}`}
          >
            <span className="text-[10px] font-black uppercase tracking-widest italic">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="mb-8 text-center flex-shrink-0">
        <h1 className="text-3xl font-black italic tracking-tighter text-yellow-500 uppercase drop-shadow-[0_0_15px_rgba(234,179,8,0.2)] flex items-center gap-3 justify-center">
          <GiTwoCoins /> MARKET
        </h1>
      </header>

      {/* Sub-Navigation */}
      <div className="flex w-full max-w-[340px] bg-zinc-950/50 p-2 rounded-2xl mb-8 flex-shrink-0">
        {['Sell', 'Ores', 'Upgrades'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest italic rounded-xl transition-all ${activeSubTab === tab ? 'bg-zinc-800 text-yellow-500 shadow-md' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="w-full flex-grow overflow-y-auto no-scrollbar pb-32 px-2 flex flex-col pt-2 items-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center opacity-30 mt-20">
            <div className="w-12 h-1 bg-yellow-800 rounded-full animate-pulse mb-2" />
            <p className="text-[10px] uppercase font-black tracking-widest italic text-yellow-500">Unlocking Stalls...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">

            {/* SUB TAB: WEAPON SMITH (SELL) */}
            {activeSubTab === 'Sell' && (
              <motion.div key="sell" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full h-full">
                {inventory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center opacity-30 mt-10">
                    <GiBroadsword size={50} className="text-zinc-600 mb-4" />
                    <p className="text-zinc-500 uppercase tracking-widest font-black text-[10px] italic">No wares to trade.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 w-full">
                    {inventory.map((item, index) => (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => setSelectedItem(item)}
                        className="aspect-square bg-zinc-950/60 rounded-xl border border-zinc-900 flex flex-col items-center justify-center relative active:scale-95 transition-transform"
                      >
                        <div style={{ color: item.rarity_color }}>
                          {getIconForItem(item)}
                        </div>
                        <div className="absolute bottom-1 flex items-center gap-1 text-[8px] font-black italic text-yellow-500">
                          {item.gold_value || 0}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* SUB TAB: ORE TRADER */}
            {activeSubTab === 'Ores' && (
              <motion.div key="ores" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full space-y-4 max-w-[340px]">
                {ores.map(ore => (
                  <div key={ore.id} className="bg-zinc-950/50 border border-zinc-900 p-4 rounded-3xl flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <GiOre size={30} style={{ color: ore.color }} className="drop-shadow-lg" />
                      <div className="flex flex-col">
                        <span className="text-white text-xs font-black uppercase tracking-widest italic">{ore.name}</span>
                        <span className="text-zinc-600 text-[9px] uppercase tracking-widest font-black">Raw Material</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBuyOre(ore)}
                      disabled={actionLoading}
                      className="bg-yellow-950/20 text-yellow-500 border border-yellow-900/30 px-4 py-3 rounded-2xl flex items-center gap-2 hover:bg-yellow-900/50 hover:text-white transition-all active:scale-95 disabled:opacity-30"
                    >
                      <GiTwoCoins />
                      <span className="text-[10px] tabular-nums font-black italic">{ore.price}</span>
                    </button>
                  </div>
                ))}
                <p className="text-zinc-600 text-[9px] uppercase tracking-widest font-black text-center mt-8 italic px-6 opacity-60">Ore prices fluctuate wildly depending on supply.</p>
              </motion.div>
            )}

            {/* SUB TAB: MASTER SMITH (UPGRADES) */}
            {activeSubTab === 'Upgrades' && (
              <motion.div key="upgrades" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full flex justify-center max-w-[340px]">
                <div className="w-full bg-zinc-950/80 border border-orange-900/20 rounded-[2.5rem] p-8 flex flex-col items-center shadow-[0_0_50px_rgba(234,88,12,0.05)] relative overflow-hidden">
                  <GiAnvil size={80} className="text-orange-500 mb-6 drop-shadow-[0_0_20px_rgba(234,88,12,0.5)]" />

                  <h3 className="text-white text-2xl font-black uppercase tracking-tighter italic mb-2">Upgrade Forge</h3>
                  <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest mb-10">Current: Level {userProfile?.forge_level || 1}</p>

                  {/* Cost Calculation */}
                  <div className="flex items-center gap-3 mb-8">
                    <span className="text-zinc-500 text-[10px] uppercase font-black tracking-[0.3em]">Cost:</span>
                    <div className="flex items-center gap-1 text-yellow-500 font-black italic text-xl">
                      <GiTwoCoins /> {(userProfile?.forge_level || 1) * 1000}
                    </div>
                  </div>

                  <button
                    onClick={handleUpgradeForge}
                    disabled={actionLoading}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-black py-4 rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all active:scale-95 disabled:opacity-30 shadow-[0_0_20px_rgba(234,88,12,0.4)]"
                  >
                    {actionLoading ? "Hammering..." : "Purchase Bellows"}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </div>

      {/* Item Card Overlay - Sell Mode Only */}
      <AnimatePresence>
        {selectedItem && activeSubTab === 'Sell' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !actionLoading && setSelectedItem(null)}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[280px] bg-zinc-950 border border-yellow-900/30 rounded-[2.5rem] p-8 flex flex-col items-center shadow-[0_0_50px_rgba(234,179,8,0.1)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-[50px] pointer-events-none" />

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

              <button
                onClick={() => handleSell(selectedItem)}
                disabled={actionLoading}
                className="w-full bg-gradient-to-r from-yellow-700 to-yellow-600 hover:from-yellow-600 hover:to-yellow-500 disabled:opacity-50 text-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-4 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
              >
                {actionLoading ? (
                  <span className="text-[10px] font-black uppercase tracking-widest italic animate-pulse">Trading...</span>
                ) : (
                  <>
                    <span className="text-xs font-black uppercase tracking-widest italic">Trade For</span>
                    <GiTwoCoins size={18} />
                    <span className="text-lg font-black italic tracking-tighter tabular-nums leading-none">{selectedItem.gold_value || 0}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedItem(null)}
                disabled={actionLoading}
                className="mt-8 text-zinc-600 uppercase tracking-widest text-[9px] font-black hover:text-white transition-colors italic"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
