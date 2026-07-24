'use client';

import React, { useState } from 'react';
import { useMapStore } from '@/stores/useMapStore';
import { useGPSStore } from '@/stores/useGPSStore';
import { Compass, Crosshair, MapPin, ShieldCheck, Locate } from 'lucide-react';
import { GISLayerControls } from './GISLayerControls';
import { HealthDashboardModal } from '@/components/ui/HealthDashboardModal';
import { GISLayerType } from '@/types/spatial';

const CAMPUS_GATE = { lat: 13.2219, lng: 77.7539 };

export const MapControlsOverlay: React.FC = () => {
  const { setCenter, setBearing, setSelectedBuildingId, setZoom } = useMapStore();
  const { userLocation, accuracyMeters, isPermissionGranted } = useGPSStore();
  const [isHealthOpen, setIsHealthOpen] = useState(false);

  const [activeGISLayers, setActiveGISLayers] = useState<Record<GISLayerType, boolean>>({
    BUILDINGS: true,
    WALKWAYS: true,
    ENTRANCES: true,
    POIS: true,
    NAVIGATION_GRAPH: false,
    PARKING: true,
    EMERGENCY: true,
    SUSTAINABILITY: true,
  });

  const handleToggleGISLayer = (layer: GISLayerType) => {
    setActiveGISLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  const handleRecenter = () => {
    setSelectedBuildingId(null);
    // If GPS is good, center on real location; otherwise go to campus gate
    if (userLocation && accuracyMeters <= 200) {
      setCenter(userLocation);
      setZoom(19);
    } else {
      setCenter(CAMPUS_GATE);
      setZoom(17);
    }
  };

  const handleResetCompass = () => {
    setBearing(0);
  };

  // GPS quality indicator for the recenter button
  const gpsGood = isPermissionGranted && userLocation && accuracyMeters <= 200;
  const gpsAcquiring = isPermissionGranted && (!userLocation || accuracyMeters > 200);

  return (
    <>
      <HealthDashboardModal
        isOpen={isHealthOpen}
        onClose={() => setIsHealthOpen(false)}
      />

      {/* Campus Location Chip — Top Left, padded for mobile notch */}
      <div className="absolute top-3 left-3 z-20 max-w-[220px] sm:max-w-[280px] px-3 py-1.5 rounded-full bg-slate-900/92 backdrop-blur-xl border border-slate-700 shadow-xl flex items-center gap-2 select-none">
        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="text-white text-[11px] font-semibold truncate">
          Chanakya University Global Campus
        </span>
      </div>

      {/* GPS Acquiring toast — shown when GPS permission granted but accuracy still bad */}
      {gpsAcquiring && (
        <div className="absolute top-12 left-3 right-3 z-20 mx-auto max-w-xs">
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 shadow-xl">
            <span className="relative flex shrink-0">
              <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
            <span className="text-[10px] font-semibold text-amber-300">
              Acquiring GPS… step outside for best accuracy
            </span>
          </div>
        </div>
      )}

      {/* Control Buttons — Right side, positioned 38% from top (avoids top chip & bottom sheet) */}
      <div
        className="absolute right-3 z-20 flex flex-col gap-2.5"
        style={{ top: '38%', transform: 'translateY(-50%)' }}
      >
        {/* Health Dashboard */}
        <button
          onClick={() => setIsHealthOpen(true)}
          aria-label="Open System Health Dashboard"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700 shadow-xl flex items-center justify-center active:scale-95 transition-all hover:border-emerald-500/50"
        >
          <ShieldCheck className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-emerald-400" />
        </button>

        {/* Reset Compass */}
        <button
          onClick={handleResetCompass}
          aria-label="Reset Compass North"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700 shadow-xl flex items-center justify-center active:scale-95 transition-all hover:border-emerald-500/50"
        >
          <Compass className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-emerald-400" />
        </button>

        {/* Recenter / My Location */}
        <button
          onClick={handleRecenter}
          aria-label={gpsGood ? 'Recenter to My Location' : 'Center on Campus'}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-900/90 backdrop-blur-xl border shadow-xl flex items-center justify-center active:scale-95 transition-all ${
            gpsGood
              ? 'border-blue-500/60 hover:border-blue-400'
              : 'border-amber-500/40 hover:border-amber-400/60'
          }`}
        >
          {gpsGood ? (
            <Crosshair className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-blue-400" />
          ) : (
            <Locate className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-amber-400" />
          )}
        </button>

        {/* GIS Layer Control Panel — opens upward */}
        <GISLayerControls
          activeLayers={activeGISLayers}
          onToggleLayer={handleToggleGISLayer}
        />
      </div>
    </>
  );
};
