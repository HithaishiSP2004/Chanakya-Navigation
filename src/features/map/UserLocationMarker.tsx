'use client';

import React from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { useGPSStore } from '@/stores/useGPSStore';
import { useNavigationStore } from '@/stores/useNavigationStore';

export const UserLocationMarker: React.FC = () => {
  const { userLocation, heading, accuracyMeters, isPermissionGranted, signalQuality, isWalking } = useGPSStore();
  const { mode } = useNavigationStore();

  if (!userLocation || !isPermissionGranted) return null;

  const position = { lat: userLocation.lat, lng: userLocation.lng };
  const isNavigating = mode === 'NAVIGATING';

  // Scale accuracy circle: 1 meter ≈ 1.5 pixels at zoom 18, capped for readability
  const accuracleSize = Math.min(Math.max(accuracyMeters * 1.2, 36), 160);

  // Signal quality colors
  const dotColor = signalQuality === 'EXCELLENT'
    ? '#3b82f6'   // blue-500
    : signalQuality === 'GOOD'
    ? '#22c55e'   // green-500
    : '#f59e0b';  // amber (weak GPS)

  return (
    <AdvancedMarker position={position} zIndex={200}>
      {/* Outer container — AdvancedMarker anchors to center of this element */}
      <div
        className="relative flex items-center justify-center pointer-events-none"
        style={{ width: 80, height: 80 }}
      >
        {/* GPS accuracy radius circle */}
        <div
          className="absolute rounded-full"
          style={{
            width: accuracleSize,
            height: accuracleSize,
            background: `${dotColor}18`,
            border: `1.5px solid ${dotColor}40`,
          }}
        />

        {/* Pulsing outer ring — always visible */}
        <div
          className="absolute rounded-full animate-ping"
          style={{
            width: 36,
            height: 36,
            background: `${dotColor}22`,
            border: `2px solid ${dotColor}55`,
            animationDuration: isWalking ? '1s' : '2s',
          }}
        />

        {/* Direction cone — only meaningful when heading is available */}
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
            <svg viewBox="0 0 60 80" width={isNavigating ? 52 : 44} height={isNavigating ? 52 : 44}>
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
          {/* Inner highlight gloss */}
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
