'use client';

import React from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { useGPSStore } from '@/stores/useGPSStore';
import { useNavigationStore } from '@/stores/useNavigationStore';

/**
 * UserLocationMarker
 *
 * Rendering rules:
 * - accuracyMeters > 80m: Show "acquiring GPS" pulsing ring only (no blue dot)
 *   → Prevents showing a misleading dot 100m from the real position
 * - accuracyMeters ≤ 80m: Show full blue dot + accuracy circle + heading cone
 * - signalQuality drives dot color: blue (excellent), green (good), amber (poor)
 */

const MAX_DISPLAY_ACCURACY_METERS = 80;

export const UserLocationMarker: React.FC = () => {
  const {
    userLocation,
    heading,
    accuracyMeters,
    isPermissionGranted,
    signalQuality,
    isWalking,
  } = useGPSStore();
  const { mode } = useNavigationStore();

  if (!userLocation || !isPermissionGranted) return null;

  const position = { lat: userLocation.lat, lng: userLocation.lng };
  const isNavigating = mode === 'NAVIGATING';
  const isWarmingUp = accuracyMeters > MAX_DISPLAY_ACCURACY_METERS;

  // Signal quality colors
  const dotColor =
    signalQuality === 'EXCELLENT'
      ? '#3b82f6'  // blue-500
      : signalQuality === 'GOOD'
      ? '#22c55e'  // green-500
      : '#f59e0b'; // amber — weak GPS

  // Accuracy radius circle size: 1m ≈ 1.5px at zoom 18, capped for readability
  const accuracyCircleSize = Math.min(Math.max(accuracyMeters * 1.2, 36), 160);

  // ── Warming-up state: show a "searching" spinner ring only ────────
  if (isWarmingUp) {
    return (
      <AdvancedMarker position={position} zIndex={200}>
        <div
          className="relative flex items-center justify-center pointer-events-none"
          style={{ width: 56, height: 56 }}
        >
          {/* Slow pulsing outer ring — "acquiring GPS" indicator */}
          <div
            className="absolute rounded-full animate-ping"
            style={{
              width: 44,
              height: 44,
              background: `#94a3b820`,
              border: `2px solid #94a3b870`,
              animationDuration: '2.5s',
            }}
          />
          {/* Static inner ring */}
          <div
            className="absolute rounded-full border-2 border-dashed border-slate-500/60"
            style={{ width: 28, height: 28 }}
          />
          {/* Small grey dot in center */}
          <div
            className="relative z-10 rounded-full border-2 border-white/60"
            style={{
              width: 10,
              height: 10,
              background: '#64748b',
              boxShadow: '0 0 0 2px #64748b33',
            }}
          />
        </div>
      </AdvancedMarker>
    );
  }

  // ── Normal state: accurate GPS — show full marker ─────────────────
  return (
    <AdvancedMarker position={position} zIndex={200}>
      <div
        className="relative flex items-center justify-center pointer-events-none"
        style={{ width: 80, height: 80 }}
      >
        {/* GPS accuracy radius circle */}
        <div
          className="absolute rounded-full"
          style={{
            width: accuracyCircleSize,
            height: accuracyCircleSize,
            background: `${dotColor}18`,
            border: `1.5px solid ${dotColor}40`,
          }}
        />

        {/* Pulsing outer ring — always visible, faster when walking */}
        <div
          className="absolute rounded-full animate-ping"
          style={{
            width: 36,
            height: 36,
            background: `${dotColor}22`,
            border: `2px solid ${dotColor}55`,
            animationDuration: isWalking ? '0.9s' : '2s',
          }}
        />

        {/* Direction heading cone — only when heading is available */}
        {heading >= 0 && (
          <div
            className="absolute flex items-center justify-center"
            style={{
              transform: `rotate(${heading}deg)`,
              transformOrigin: 'center center',
              width: 64,
              height: 64,
            }}
          >
            <svg
              viewBox="0 0 60 80"
              width={isNavigating ? 52 : 44}
              height={isNavigating ? 52 : 44}
            >
              <defs>
                <linearGradient id="coneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={dotColor} stopOpacity="0.55" />
                  <stop offset="100%" stopColor={dotColor} stopOpacity="0.08" />
                </linearGradient>
              </defs>
              <polygon
                points="30,0 5,60 30,44 55,60"
                fill="url(#coneGrad)"
                stroke={dotColor}
                strokeWidth="1"
                strokeOpacity="0.5"
              />
            </svg>
          </div>
        )}

        {/* Core blue dot */}
        <div
          className="relative z-10 rounded-full border-[3px] border-white flex items-center justify-center"
          style={{
            width: isNavigating ? 22 : 18,
            height: isNavigating ? 22 : 18,
            background: `radial-gradient(circle at 35% 35%, ${dotColor}ee, ${dotColor})`,
            boxShadow: `0 0 0 3px ${dotColor}33, 0 4px 16px ${dotColor}88`,
          }}
        >
          {/* Inner gloss highlight */}
          <div
            className="rounded-full"
            style={{
              width: isNavigating ? 7 : 5,
              height: isNavigating ? 7 : 5,
              background: 'rgba(255,255,255,0.75)',
            }}
          />
        </div>
      </div>
    </AdvancedMarker>
  );
};
