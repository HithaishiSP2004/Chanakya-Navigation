'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, X, Navigation } from 'lucide-react';
import { useGPSStore } from '@/stores/useGPSStore';
import { useMapStore } from '@/stores/useMapStore';

/**
 * LocationPermissionBanner
 *
 * Shown when GPS permission hasn't been granted.
 * On mobile: displayed as a full-width prominent banner at the bottom edge of the map.
 * When tapped, triggers the browser GPS permission dialog via getCurrentPosition.
 */
export const LocationPermissionBanner: React.FC = () => {
  const { isPermissionGranted, setPermissionGranted, setUserLocation, setAccuracy } = useGPSStore();
  const { setCenter, setZoom } = useMapStore();
  const [dismissed, setDismissed] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [permState, setPermState] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');

  useEffect(() => {
    if (!navigator.permissions) return;
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      setPermState(result.state as 'unknown' | 'granted' | 'denied' | 'prompt');
      result.onchange = () => setPermState(result.state as 'unknown' | 'granted' | 'denied' | 'prompt');
    });
  }, []);

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
        setAccuracy(accuracy || 99);
        setPermissionGranted(true);
        // Only center on user location if accuracy is reasonable
        if ((accuracy ?? 999) <= 200) {
          setCenter({ lat: latitude, lng: longitude });
          setZoom(18);
        }
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
    <div className="fixed top-14 left-0 right-0 z-50 px-3 max-w-xl mx-auto">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-2xl shadow-2xl border ${
          permState === 'denied'
            ? 'bg-rose-950/95 border-rose-500/40'
            : 'bg-slate-900/98 border-emerald-500/40'
        }`}
      >
        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            permState === 'denied'
              ? 'bg-rose-900/60 border border-rose-500/40'
              : 'bg-emerald-950/60 border border-emerald-500/40'
          }`}
        >
          {permState === 'denied' ? (
            <MapPin className="w-5 h-5 text-rose-400" />
          ) : (
            <Navigation className="w-5 h-5 text-emerald-400" />
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          {permState === 'denied' ? (
            <>
              <p className="text-xs font-bold text-rose-300 leading-tight">Location Blocked</p>
              <p className="text-[10px] text-rose-400/80 mt-0.5 leading-tight">
                Browser Settings → Site Settings → Location → Allow
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-white leading-tight">Enable GPS for live navigation</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                Step outside & tap Allow for best accuracy
              </p>
            </>
          )}
        </div>

        {/* Allow button */}
        {permState !== 'denied' && (
          <button
            onClick={handleAllow}
            disabled={requesting}
            className="shrink-0 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all disabled:opacity-60 shadow-lg"
          >
            {requesting ? (
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                <span>…</span>
              </span>
            ) : (
              'Allow'
            )}
          </button>
        )}

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
