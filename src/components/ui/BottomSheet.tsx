'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigationStore } from '@/stores/useNavigationStore';

interface BottomSheetProps {
  children: React.ReactNode;
}

/**
 * Bottom sheet for mobile. Sits above the tab nav bar.
 * Tab bar height = ~64px (py-3 * 2 + icon + text).
 * Three snap heights: peek | half | full.
 */
const TAB_BAR_PX = 64;

type SnapKey = 'peek' | 'half' | 'full';

const SNAP_HEIGHTS: Record<SnapKey, string> = {
  peek: '100px',
  half: '50vh',
  full: '85vh',
};

export const BottomSheet: React.FC<BottomSheetProps> = ({ children }) => {
  const { mode, selectedVenue, sheetSnapPoint, setSheetSnapPoint } = useNavigationStore();
  const [snap, setSnap] = useState<SnapKey>('half');

  useEffect(() => {
    if (mode === 'NAVIGATING') setSnap('peek');
    else if (mode === 'PREVIEW' || selectedVenue) setSnap('half');
  }, [mode, selectedVenue]);

  useEffect(() => {
    if (typeof sheetSnapPoint === 'number') {
      if (sheetSnapPoint >= 0.85) setSnap('full');
      else if (sheetSnapPoint <= 0.22) setSnap('peek');
      else setSnap('half');
    }
  }, [sheetSnapPoint]);

  const cycleSnap = () => {
    if (mode === 'NAVIGATING') return;
    const next: Record<SnapKey, SnapKey> = { peek: 'half', half: 'full', full: 'peek' };
    const nextSnap = next[snap];
    setSnap(nextSnap);
    setSheetSnapPoint(nextSnap === 'full' ? 0.92 : nextSnap === 'half' ? 0.5 : 0.18);
  };

  return (
    <div
      style={{
        bottom: TAB_BAR_PX,
        height: SNAP_HEIGHTS[snap],
        maxHeight: `calc(100vh - ${TAB_BAR_PX}px - 16px)`,
      }}
      className="fixed left-0 right-0 z-30 flex flex-col bg-slate-950/97 backdrop-blur-2xl border border-slate-800/60 rounded-t-[20px] shadow-2xl transition-all duration-300 ease-in-out max-w-2xl mx-auto"
    >
      {/* Drag handle */}
      <button
        onClick={cycleSnap}
        aria-label="Resize panel"
        disabled={mode === 'NAVIGATING'}
        className="w-full flex flex-col items-center justify-center pt-2.5 pb-1 shrink-0 focus:outline-none"
      >
        <div className="w-10 h-1 rounded-full bg-slate-700 hover:bg-emerald-500 transition-colors" />
        {mode !== 'NAVIGATING' && (
          <div className="text-slate-600 mt-0.5">
            {snap === 'full' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
        )}
      </button>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 no-scrollbar">
        {children}
      </div>
    </div>
  );
};
