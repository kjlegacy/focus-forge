import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import { GiHamburgerMenu, GiPowerButton, GiSettingsKnobs, GiTwoCoins } from 'react-icons/gi';
import { fetchUserProfile } from './lib/profileService';
import BottomNav from './components/BottomNav';
import Forge from './components/Forge';
import Armory from './components/Armory';
import Merchant from './components/Merchant';
import Character from './components/Character';
import Auth from './components/Auth';
import FactionSelection from './components/FactionSelection';
import AccountSettings from './components/AccountSettings';
import './index.css';

/**
 * Focus Forge Mobile App Root
 * Now features a Global Menu for Account & Session management.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState('Forge');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Sync profile when switching to Smith tab
  useEffect(() => {
    if (activeTab === 'Smith' && session) {
      loadProfile();
    }
  }, [activeTab]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadProfile();
    });

    if (session) loadProfile();

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async () => {
    setProfileLoading(true);
    const profile = await fetchUserProfile();
    setUserProfile(profile);
    setProfileLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
  };

  if (loading || (session && profileLoading)) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
       <div className="text-orange-950 font-black italic tracking-tighter text-4xl animate-pulse uppercase">
         FOCUS FORGE
       </div>
    </div>
  );

  if (!session) return <Auth />;

  // PHASE 1: Faction Selection Gate
  if (userProfile && !userProfile.faction) {
    return <FactionSelection onComplete={loadProfile} />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative max-w-md mx-auto overflow-hidden font-sans select-none antialiased">
      
      {/* Global Menu Icon (Top Left) */}
      <div className="absolute top-6 left-6 z-[100]">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-zinc-600 hover:text-white p-2 transition-colors active:scale-95"
        >
          <GiHamburgerMenu size={20} />
        </button>
      </div>

      {/* Gold Amount (Top Right) */}
      <div className="absolute top-8 right-8 z-[100] flex items-center gap-2 group cursor-pointer hover:bg-zinc-900/50 py-1 px-3 rounded-full transition-all">
        <GiTwoCoins className="text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
        <span className="text-white text-xs font-black italic tracking-tighter tabular-nums drop-shadow-sm">
          {userProfile?.gold || 0}
        </span>
      </div>

      {/* Settings Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[240px] bg-zinc-950 border-r border-zinc-900 z-[120] p-8 flex flex-col"
            >
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-600 mb-12 italic">Settings</h2>
              
              <div className="flex-grow space-y-6">
                 <button 
                  onClick={() => { setShowSettings(true); setIsMenuOpen(false); }}
                  className="flex items-center gap-3 w-full text-zinc-300 hover:text-white transition-colors group"
                 >
                    <GiSettingsKnobs className="text-zinc-700 group-hover:text-orange-500 transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic pt-1">Account Vault</span>
                 </button>
              </div>

              <button 
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full text-red-900 hover:text-red-500 transition-colors group border-t border-zinc-900 pt-8"
              >
                <GiPowerButton className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Extinguish</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Main Content Area */}
      <main className="flex-grow w-full flex flex-col items-center justify-center relative z-10 transition-all duration-500 overflow-y-auto no-scrollbar pb-24 px-4">
        {activeTab === 'Forge' && <Forge userProfile={userProfile} />}
        {activeTab === 'Smith' && <Character userProfile={userProfile} onUpdate={loadProfile} />}
        {activeTab === 'Armory' && <Armory userProfile={userProfile} />}
        {activeTab === 'Market' && <Merchant userProfile={userProfile} onSell={loadProfile} />}
      </main>
      
      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Atmosphere */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black to-black opacity-40 pointer-events-none" />

      {/* Account Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <AccountSettings 
            user={session.user}
            profile={userProfile}
            onUpdate={loadProfile}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}