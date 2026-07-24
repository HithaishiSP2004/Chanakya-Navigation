'use client';

import React, { useEffect, useRef } from 'react';
import { PlayCircle, PauseCircle, MapPin, Navigation2, CheckCircle2, FastForward, Zap } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { JudgeDemoToolkit } from '@/components/ui/JudgeDemoToolkit';
import { useDemoStore } from '@/stores/useDemoStore';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useGPSStore } from '@/stores/useGPSStore';
import { NavigationRepository } from '@/repositories/navigationRepository';
import { graphEngine } from '@/utils/graphEngine';

export const DemoModeView: React.FC = () => {
  const {
    isDemoActive,
    isPaused,
    playbackSpeed,
    toggleDemoMode,
    setIsPaused,
    setPlaybackSpeed,
    selectedOriginNodeId,
    selectedDestinationBuildingId,
    setOriginNodeId,
    setDestinationBuildingId,
    simulationProgress,
    setSimulationProgress,
  } = useDemoStore();

  const { setActiveRoute, setMode, mode } = useNavigationStore();
  const { setUserLocation, setHeading } = useGPSStore();

  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const origins = [
    { id: 'node-gate-01', name: 'Gate 1 Entrance Arch (Main Entrance)' },
    { id: 'node-vista-02', name: 'Central Vista Promenade' },
    { id: 'node-res-01', name: 'Hostel Residential Quadrangle' },
  ];

  const destinations = [
    { id: 'bldg-admin-01', name: 'Office of Admissions (Admin Block)' },
    { id: 'bldg-acad-02', name: 'Sudha & Kris Gopalakrishnan Academic Block' },
    { id: 'bldg-food-04', name: 'Sri OP Jindal Food Court Plaza' },
    { id: 'bldg-hostel-03', name: 'Smt. Vidya Devi Jindal Hostel' },
  ];

  // Simulation step runner
  useEffect(() => {
    if (!isDemoActive || isPaused) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      return;
    }

    const startNode = graphEngine.getNode(selectedOriginNodeId);
    if (!startNode) return;

    const route = NavigationRepository.calculateRoute(
      startNode.coordinate,
      selectedDestinationBuildingId
    );

    if (!route || !route.polyline || route.polyline.length === 0) return;

    setActiveRoute(route);
    setMode('NAVIGATING');

    let currentStep = Math.floor((simulationProgress / 100) * (route.polyline.length - 1));

    simIntervalRef.current = setInterval(() => {
      currentStep += 1;

      if (currentStep >= route.polyline.length) {
        setSimulationProgress(100);
        setMode('ARRIVED');
        if (simIntervalRef.current) clearInterval(simIntervalRef.current);
        return;
      }

      const point = route.polyline[currentStep];
      const prevPoint = route.polyline[currentStep - 1] || point;

      // Calculate orientation heading
      const dLat = point.lat - prevPoint.lat;
      const dLng = point.lng - prevPoint.lng;
      const heading = (Math.atan2(dLng, dLat) * 180) / Math.PI;

      setUserLocation(point);
      setHeading((heading + 360) % 360);

      const progress = Math.round((currentStep / (route.polyline.length - 1)) * 100);
      setSimulationProgress(progress);
    }, Math.max(100, 1000 / playbackSpeed));

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [
    isDemoActive,
    isPaused,
    playbackSpeed,
    selectedOriginNodeId,
    selectedDestinationBuildingId,
    setActiveRoute,
    setMode,
    setUserLocation,
    setHeading,
    setSimulationProgress,
  ]);

  const handleStartWalkthrough = () => {
    setSimulationProgress(0);
    toggleDemoMode();
  };

  const handleInstantArrival = () => {
    const startNode = graphEngine.getNode(selectedOriginNodeId);
    if (!startNode) return;

    const route = NavigationRepository.calculateRoute(
      startNode.coordinate,
      selectedDestinationBuildingId
    );

    if (route && route.polyline.length > 0) {
      const destPoint = route.polyline[route.polyline.length - 1];
      setActiveRoute(route);
      setUserLocation(destPoint);
      setSimulationProgress(100);
      setMode('ARRIVED');
    }
  };

  return (
    <div className="flex flex-col gap-5 pt-2 pb-8">
      {/* Integrated Judge Demo Toolkit */}
      <JudgeDemoToolkit />

      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold mb-1">
          <PlayCircle className="w-3.5 h-3.5" />
          <span>Presentation Mode</span>
        </div>
        <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          Presentation Demo Simulator
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
          Simulate high-accuracy GPS walking routes for live judge demonstrations.
        </p>
      </div>

      <GlassCard variant="light" className="p-4 flex flex-col gap-4">
        {/* Origin Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Select Origin Point:</span>
          </label>
          <select
            value={selectedOriginNodeId}
            onChange={(e) => setOriginNodeId(e.target.value)}
            disabled={isDemoActive}
            className="w-full h-11 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none disabled:opacity-50"
          >
            {origins.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        {/* Destination Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Navigation2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Select Destination:</span>
          </label>
          <select
            value={selectedDestinationBuildingId}
            onChange={(e) => setDestinationBuildingId(e.target.value)}
            disabled={isDemoActive}
            className="w-full h-11 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none disabled:opacity-50"
          >
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Speed Controls (1x, 2x, 5x, 10x) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <FastForward className="w-4 h-4 text-purple-500" />
            <span>Simulation Walking Speed:</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 5, 10].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  playbackSpeed === spd
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 mt-2">
          <Button
            variant={isDemoActive ? 'danger' : 'primary'}
            onClick={handleStartWalkthrough}
            className="w-full py-3.5 shadow-xl"
            icon={<PlayCircle className="w-5 h-5" />}
          >
            {isDemoActive ? 'Stop Simulation' : 'Start Virtual Walkthrough'}
          </Button>

          {isDemoActive && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setIsPaused(!isPaused)}
                className="flex-1 text-xs"
                icon={isPaused ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleInstantArrival}
                className="flex-1 text-xs text-amber-600 dark:text-amber-400"
                icon={<Zap className="w-4 h-4 text-amber-500" />}
              >
                Instant Arrival
              </Button>
            </div>
          )}
        </div>

        {isDemoActive && (
          <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 flex flex-col gap-2 text-xs text-purple-700 dark:text-purple-300">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
                <span>Simulation Active ({playbackSpeed}x Speed)</span>
              </span>
              <span>{simulationProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-purple-200 dark:bg-purple-900/60 overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${simulationProgress}%` }}
              />
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
