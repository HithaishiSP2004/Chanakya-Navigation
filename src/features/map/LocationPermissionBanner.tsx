'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import { useGPSStore } from '@/stores/useGPSStore';
import { useMapStore } from '@/stores/useMapStore';

/**
 * LocationPermissionBanner — shown when GPS permission hasn't been granted.
 * Clicking "Allow" explicitly triggers navigator.geolocation.getCurrentPosition
 * which FORCES the browser permission dialog to appear.
 */
export const LocationPermissionBanner: React.FC = () => {
  const { isPermissionGranted, setPermissionGranted, setUserLocation, setAccuracy } = useGPSStore();
  const { setCenter, setZoom } = useMapStore();
  const [dismissed, setDismissed] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [permState, setPermState] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');

  // Check the actual browser permission state on mount
  useEffect(() => {
    if (!navigator.permissions) return;
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      setPermState(result.state as any);
      result.onchange = () => setPermState(result.state as any);
    });
  }, []);

  // Don't show banner if already granted
  if (isPermissionGranted && permState !== 'denied') return null;
  if (dismissed) return null;
  if (permState === 'granted') return null;

  const handleAllow = () => {
    if (!('geolocation' in navigator)) return;
    setRequesting(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setAccuracy(accuracy || 10);
        setPermissionGranted(true);
        setCenter({ lat: latitude, lng: longitude });
        setZoom(18);
        setRequesting(false);
        setPermState('granted');
      },
      (err) => {
        console.warn('Location permission denied:', err.message);
        setPermissionGranted(false);
        setRequesting(false);
        if (err.code === err.PERMISSION_DENIED) {
          setPermState('denied');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div className="fixed top-12 left-0 right-0 z-50 max-w-xl mx-auto px-3">
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/98 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl">
        {/* Icon */}
        <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center shrink-0">
          <MapPin className="w-4.5 h-4.5 text-emerald-400" />
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          {permState === 'denied' ? (
            <>
              <p className="text-xs font-bold text-rose-400 leading-tight">Location Access Blocked</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                Enable in browser Settings → Site Settings → Location
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-slate-100 leading-tight">Share your location</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                For live navigation & "near me" features
              </p>
            </>
          )}
        </div>

        {/* Action */}
        {permState !== 'denied' && (
          <button
            onClick={handleAllow}
            disabled={requesting}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all active:scale-95 disabled:opacity-60"
          >
            {requesting ? '...' : 'Allow'}
          </button>
        )}

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
