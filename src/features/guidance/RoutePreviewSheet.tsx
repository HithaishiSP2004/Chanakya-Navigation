'use client';

import React from 'react';
import { Navigation, MapPin, Accessibility, ChevronLeft, Clock, Footprints } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { NavigationAnalytics } from '@/utils/analytics';

export const RoutePreviewSheet: React.FC = () => {
  const { activeRoute, selectedVenue, setMode, resetNavigation } = useNavigationStore();

  if (!activeRoute) return null;

  const handleStartNavigation = () => {
    NavigationAnalytics.track('NAVIGATION_STARTED', {
      venueId: activeRoute.destinationBuildingId,
      venueName: activeRoute.destinationBuildingName,
      distanceMeters: activeRoute.totalDistanceMeters,
      durationSeconds: activeRoute.totalDurationSeconds,
    });
    setMode('NAVIGATING');
  };

  const handleCancel = () => {
    NavigationAnalytics.track('NAVIGATION_CANCELLED');
    resetNavigation();
  };

  // Format distance: metres under 1km, else "X.X km"
  const distanceLabel =
    activeRoute.totalDistanceMeters >= 1000
      ? `${(activeRoute.totalDistanceMeters / 1000).toFixed(1)} km`
      : `${activeRoute.totalDistanceMeters} m`;

  // ETA in minutes — at least 1
  const etaMinutes = Math.max(1, Math.ceil(activeRoute.totalDurationSeconds / 60));

  // Arrival clock time
  const arrivalTime = new Date(Date.now() + activeRoute.totalDurationSeconds * 1000)
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col gap-4 pt-1 pb-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Cancel</span>
        </button>
        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
          Route Preview
        </span>
      </div>

      {/* Main route card */}
      <GlassCard variant="light" className="p-4 flex flex-col gap-3">
        {/* Destination + ETA */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">
              {selectedVenue?.name || activeRoute.destinationBuildingName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">{activeRoute.entrance.name}</span>
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 leading-none tabular-nums">
              {etaMinutes}
            </span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400"> min</span>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">≈ {arrivalTime}</p>
          </div>
        </div>

        {/* Distance + speed stats row */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Footprints className="w-3.5 h-3.5 text-blue-500" />
            <span>{distanceLabel}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Arrive by {arrivalTime}</span>
          </div>
        </div>

        {/* Room / Floor info if available */}
        {selectedVenue && (selectedVenue.floorName || selectedVenue.roomNumber) && (
          <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/70 text-xs text-slate-700 dark:text-slate-300 flex flex-col gap-1">
            <div className="flex items-center justify-between font-semibold">
              <span className="truncate">{selectedVenue.buildingName}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-2 shrink-0">
                {selectedVenue.floorName || `Floor ${selectedVenue.floor}`}
              </span>
            </div>
            {selectedVenue.roomNumber && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Room: {selectedVenue.roomNumber}
              </p>
            )}
            {selectedVenue.landmarkDescription && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                &ldquo;{selectedVenue.landmarkDescription}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Accessibility tag */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-800/50 text-xs text-slate-600 dark:text-slate-300">
          <Accessibility className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Paved pedestrian walkway · Wheelchair accessible</span>
        </div>
      </GlassCard>

      {/* Start navigation CTA */}
      <Button
        variant="primary"
        onClick={handleStartNavigation}
        className="w-full py-4 text-base shadow-xl"
        icon={<Navigation className="w-5 h-5 fill-white" />}
      >
        Start Walking Navigation
      </Button>
    </div>
  );
};
