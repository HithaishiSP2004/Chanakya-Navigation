'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, Share2, Heart, Clock, Building } from 'lucide-react';
import { Venue } from '@/types/venue';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useGPSStore } from '@/stores/useGPSStore';
import { NavigationRepository } from '@/repositories/navigationRepository';
import { NavigationAnalytics } from '@/utils/analytics';

interface DestinationCardProps {
  venue: Venue;
  distanceMeters?: number;
  walkingTimeMinutes?: number;
  onSelect?: (venue: Venue) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  venue,
  distanceMeters = 180,
  walkingTimeMinutes = 2,
  onSelect,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [copied, setCopied] = useState(false);
  const { setSelectedVenue, setActiveRoute, setMode, setSheetSnapPoint } = useNavigationStore();
  const { userLocation } = useGPSStore();

  const handleCardClick = () => {
    if (onSelect) onSelect(venue);
    else {
      setSelectedVenue(venue);
      setSheetSnapPoint(0.92);
    }
  };

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    NavigationAnalytics.track('ROUTE_CALCULATED', {
      venueId: venue.id,
      venueName: venue.name,
    });
    const origin = userLocation || { lat: 13.2219, lng: 77.7539 };
    const route = NavigationRepository.calculateRoute(origin, venue.id);
    if (route) {
      setSelectedVenue(venue);
      setActiveRoute(route);
      setMode('PREVIEW');
      setSheetSnapPoint(0.5);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: venue.name,
        text: `Find ${venue.name} at Chanakya University`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${venue.name} (${venue.buildingName})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const heroPhoto = venue.heroImage || venue.imageUrl || (venue.photos && venue.photos[0]) || '/images/placeholders/building.svg';

  return (
    <div
      onClick={handleCardClick}
      className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 flex flex-col gap-2.5 shadow-sm hover:shadow-xl hover:border-emerald-500/50 cursor-pointer transition-all duration-300 active:scale-[0.98]"
    >
      {/* Hero Image Header */}
      <div className="relative rounded-xl overflow-hidden h-32 w-full bg-slate-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroPhoto}
          alt={venue.name}
          className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/90 text-white backdrop-blur-md">
              {venue.category}
            </span>
            <button
              onClick={handleToggleFavorite}
              aria-label="Favorite Place"
              className="p-1.5 rounded-full bg-slate-950/70 border border-slate-700/80 text-slate-200 hover:text-rose-500 transition-colors"
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-200">
            <span className="px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-700/80 flex items-center gap-1 backdrop-blur-md">
              <Clock className="w-3 h-3 text-emerald-400" />
              {walkingTimeMinutes} min walk ({distanceMeters}m)
            </span>
          </div>
        </div>
      </div>

      {/* Info Content */}
      <div className="flex flex-col gap-1">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-500 transition-colors line-clamp-1">
          {venue.name}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Building className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="truncate">{venue.buildingName} {venue.roomNumber ? `• Room ${venue.roomNumber}` : ''}</span>
        </p>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copied ? 'Copied' : 'Share'}</span>
        </button>

        <button
          onClick={handleNavigate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-900/20 active:scale-95 transition-all"
        >
          <Navigation className="w-3.5 h-3.5 fill-white" />
          <span>Navigate</span>
        </button>
      </div>
    </div>
  );
};
