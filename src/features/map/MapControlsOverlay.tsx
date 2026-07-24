'use client';

import React, { useState } from 'react';
import { useMapStore } from '@/stores/useMapStore';
import { useGPSStore } from '@/stores/useGPSStore';
import { Compass, Crosshair, MapPin, ShieldCheck } from 'lucide-react';
import { GISLayerControls } from './GISLayerControls';
import { HealthDashboardModal } from '@/components/ui/HealthDashboardModal';
import { GISLayerType } from '@/types/spatial';

export const MapControlsOverlay: React.FC = () => {
  const { setCenter, setBearing, setSelectedBuildingId, setZoom } = useMapStore();
  const { userLocation } = useGPSStore();
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
    if (userLocation) {
      setCenter(userLocation);
      setZoom(18);
    } else {
      setCenter({ lat: 13.2219, lng: 77.7551 });
      setZoom(17);
    }
  };

  const handleResetCompass = () => {
    setBearing(0);
  };

  return (
    <>
      <HealthDashboardModal
        isOpen={isHealthOpen}
        onClose={() => setIsHealthOpen(false)}
      />

      {/* Campus Location Chip — Top Left */}
      <div className="absolute top-4 left-4 z-20 max-w-[260px] px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-xl border border-slate-700 shadow-xl flex items-center gap-2 select-none">
        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="text-white text-[11px] font-semibold truncate">
          Chanakya University Global Campus (Devanahalli)
        </span>
      </div>

      {/* Control Buttons — Right side, mid-screen */}
      <div className="absolute right-3 z-20 flex flex-col gap-2" style={{ top: '45%', transform: 'translateY(-50%)' }}>
        <button
          onClick={() => setIsHealthOpen(true)}
          aria-label="Open System Health Dashboard"
          className="w-11 h-11 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700 shadow-xl flex items-center justify-center active:scale-95 transition-all hover:border-emerald-500/50"
        >
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
        </button>

        <button
          onClick={handleResetCompass}
          aria-label="Reset Compass"
          className="w-11 h-11 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700 shadow-xl flex items-center justify-center active:scale-95 transition-all hover:border-emerald-500/50"
        >
          <Compass className="w-5 h-5 text-emerald-400" />
        </button>

        <button
          onClick={handleRecenter}
          aria-label="Recenter to My Location"
          className="w-11 h-11 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700 shadow-xl flex items-center justify-center active:scale-95 transition-all hover:border-blue-500/50"
        >
          <Crosshair className="w-5 h-5 text-blue-400" />
        </button>

        {/* GIS Layer Control Panel Dropdown */}
        <GISLayerControls
          activeLayers={activeGISLayers}
          onToggleLayer={handleToggleGISLayer}
        />
      </div>
    </>
  );
};
