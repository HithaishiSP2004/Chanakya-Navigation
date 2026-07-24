'use client';

import React from 'react';
import { Map, Compass, PlayCircle } from 'lucide-react';
import { useUIStore, ActiveTab } from '@/stores/useUIStore';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { clsx } from 'clsx';

export const TabNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useUIStore();
  const { mode } = useNavigationStore();

  // Hide during active navigation (NavGuidanceFooter takes over)
  if (mode === 'NAVIGATING') return null;

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'NAVIGATE', label: 'Navigate', icon: <Compass className="w-5 h-5" /> },
    { id: 'EXPLORE', label: 'Explore', icon: <Map className="w-5 h-5" /> },
    { id: 'DEMO', label: 'Demo', icon: <PlayCircle className="w-5 h-5" /> },
  ];

  return (
    // Fixed to bottom of screen, z-index above bottom sheet (z-40 > z-30)
    <div className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto px-4 pb-3 pt-1 pointer-events-auto">
      <div className="px-3 py-2 bg-slate-950/95 backdrop-blur-2xl border border-slate-800/80 shadow-2xl rounded-3xl flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-label={tab.label}
              className={clsx(
                'relative flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-2xl transition-all duration-300 active:scale-95 min-h-[48px]',
                {
                  'text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 shadow-lg shadow-emerald-950/50 font-bold': isActive,
                  'text-slate-400 hover:text-slate-200 font-medium': !isActive,
                }
              )}
            >
              <div className="mb-1 transition-transform duration-200 group-hover:scale-110">{tab.icon}</div>
              <span className="text-[10px] tracking-wide">{tab.label}</span>
              {isActive && (
                <div className="absolute -bottom-1 w-5 h-1 rounded-full bg-emerald-400 shadow-glow" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
