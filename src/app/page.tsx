'use client';

import React, { useState } from 'react';
import { Compass, Map, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { StartupSequence } from '@/features/splash/StartupSequence';
import { MapAdapter } from '@/features/map/MapAdapter';
import { MapControlsOverlay } from '@/features/map/MapControlsOverlay';
import { LocationPermissionBanner } from '@/features/map/LocationPermissionBanner';
import { HomeScreen } from '@/features/home/HomeScreen';
import { ExploreChanakyaView } from '@/features/explore/ExploreChanakyaView';
import { DemoModeView } from '@/features/demo-mode/DemoModeView';
import { TurnGuidanceCard } from '@/features/guidance/TurnGuidanceCard';
import { NavGuidanceFooter } from '@/features/guidance/NavGuidanceFooter';
import { ArrivalCelebrationCard } from '@/features/guidance/ArrivalCelebrationCard';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { FloatingActionHub } from '@/components/ui/FloatingActionHub';
import { useUIStore, ActiveTab } from '@/stores/useUIStore';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useGPSWatcher } from '@/hooks/useGPSWatcher';
import { useRerouting } from '@/hooks/useRerouting';
import { clsx } from 'clsx';

// ─── Tab Config ──────────────────────────────────────────────────────
const TABS: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
  { id: 'NAVIGATE', label: 'Navigate', icon: <Compass className="w-5 h-5" /> },
  { id: 'EXPLORE',  label: 'Explore',  icon: <Map className="w-5 h-5" /> },
  { id: 'DEMO',     label: 'Demo',     icon: <PlayCircle className="w-5 h-5" /> },
];

// ─── Tab Bar (shared between mobile and desktop) ─────────────────────
const TabBar: React.FC<{ orientation?: 'horizontal' | 'vertical' }> = ({ orientation = 'horizontal' }) => {
  const { activeTab, setActiveTab } = useUIStore();
  return (
    <div className={clsx(
      'flex gap-1 shrink-0',
      orientation === 'horizontal' ? 'flex-row px-3 pt-2 pb-1 border-b border-slate-800/60' : 'flex-row px-3 pt-3 pb-2 border-b border-slate-800/50'
    )}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all duration-200',
              isActive
                ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-700/50 shadow-sm'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
            )}
          >
            <span className="w-4 h-4 shrink-0">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// ─── Mobile Bottom Tab Navigation ───────────────────────────────────
const MobileTabNav: React.FC = () => {
  const { activeTab, setActiveTab } = useUIStore();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 safe-area-pb">
      <div className="flex items-stretch max-w-lg mx-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 transition-all duration-200 relative',
                isActive ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-full bg-emerald-500" />
              )}
              <span className="w-5 h-5">{tab.icon}</span>
              <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// ─── Page Content ────────────────────────────────────────────────────
const ContentView: React.FC = () => {
  const { activeTab } = useUIStore();
  return (
    <>
      {activeTab === 'NAVIGATE' && <HomeScreen />}
      {activeTab === 'EXPLORE' && <ExploreChanakyaView />}
      {activeTab === 'DEMO' && <DemoModeView />}
    </>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────
export default function MainPage() {
  const { mode } = useNavigationStore();
  const [collapsed, setCollapsed] = useState(false);

  useGPSWatcher();
  useRerouting();

  const hidePanel = mode === 'NAVIGATING';

  return (
    <main className="relative w-full h-screen overflow-hidden bg-slate-950">

      {/* ── STARTUP SPLASH ── */}
      <StartupSequence />

      {/* ── FULL-SCREEN MAP ── */}
      <div className="absolute inset-0 z-0">
        <MapAdapter />
      </div>

      {/* ── RIGHT MAP CONTROLS & FAB ── */}
      <MapControlsOverlay />
      <FloatingActionHub />

      {/* ── NAVIGATION MODE OVERLAYS ── */}
      <TurnGuidanceCard />
      <NavGuidanceFooter />
      <ArrivalCelebrationCard />

      {/* ══════════════════════════════════════════
          MOBILE LAYOUT  (< md / < 768px)
          Map = full screen
          Tab bar = bottom fixed
          Bottom sheet = slides up above tab bar
      ══════════════════════════════════════════ */}
      {!hidePanel && (
        <div className="block md:hidden">
          {/* Bottom tab nav */}
          <MobileTabNav />
          {/* Swipeable bottom sheet sits above tab bar */}
          <BottomSheet>
            <ContentView />
          </BottomSheet>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TABLET / DESKTOP LAYOUT  (≥ md / ≥ 768px)
          Collapsible left sidebar
      ══════════════════════════════════════════ */}
      {!hidePanel && (
        <div className="hidden md:block">
          {/* Collapse toggle handle */}
          <button
            onClick={() => setCollapsed(v => !v)}
            aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
            style={{ left: collapsed ? 0 : 360 }}
            className="fixed top-1/2 -translate-y-1/2 z-50 w-7 h-14 rounded-r-2xl bg-slate-800/95 border border-l-0 border-slate-700 flex items-center justify-center text-slate-400 hover:text-emerald-400 shadow-xl transition-all duration-300"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Sidebar panel */}
          <div
            style={{ width: 360 }}
            className={clsx(
              'fixed top-0 left-0 bottom-0 z-40 flex flex-col bg-slate-950/97 backdrop-blur-2xl border-r border-slate-800/70 shadow-2xl transition-transform duration-300',
              collapsed ? '-translate-x-full' : 'translate-x-0'
            )}
          >
            <TabBar orientation="horizontal" />
            <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
              <ContentView />
            </div>
          </div>
        </div>
      )}

      {/* ── GPS PERMISSION BANNER ── */}
      <LocationPermissionBanner />
    </main>
  );
}
