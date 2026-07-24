'use client';

import React, { useState, useEffect } from 'react';
import { PartyPopper, CheckCircle2, Compass, ChevronRight, ChevronLeft, MapPin, Building } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useUIStore } from '@/stores/useUIStore';
import { NavigationAnalytics } from '@/utils/analytics';

export const ArrivalCelebrationCard: React.FC = () => {
  const { mode, activeRoute, selectedVenue, resetNavigation } = useNavigationStore();
  const { setActiveTab } = useUIStore();
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    if (mode === 'ARRIVED' && activeRoute) {
      NavigationAnalytics.track('ARRIVED', {
        venueId: activeRoute.destinationBuildingId,
        venueName: activeRoute.destinationBuildingName,
      });
    }
  }, [mode, activeRoute]);

  if (mode !== 'ARRIVED' || !activeRoute) return null;

  const photos = selectedVenue?.photos || selectedVenue?.images || [
    '/images/placeholders/building.svg',
    '/images/placeholders/campus-logo.svg',
  ];

  const photoCaptions = [
    'Main Building Entrance',
    'Foyer / Reception Desk',
    'Hallway & Corridor',
    'Destination Room Entrance',
  ];

  const handleDone = () => {
    NavigationAnalytics.track('NAVIGATION_COMPLETED');
    resetNavigation();
  };

  const handleExplore = () => {
    NavigationAnalytics.track('NAVIGATION_COMPLETED');
    resetNavigation();
    setActiveTab('EXPLORE');
  };

  const handleNextPhoto = () => {
    setPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = () => {
    setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <GlassCard variant="light" className="w-full max-w-sm p-5 flex flex-col items-center text-center gap-4 shadow-2xl overflow-hidden rounded-3xl">
        {/* Celebration Header Badge */}
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg">
          <PartyPopper className="w-7 h-7 animate-bounce" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Destination Confirmed</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
            You Have Arrived!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            {selectedVenue?.name || activeRoute.destinationBuildingName}
          </p>
        </div>

        {/* Photo Guided Arrival Gallery Carousel */}
        <div className="w-full relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/50 group shadow-md">
          <div className="h-44 w-full relative flex items-center justify-center bg-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[photoIndex]}
              alt={photoCaptions[photoIndex] || 'Arrival photo'}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            
            <div className="absolute bottom-2 left-3 right-3 text-left">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Photo Guidance ({photoIndex + 1}/{photos.length})
              </span>
              <p className="text-xs font-semibold text-white truncate">
                {photoCaptions[photoIndex] || 'Destination Landmark'}
              </p>
            </div>

            {photos.length > 1 && (
              <>
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 backdrop-blur-sm shadow-md"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 backdrop-blur-sm shadow-md"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                  {photos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPhotoIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${idx === photoIndex ? 'w-5 bg-emerald-400' : 'w-1.5 bg-white/60 hover:bg-white'}`}
                      aria-label={`View arrival photo ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Room, Floor & Landmark Description */}
        <div className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left flex flex-col gap-1.5 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-500" />
              {activeRoute.destinationBuildingName}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px]">
              {selectedVenue?.floorName || `Floor ${selectedVenue?.floor || 0}`}
            </span>
          </div>

          {selectedVenue?.landmarkDescription && (
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              &ldquo;{selectedVenue.landmarkDescription}&rdquo;
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 w-full pt-1">
          <Button variant="primary" onClick={handleDone} className="w-full shadow-lg">
            Done Navigation
          </Button>
          <Button variant="secondary" onClick={handleExplore} className="w-full" icon={<Compass className="w-4 h-4" />}>
            Explore Building Info
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};
