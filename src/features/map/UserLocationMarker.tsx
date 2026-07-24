'use client';

import React from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { useGPSStore } from '@/stores/useGPSStore';
import { useNavigationStore } from '@/stores/useNavigationStore';

/**
 * UserLocationMarker
 *
 * Always shows the blue dot as soon as ANY GPS position is available.
 * The accuracy circle scales to reflect signal quality — just like Google Maps.
 *
 * Signal tiers:
 *  ≤ 10m  → EXCELLENT  — small tight blue dot, tiny ring
 *  ≤ 30m  → GOOD       — standard blue dot, small ring
 *  ≤ 100m → FAIR       — amber dot, medium ring
 *  > 100m → POOR       — grey dot, large translucent ring + "Approximate" label
 *
 * The dot is NEVER hidden for accuracy reasons — only hidden when
 * permission is not granted or no position has been received yet.
 */
export const UserLocationMarker: React.FC = () => {
  const {
    userLocation,
    heading,
    accuracyMeters,
    isPermissionGranted,
    isWalking,
  } = useGPSStore();
  const { mode } = useNavigationStore();

  // ── Guard: no permission → never show ──────────────────────────
  if (!userLocation || !isPermissionGranted) return null;

  // ── Don't render when GPS is purely network/IP-based (>200m) ───
  // At that accuracy, the dot could be 2km off-campus and confuse the user.
  // Google Maps also doesn't position the blue dot when accuracy is this bad.
  // We still show the blue dot as soon as real GPS starts locking in (<200m).
  if (accuracyMeters > 200) return null;

  const position = { lat: userLocation.lat, lng: userLocation.lng };
  const isNavigating = mode === 'NAVIGATING';

  // ── Signal tier ──────────────────────────────────────────────────
  const tier =
    accuracyMeters <= 10  ? 'EXCELLENT' :
    accuracyMeters <= 30  ? 'GOOD'      :
    accuracyMeters <= 100 ? 'FAIR'      :
                            'POOR';

  const dotColor =
    tier === 'EXCELLENT' ? '#3b82f6' :  // blue-500
    tier === 'GOOD'      ? '#22c55e' :  // green-500
    tier === 'FAIR'      ? '#f59e0b' :  // amber-500
                           '#94a3b8';   // slate-400 (poor/network location)

  const isApproximate = tier === 'POOR'; // > 100m accuracy

  // ── Accuracy circle ──────────────────────────────────────────────
  // Scale: at zoom ~18, 1 degree lat ≈ 111000m ≈ screen pixels varies.
  // We use a CSS pixel size that's roughly proportional, capped for readability.
  // At zoom 18: ~1m ≈ 0.6px → 10m≈6px, 100m≈60px, 2000m=cap at 240px
  const accuracyCirclePx = Math.min(Math.max(accuracyMeters * 0.6, 32), 240);

  // ── Dot size ────────────────────────────────────────────────────
  const dotSize = isNavigating ? 22 : isApproximate ? 14 : 18;

  // ── Pulse speed ─────────────────────────────────────────────────
  const pulseSpeed = isWalking ? '0.9s' : isApproximate ? '3s' : '2s';

  return (
    <AdvancedMarker position={position} zIndex={200}>
      {/* Outer container — AdvancedMarker anchors to center of this element */}
      <div
        className="relative flex items-center justify-center pointer-events-none"
        style={{ width: 80, height: 80 }}
      >
        {/* ── Large accuracy radius circle ─────────────────────── */}
        <div
          className="absolute rounded-full"
          style={{
            width: accuracyCirclePx,
            height: accuracyCirclePx,
            background: `${dotColor}${isApproximate ? '14' : '18'}`,
            border: `1.5px solid ${dotColor}${isApproximate ? '55' : '40'}`,
            // Dashed border for approximate location (>100m) like Google Maps
            ...(isApproximate ? { borderStyle: 'dashed', borderWidth: '2px' } : {}),
          }}
        />

        {/* ── Pulsing outer ring ───────────────────────────────── */}
        <div
          className="absolute rounded-full animate-ping"
          style={{
            width: 36,
            height: 36,
            background: `${dotColor}22`,
            border: `2px solid ${dotColor}55`,
            animationDuration: pulseSpeed,
          }}
        />

        {/* ── Direction heading cone (only when we have heading) ── */}
        {heading > 0 && tier !== 'POOR' && (
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

        {/* ── Core dot ─────────────────────────────────────────── */}
        <div
          className="relative z-10 rounded-full border-[3px] border-white flex items-center justify-center"
          style={{
            width: dotSize,
            height: dotSize,
            background: `radial-gradient(circle at 35% 35%, ${dotColor}ee, ${dotColor})`,
            boxShadow: `0 0 0 3px ${dotColor}33, 0 4px 16px ${dotColor}88`,
            // Semi-transparent dot for approximate location (poor GPS)
            opacity: isApproximate ? 0.75 : 1,
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: isNavigating ? 7 : 5,
              height: isNavigating ? 7 : 5,
              background: 'rgba(255,255,255,0.75)',
            }}
          />
        </div>

        {/* ── "Approximate location" label for poor GPS ────────── */}
        {isApproximate && (
          <div
            className="absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-lg whitespace-nowrap z-20"
            style={{
              background: 'rgba(2,6,23,0.88)',
              border: '1px solid rgba(148,163,184,0.3)',
              backdropFilter: 'blur(8px)',
              fontSize: '8px',
              fontWeight: 700,
              color: '#94a3b8',
            }}
          >
            ≈ {Math.round(accuracyMeters)}m
          </div>
        )}
      </div>
    </AdvancedMarker>
  );
};
