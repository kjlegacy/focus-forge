import React from 'react';
import { GiAnvil, GiCrossedSwords, GiCharacter, GiTwoCoins } from 'react-icons/gi';

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'Forge', icon: GiAnvil, label: 'Forge' },
    { id: 'Armory', icon: GiCrossedSwords, label: 'Armory' },
    { id: 'Character', icon: GiCharacter, label: 'Character' },
    { id: 'Merchant', icon: GiTwoCoins, label: 'Merchant' },
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-zinc-900 border-t border-zinc-800 flex justify-around items-center p-4 pb-8 z-50 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center w-16 transition-all duration-200 active:scale-90 ${isActive ? 'text-orange-500 drop-shadow-[0_0_8px_rgba(255,128,0,0.8)]' : 'text-zinc-500 hover:text-zinc-400'
              }`}
          >
            <Icon size={28} className="mb-1" />
            <span className="text-xs font-semibold">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}