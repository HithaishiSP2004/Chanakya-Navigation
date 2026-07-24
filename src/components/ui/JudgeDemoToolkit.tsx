'use client';

import React from 'react';
import { Play, FastForward, RotateCcw, Award, Sparkles, Navigation, Zap } from 'lucide-react';
import { useDemoStore } from '@/stores/useDemoStore';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useGPSStore } from '@/stores/useGPSStore';
import { useMapStore } from '@/stores/useMapStore';
import { NavigationRepository } from '@/repositories/navigationRepository';
import { mockVenues } from '@/repositories/venueRepository';

export const JudgeDemoToolkit: React.FC = () => {
  const {
    isDemoActive,
    playbackSpeed,
    setDemoActive,
    setPlaybackSpeed,
    setSimulationProgress,
    resetSimulation,
    setOriginNodeId,
    setDestinationBuildingId,
  } = useDemoStore();
  const { setSelectedVenue, setActiveRoute, setMode, setSheetSnapPoint } = useNavigationStore();
  const { userLocation } = useGPSStore();
  const { setCenter } = useMapStore();

  const handleLaunchPreset = (venueId: string, bldgId: string) => {
    const venue = mockVenues.find((v) => v.id === venueId) || mockVenues[0];
    const origin = userLocation || { lat: 13.2219, lng: 77.7539 };
    const route = NavigationRepository.calculateRoute(origin, venue.id);

    if (route) {
      setOriginNodeId('node-gate-01');
      setDestinationBuildingId(bldgId);
      setSelectedVenue(venue);
      setActiveRoute(route);
      setCenter(venue.coordinate);
      setMode('NAVIGATING');
      setSheetSnapPoint(0.28);
      setDemoActive(true);
    }
  };

  const handleTeleportArrival = () => {
    setSimulationProgress(98);
  };

  const handleResetDemo = () => {
    resetSimulation();
    setMode('IDLE');
    setSelectedVenue(null);
    setActiveRoute(null);
    setSheetSnapPoint(0.5);
  };

  return (
    <div className="flex flex-col gap-2 p-3 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-800 shadow-2xl text-white">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-100">Hackathon Judge Demo Controls</span>
        </div>
        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
          Presentation Mode
        </span>
      </div>

      {/* Preset Demo Route Buttons */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          onClick={() => handleLaunchPreset('v-admis-room-01', 'bldg-admin-01')}
          className="py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-emerald-950 hover:text-emerald-300 border border-slate-700 text-[10px] font-bold truncate transition-all text-slate-200"
        >
          Admissions Tour
        </button>

        <button
          onClick={() => handleLaunchPreset('v-sports-01', 'bldg-acad-02')}
          className="py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-blue-950 hover:text-blue-300 border border-slate-700 text-[10px] font-bold truncate transition-all text-slate-200"
        >
          Sports Complex
        </button>

        <button
          onClick={() => handleLaunchPreset('v-food-01', 'bldg-food-04')}
          className="py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-orange-950 hover:text-orange-300 border border-slate-700 text-[10px] font-bold truncate transition-all text-slate-200"
        >
          Food Court
        </button>
      </div>

      {/* Playback Controls & Speed Multipliers */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-400 font-bold mr-1">Speed:</span>
          {[1, 2, 5, 10].map((s) => (
            <button
              key={s}
              onClick={() => setPlaybackSpeed(s)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                playbackSpeed === s
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleTeleportArrival}
            className="flex items-center gap-1 py-1 px-2 rounded-xl bg-amber-950/80 border border-amber-800/60 text-amber-300 text-[10px] font-bold hover:bg-amber-900 transition-all active:scale-95"
          >
            <Zap className="w-3 h-3 fill-amber-400" />
            <span>Teleport</span>
          </button>

          <button
            onClick={handleResetDemo}
            className="flex items-center gap-1 py-1 px-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold hover:bg-slate-700 transition-all active:scale-95"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
