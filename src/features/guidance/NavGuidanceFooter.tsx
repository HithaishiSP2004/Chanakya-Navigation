'use client';

import React, { useEffect } from 'react';
import { X, Crosshair, Signal, Radio } from 'lucide-react';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useMapStore } from '@/stores/useMapStore';
import { useGPSStore } from '@/stores/useGPSStore';
import { LiveRouteEngine } from '@/utils/liveRouteEngine';
import { checkArrival } from '@/utils/arrivalEngine';
import { buildingPolygons } from '@/repositories/venueRepository';

export const NavGuidanceFooter: React.FC = () => {
  const {
    mode,
    activeRoute,
    setMode,
    resetNavigation,
    setLiveMetrics,
    setStepIndex,
    distanceWalkedMeters,
    remainingDistanceMeters,
    remainingDurationSeconds,
    liveWalkingSpeedMps,
    estimatedArrivalTime,
  } = useNavigationStore();
  const { setCenter } = useMapStore();
  const { userLocation, accuracyMeters, signalQuality, speedMps } = useGPSStore();

  // 1-second live route metrics update loop
  useEffect(() => {
    if (mode !== 'NAVIGATING' || !activeRoute || !userLocation) return;

    const interval = setInterval(() => {
      const metrics = LiveRouteEngine.calculateProgress(userLocation, activeRoute, speedMps);

      setLiveMetrics({
        liveWalkingSpeedMps: metrics.walkingSpeedMps,
        distanceWalkedMeters: metrics.distanceWalkedMeters,
        remainingDistanceMeters: metrics.remainingDistanceMeters,
        remainingDurationSeconds: metrics.remainingDurationSeconds,
        estimatedArrivalTime: metrics.estimatedArrivalTime,
        remainingPolyline: metrics.remainingPolyline,
      });

      if (metrics.currentStepIndex !== activeRoute.currentStepIndex) {
        setStepIndex(metrics.currentStepIndex);
      }

      // Check Multi-Factor Arrival
      const destBldg = buildingPolygons.find((b) => b.id === activeRoute.destinationBuildingId);
      const arrivalResult = checkArrival(
        userLocation,
        activeRoute.entrance.coordinate,
        destBldg,
        accuracyMeters,
        metrics.walkingSpeedMps
      );

      if (arrivalResult.isArrived) {
        setMode('ARRIVED');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, activeRoute, userLocation, speedMps, accuracyMeters, setLiveMetrics, setStepIndex, setMode]);

  if (mode !== 'NAVIGATING' || !activeRoute) return null;

  const totalDistance = Math.max(1, activeRoute.totalDistanceMeters);
  const walked = distanceWalkedMeters || 0;
  const progressPct = Math.min(100, Math.round((walked / totalDistance) * 100));

  // Use live remaining duration for ETA minutes (not the fixed total)
  const etaMinutes = Math.max(1, Math.ceil((remainingDurationSeconds || activeRoute.totalDurationSeconds) / 60));

  // Format remaining distance nicely
  const remainingLabel =
    (remainingDistanceMeters || activeRoute.remainingDistanceMeters) >= 1000
      ? `${((remainingDistanceMeters || activeRoute.remainingDistanceMeters) / 1000).toFixed(1)} km`
      : `${remainingDistanceMeters || activeRoute.remainingDistanceMeters}m`;

  const handleRecenter = () => {
    if (userLocation) setCenter(userLocation);
  };

  const getSignalBadge = () => {
    switch (signalQuality) {
      case 'EXCELLENT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
            <Signal className="w-3 h-3 text-emerald-500" />
            <span>GPS ±{Math.round(accuracyMeters)}m</span>
          </span>
        );
      case 'GOOD':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
            <Radio className="w-3 h-3 text-blue-500" />
            <span>GPS ±{Math.round(accuracyMeters)}m</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
            <Radio className="w-3 h-3 text-amber-500" />
            <span>Weak ±{Math.round(accuracyMeters)}m</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-white/97 dark:bg-slate-950/97 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800 shadow-2xl max-w-md mx-auto rounded-t-3xl flex flex-col gap-3">
      {/* Progress Bar */}
      <div className="w-full flex flex-col gap-1">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
          <span>{progressPct}% walked ({walked}m)</span>
          {getSignalBadge()}
        </div>
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Recenter camera button */}
        <button
          onClick={handleRecenter}
          aria-label="Re-center camera on my location"
          className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 active:scale-95 transition-all flex-shrink-0 shadow-sm"
        >
          <Crosshair className="w-5 h-5 text-blue-500" />
        </button>

        {/* ETA + Speed summary */}
        <div className="flex-1 text-center">
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 leading-none tabular-nums">
              {etaMinutes}
            </span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">min</span>
            {estimatedArrivalTime && (
              <span className="text-xs font-bold text-slate-400">
                ({estimatedArrivalTime})
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {remainingLabel} remaining
            {liveWalkingSpeedMps > 0.3 && ` · ${(liveWalkingSpeedMps * 3.6).toFixed(1)} km/h`}
          </p>
        </div>

        {/* Cancel navigation */}
        <button
          onClick={resetNavigation}
          aria-label="Cancel navigation"
          className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 active:scale-95 transition-all flex-shrink-0 shadow-sm"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
