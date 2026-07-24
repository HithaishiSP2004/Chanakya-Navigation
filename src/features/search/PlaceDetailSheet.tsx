'use client';

import React, { useState, useMemo } from 'react';
import { Loader2, 
  MapPin, 
  Navigation, 
  Compass, 
  ExternalLink, 
  Phone, 
  Mail, 
  Info,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Share2,
  Clock,
  Building,
  CheckCircle2,
  Maximize2
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useGPSStore } from '@/stores/useGPSStore';
import { useUIStore } from '@/stores/useUIStore';
import { NavigationRepository } from '@/repositories/navigationRepository';
import { mockVenues } from '@/repositories/venueRepository';
import { KnowledgeGraphEngine } from '@/utils/knowledgeGraphEngine';
import { PhotoLightboxModal } from '@/components/ui/PhotoLightboxModal';
import { NavigationAnalytics } from '@/utils/analytics';

import { useFavoritesStore } from '@/stores/useFavoritesStore';
import { useJourneyStore } from '@/stores/useJourneyStore';

export const PlaceDetailSheet: React.FC = () => {
  const { selectedVenue, setSelectedVenue, setActiveRoute, setMode, setSheetSnapPoint } = useNavigationStore();
  const { userLocation, snappedLocation, accuracyMeters } = useGPSStore();
  const { setActiveTab } = useUIStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { addVisitedVenue, setUnfinishedVenue } = useJourneyStore();

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState<boolean>(false);

  const contextualRecs = useMemo(() => {
    if (!selectedVenue) return [];
    return KnowledgeGraphEngine.getContextualRecommendations(selectedVenue, mockVenues, 3);
  }, [selectedVenue]);

  if (!selectedVenue) return null;

  const imageList = selectedVenue.photos || selectedVenue.images || [selectedVenue.imageUrl];
  const photoCaptions = [
    'Main Entrance & Exterior',
    'Foyer / Reception',
    'Hallway & Corridor',
    'Interior Room Desk',
  ];

  const handleBack = () => {
    setSelectedVenue(null);
    setSheetSnapPoint(0.5);
  };

  const handleCalculateRoute = async () => {
    NavigationAnalytics.track('ROUTE_CALCULATED', {
      venueId: selectedVenue.id,
      venueName: selectedVenue.name,
    });
    addVisitedVenue(selectedVenue);
    setUnfinishedVenue(selectedVenue);

    // ── Smart origin selection ────────────────────────────────────────
    // When GPS accuracy is poor (>20m), the raw userLocation can be 50-100m off.
    // Use the walkway-snapped location instead — it's constrained to the routing
    // graph and will always produce a valid route start node.
    //
    // Priority:
    //  1. snappedLocation (if GPS exists and accuracy > 20m) — on the walkway graph
    //  2. userLocation (if GPS is accurate ≤ 20m) — direct user position
    //  3. Campus gate centroid (fallback if no GPS at all)
    let origin: { lat: number; lng: number };
    if (!userLocation) {
      // No GPS at all — use campus gate as default origin
      origin = { lat: 13.2219, lng: 77.7539 };
    } else if (accuracyMeters > 20 && snappedLocation) {
      // GPS weak — use walkway-snapped position for accurate route start
      origin = snappedLocation;
    } else {
      // GPS is accurate — use the real smoothed position
      origin = userLocation;
    }

    setIsCalculatingRoute(true);
    try {
      const route = await NavigationRepository.calculateRouteAsync(origin, selectedVenue.id);
      if (route) {
        setActiveRoute(route);
        setMode('PREVIEW');
        setSheetSnapPoint(0.5);
      }
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const handleOpenExplore = () => {
    setActiveTab('EXPLORE');
    setSheetSnapPoint(0.92);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedVenue.name,
        text: `Check out ${selectedVenue.name} at Chanakya University!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${selectedVenue.name} - ${selectedVenue.buildingName}`);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % imageList.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  return (
    <div className="flex flex-col gap-4 pt-1 pb-6">
      {/* Photo Lightbox Modal */}
      <PhotoLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={imageList}
        currentIndex={activeImageIndex}
        onIndexChange={setActiveImageIndex}
        title={selectedVenue.name}
        captions={photoCaptions}
      />

      {/* Top Header & Back Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Search</span>
        </button>
        <div className="flex items-center gap-2">
          {selectedVenue.status === 'OPEN' && (
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Open Now
            </span>
          )}
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            {selectedVenue.category}
          </span>
        </div>
      </div>

      {/* Hero Image Gallery & Carousel */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 h-52 sm:h-60 group shadow-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageList[activeImageIndex]}
          alt={selectedVenue.name}
          className="w-full h-full object-cover opacity-90 transition-all duration-300 cursor-pointer hover:scale-105"
          onClick={() => setIsLightboxOpen(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent p-4 flex flex-col justify-end pointer-events-none">
          <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
            {selectedVenue.name}
          </h2>
          <p className="text-xs text-slate-300 flex items-center gap-1 mt-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{selectedVenue.buildingName} {selectedVenue.roomNumber ? `• Room ${selectedVenue.roomNumber}` : ''}</span>
          </p>
        </div>

        {/* Fullscreen Expand CTA */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          className="absolute top-3 left-3 p-1.5 rounded-full bg-slate-950/70 border border-slate-700/80 text-white hover:bg-emerald-600 transition-colors shadow-md"
          aria-label="View fullscreen photo"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Carousel Controls & Dot Indicators if multiple images exist */}
        {imageList.length > 1 && (
          <>
            <button
              onClick={prevImage}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 border border-slate-700/80 text-white hover:bg-emerald-600 transition-colors shadow-md"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 border border-slate-700/80 text-white hover:bg-emerald-600 transition-colors shadow-md"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-[10px] font-bold text-slate-200 flex items-center gap-1 backdrop-blur-md">
              <ImageIcon className="w-3 h-3 text-emerald-400" />
              <span>{activeImageIndex + 1} / {imageList.length}</span>
            </div>
            {/* Active Dot Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {imageList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setActiveImageIndex(idx); }}
                  className={`h-2 rounded-full transition-all ${idx === activeImageIndex ? 'w-6 bg-emerald-400 shadow-md' : 'w-2 bg-white/60 hover:bg-white'}`}
                  aria-label={`View photo ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Photo Thumbnails Selector Strip (Mobile & Tab) */}
      {imageList.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {imageList.map((imgUrl, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImageIndex(idx)}
              className={`relative h-14 w-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                idx === activeImageIndex
                  ? 'border-emerald-500 scale-105 shadow-md'
                  : 'border-slate-300 dark:border-slate-800 opacity-60 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Quick Facts Grid */}
      <div className="grid grid-cols-2 gap-2.5 text-xs">
        <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2.5 min-w-0">
          <Building className="w-4 h-4 text-blue-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location</span>
            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{selectedVenue.floorName || `Floor ${selectedVenue.floor}`}</p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2.5 min-w-0">
          <Clock className="w-4 h-4 text-purple-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hours</span>
            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{selectedVenue.openingHours || '8:30 AM - 6:00 PM'}</p>
          </div>
        </div>
      </div>

      {/* Description & Landmark Card */}
      <GlassCard variant="light" className="p-4 flex flex-col gap-3">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {selectedVenue.description}
          </p>
        </div>

        {selectedVenue.landmarkDescription && (
          <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/40 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300">
            <span className="font-bold">Landmark Guidance: </span>
            <span>&ldquo;{selectedVenue.landmarkDescription}&rdquo;</span>
          </div>
        )}

        {/* Accessibility Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
          <span className="text-[10px] font-bold text-slate-400 uppercase w-full">Accessibility Features:</span>
          {selectedVenue.isAccessible && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Wheelchair Ramp Access
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
            <CheckCircle2 className="w-3 h-3 text-blue-500" />
            Elevator Available
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
            <CheckCircle2 className="w-3 h-3 text-purple-500" />
            Accessible Entrance
          </span>
        </div>

        {/* Contact Links */}
        {(selectedVenue.phone || selectedVenue.email || selectedVenue.officialLink) && (
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 text-xs text-slate-500 dark:text-slate-400">
            {selectedVenue.phone && (
              <a href={`tel:${selectedVenue.phone}`} className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                <Phone className="w-3.5 h-3.5" />
                <span>{selectedVenue.phone}</span>
              </a>
            )}
            {selectedVenue.email && (
              <a href={`mailto:${selectedVenue.email}`} className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium hover:underline">
                <Mail className="w-3.5 h-3.5" />
                <span>Email Desk</span>
              </a>
            )}
          </div>
        )}
      </GlassCard>

      {/* Sub-Venues (Rooms / Facilities inside this building) */}
      {selectedVenue.subVenues && selectedVenue.subVenues.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block" />
            Rooms & Facilities Inside
          </div>
          <div className="flex flex-col gap-1.5">
            {selectedVenue.subVenues.map((sv) => (
              <div
                key={sv.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60"
              >
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{sv.name}</h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {sv.roomNumber && `${sv.roomNumber} · `}{sv.floorName || ''}
                  </p>
                </div>
                {sv.openingHours && (
                  <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2 truncate max-w-[80px]">
                    {sv.openingHours.split('(')[0].trim()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contextual Recommendations Engine ("Because you're visiting...") */}
      {contextualRecs.length > 0 && (
        <div className="flex flex-col gap-2 p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            <span>Recommended Nearby Places:</span>
          </div>
          <div className="flex flex-col gap-2">
            {contextualRecs.map((rec) => (
              <div
                key={rec.venue.id}
                onClick={() => setSelectedVenue(rec.venue)}
                className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-slate-700 cursor-pointer border border-slate-200/60 dark:border-slate-700/60 transition-all"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {rec.venue.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {rec.relationshipLabel} • {rec.distanceMeters}m ({rec.walkingTimeMinutes} min walk)
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}


      {/* GPS Accuracy Warning — shown when signal is too weak for precise routing */}
      {userLocation && accuracyMeters > 40 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-950/60 border border-amber-600/50 text-amber-300 text-[11px]">
          <span className="relative flex shrink-0">
            <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
          </span>
          <span>
            <strong>GPS acquiring</strong> (±{Math.round(accuracyMeters)}m) — Route will start from nearest walkway. Step outside for better accuracy.
          </span>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="grid grid-cols-3 gap-2.5">
        <Button
          variant="primary"
          onClick={handleCalculateRoute}
          disabled={isCalculatingRoute}
          className="col-span-2 shadow-lg py-3.5"
          icon={isCalculatingRoute
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Navigation className="w-4 h-4 fill-white" />
          }
        >
          {isCalculatingRoute ? 'Calculating Route...' : 'Start Navigation'}
        </Button>

        <Button
          variant="secondary"
          onClick={handleShare}
          className="col-span-1 py-3.5"
          icon={<Share2 className="w-4 h-4" />}
        >
          {copiedShare ? 'Copied!' : 'Share'}
        </Button>
      </div>
    </div>
  );
};
