'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigationStore } from '@/stores/useNavigationStore';

interface BottomSheetProps {
  children: React.ReactNode;
}

/**
 * Bottom sheet for mobile with full touch/pointer swipe gesture support.
 * - Supports swipe up/down with velocity-based snap
 * - Real-time drag feedback via translateY (no re-render during drag)
 * - Three snap points: peek (100px) | half (50vh) | full (88vh)
 * - touch-action: none on handle prevents scroll conflicts
 */

const TAB_BAR_PX = 64; // px — fixed bottom tab bar height

type SnapKey = 'peek' | 'half' | 'full';

// Snap point heights as viewport fractions (0-1)
const SNAP_VH: Record<SnapKey, number> = {
  peek: 0.14,   // ~100px on a 700px screen
  half: 0.50,   // 50% of viewport
  full: 0.88,   // 88% of viewport
};

const snapOrder: SnapKey[] = ['peek', 'half', 'full'];

function snapKeyToLabel(snap: SnapKey): string {
  return snap;
}

function getSnapPxHeight(snap: SnapKey): number {
  if (typeof window === 'undefined') return 300;
  return Math.round(window.innerHeight * SNAP_VH[snap]);
}

function resolveSnap(vh: number): SnapKey {
  if (vh >= 0.85) return 'full';
  if (vh <= 0.22) return 'peek';
  return 'half';
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ children }) => {
  const { mode, selectedVenue, sheetSnapPoint, setSheetSnapPoint } = useNavigationStore();
  const [snap, setSnap] = useState<SnapKey>('half');

  // Refs for drag state — no re-renders during active drag
  const sheetRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const lastVelocityY = useRef(0);
  const lastEventTime = useRef(0);
  const lastEventY = useRef(0);
  const animFrameId = useRef<number | null>(null);

  // ── Sync snap from store ──────────────────────────────────────────
  useEffect(() => {
    if (mode === 'NAVIGATING') setSnap('peek');
    else if (mode === 'PREVIEW' || selectedVenue) setSnap('half');
  }, [mode, selectedVenue]);

  useEffect(() => {
    if (typeof sheetSnapPoint === 'number') {
      setSnap(resolveSnap(sheetSnapPoint));
    }
  }, [sheetSnapPoint]);

  // ── Apply snap height to DOM (bypasses React render for speed) ───
  const applyHeight = useCallback((px: number, animated: boolean) => {
    const el = sheetRef.current;
    if (!el) return;
    el.style.transition = animated ? 'height 280ms cubic-bezier(0.32,0.72,0,1)' : 'none';
    el.style.height = `${px}px`;
  }, []);

  // Apply snap height whenever snap key changes
  useEffect(() => {
    applyHeight(getSnapPxHeight(snap), true);
  }, [snap, applyHeight]);

  // ── Drag Handlers ────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (mode === 'NAVIGATING') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartHeight.current = sheetRef.current?.offsetHeight ?? getSnapPxHeight(snap);
    lastVelocityY.current = 0;
    lastEventY.current = e.clientY;
    lastEventTime.current = e.timeStamp;

    // Disable transition during drag for instant feedback
    if (sheetRef.current) sheetRef.current.style.transition = 'none';
  }, [mode, snap]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging.current) return;

    const deltaY = dragStartY.current - e.clientY; // positive = dragging up = expanding
    const newHeight = Math.max(80, Math.min(
      window.innerHeight - TAB_BAR_PX - 16,
      dragStartHeight.current + deltaY
    ));

    // Calculate instantaneous velocity (px/ms → px/s)
    const dt = e.timeStamp - lastEventTime.current;
    if (dt > 0) {
      lastVelocityY.current = (lastEventY.current - e.clientY) / dt * 1000;
    }
    lastEventY.current = e.clientY;
    lastEventTime.current = e.timeStamp;

    if (animFrameId.current !== null) cancelAnimationFrame(animFrameId.current);
    animFrameId.current = requestAnimationFrame(() => {
      if (sheetRef.current) {
        sheetRef.current.style.height = `${newHeight}px`;
      }
    });
  }, []);

  const onPointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const currentHeight = sheetRef.current?.offsetHeight ?? getSnapPxHeight(snap);
    const vhRatio = currentHeight / window.innerHeight;
    const velocity = lastVelocityY.current; // px/s, positive = expanding

    let nextSnap: SnapKey;
    const currentIdx = snapOrder.indexOf(snap);

    // Velocity-based snap: if fast swipe (>250 px/s), go to next snap in swipe direction
    if (velocity > 250 && currentIdx < snapOrder.length - 1) {
      nextSnap = snapOrder[currentIdx + 1];
    } else if (velocity < -250 && currentIdx > 0) {
      nextSnap = snapOrder[currentIdx - 1];
    } else {
      // Position-based snap: find nearest snap point
      const distances = snapOrder.map((key) => ({
        key,
        dist: Math.abs(SNAP_VH[key] - vhRatio),
      }));
      distances.sort((a, b) => a.dist - b.dist);
      nextSnap = distances[0].key;
    }

    setSnap(nextSnap);
    applyHeight(getSnapPxHeight(nextSnap), true);
    setSheetSnapPoint(nextSnap === 'full' ? 0.92 : nextSnap === 'half' ? 0.5 : 0.14);
  }, [snap, applyHeight, setSheetSnapPoint]);

  // Handle window resize — re-apply snap height
  useEffect(() => {
    const onResize = () => applyHeight(getSnapPxHeight(snap), false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [snap, applyHeight]);

  const cycleSnap = useCallback(() => {
    if (mode === 'NAVIGATING' || isDragging.current) return;
    const next: Record<SnapKey, SnapKey> = { peek: 'half', half: 'full', full: 'peek' };
    const nextSnap = next[snap];
    setSnap(nextSnap);
    setSheetSnapPoint(nextSnap === 'full' ? 0.92 : nextSnap === 'half' ? 0.5 : 0.14);
  }, [mode, snap, setSheetSnapPoint]);

  return (
    <div
      ref={sheetRef}
      style={{
        bottom: TAB_BAR_PX,
        height: getSnapPxHeight(snap),
        maxHeight: `calc(100vh - ${TAB_BAR_PX}px - 16px)`,
        willChange: 'height',
      }}
      className="fixed left-0 right-0 z-30 flex flex-col bg-slate-950/97 backdrop-blur-2xl border border-slate-800/60 rounded-t-[20px] shadow-2xl max-w-2xl mx-auto overflow-hidden"
    >
      {/* ── Drag Handle ─────────────────────────────────────────── */}
      <button
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={cycleSnap}
        aria-label="Resize panel — drag or tap to resize"
        disabled={mode === 'NAVIGATING'}
        style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
        className="w-full flex flex-col items-center justify-center pt-3 pb-1.5 shrink-0 focus:outline-none cursor-grab active:cursor-grabbing"
      >
        <div className="w-10 h-1.5 rounded-full bg-slate-600 hover:bg-emerald-500 active:bg-emerald-400 transition-colors" />
        {mode !== 'NAVIGATING' && (
          <div className="text-slate-600 mt-0.5">
            {snap === 'full'
              ? <ChevronDown className="w-3.5 h-3.5" />
              : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
        )}
      </button>

      {/* ── Scrollable Content ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 no-scrollbar overscroll-contain">
        {children}
      </div>
    </div>
  );
};
