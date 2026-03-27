import React, { useState } from 'react';
import BottomNav from './components/BottomNav';
import Forge from './components/Forge';
import Armory from './components/Armory';
import Character from './components/Character';
import './index.css';

/**
 * Focus Forge Mobile App Root
 * Integrates Forge, Armory, and the new Character progression system.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState('Forge');

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative max-w-md mx-auto overflow-hidden font-sans select-none antialiased">
      
      {/* Main App Container */}
      <main className="flex-grow w-full flex flex-col items-center justify-center relative z-10 transition-all duration-500">
        
        {activeTab === 'Forge' && <Forge />}
        
        {activeTab === 'Armory' && <Armory />}
        
        {activeTab === 'Character' && <Character />}
        
        {/* Merchant tab planned for next step! */}
        {activeTab === 'Merchant' && (
          <div className="flex flex-col items-center justify-center h-full text-center px-10 opacity-40">
             <div className="text-6xl text-zinc-800 mb-8">🛒</div>
             <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase italic">
                Merchant Coming Soon
             </h1>
          </div>
        )}

      </main>
      
      {/* Fixed Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Background Ambience / Subtle Vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black to-black opacity-30 pointer-events-none" />
    </div>
  );
}