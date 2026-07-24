'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  GraduationCap, 
  FileCheck, 
  Utensils, 
  Home, 
  ShieldAlert, 
  ExternalLink,
  Compass,
  Navigation,
  Sparkles
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { mockExploreCards } from '@/repositories/exploreRepository';
import { mockVenues } from '@/repositories/venueRepository';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useMapStore } from '@/stores/useMapStore';
import { useGPSStore } from '@/stores/useGPSStore';
import { NavigationRepository } from '@/repositories/navigationRepository';
import { NavigationAnalytics } from '@/utils/analytics';

export const ExploreChanakyaView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const { setSelectedVenue, setActiveRoute, setMode, setSheetSnapPoint } = useNavigationStore();
  const { setCenter, setSelectedBuildingId } = useMapStore();
  const { userLocation } = useGPSStore();

  const categories = [
    { id: 'ALL', label: 'All Handbook' },
    { id: 'COLLECTIONS', label: 'Curated Tours' },
    { id: 'SCHOOLS', label: 'Schools' },
    { id: 'FACILITIES', label: 'Facilities' },
    { id: 'DINING', label: 'Dining' },
    { id: 'HOSTELS', label: 'Hostels' },
    { id: 'EMERGENCY', label: 'Emergency' },
  ];

  const filteredCards = activeCategory === 'ALL'
    ? mockExploreCards
    : mockExploreCards.filter((card) => card.category === activeCategory);

  const getIcon = (name: string) => {
    switch (name) {
      case 'Building2': return <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'FileCheck': return <FileCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'Utensils': return <Utensils className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      case 'Home': return <Home className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      default: return <Compass className="w-5 h-5 text-emerald-500" />;
    }
  };

  const handleCardClick = (card: (typeof mockExploreCards)[0]) => {
    const targetVenueId = card.venueId || (card.venueIds && card.venueIds[0]);
    if (!targetVenueId) return;

    const targetVenue = mockVenues.find((v) => v.id === targetVenueId);
    if (targetVenue) {
      NavigationAnalytics.track('DESTINATION_SELECTED', {
        venueId: targetVenue.id,
        venueName: targetVenue.name,
      });
      setSelectedVenue(targetVenue);
      setCenter(targetVenue.coordinate);
      setSelectedBuildingId(targetVenue.buildingId || targetVenue.id);
      setSheetSnapPoint(0.92);
    }
  };

  const handleNavigateDirect = (e: React.MouseEvent, card: (typeof mockExploreCards)[0]) => {
    e.stopPropagation();
    const targetVenueId = card.venueId || (card.venueIds && card.venueIds[0]);
    if (!targetVenueId) return;

    const targetVenue = mockVenues.find((v) => v.id === targetVenueId);
    if (targetVenue) {
      const origin = userLocation || { lat: 13.2219, lng: 77.7539 };
      const route = NavigationRepository.calculateRoute(origin, targetVenue.id);
      if (route) {
        setSelectedVenue(targetVenue);
        setActiveRoute(route);
        setMode('PREVIEW');
        setSheetSnapPoint(0.5);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 pt-2 pb-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Explore Chanakya
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
          Official Digital Campus Guide, Curated Tours & Directory
        </p>
      </div>

      {/* Category Filter Chips Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/20 dark:bg-emerald-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Explore Cards Grid */}
      <div className="flex flex-col gap-3.5">
        {filteredCards.map((card) => {
          const hasVenue = card.venueId || (card.venueIds && card.venueIds.length > 0);

          return (
            <GlassCard
              key={card.id}
              variant="light"
              className={`p-4 flex flex-col gap-2.5 transition-all ${
                hasVenue ? 'cursor-pointer hover:border-emerald-500/50' : ''
              }`}
              onClick={() => handleCardClick(card)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                    {getIcon(card.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {card.title}
                      </h3>
                      {card.badgeText && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                          <Sparkles className="w-3 h-3 text-purple-500" />
                          {card.badgeText}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {card.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                {hasVenue ? (
                  <button
                    onClick={(e) => handleNavigateDirect(e, card)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <Navigation className="w-3.5 h-3.5 fill-emerald-500" />
                    <span>Navigate Tour</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    Official Directory
                  </span>
                )}

                {card.officialWebLink && (
                  <a
                    href={card.officialWebLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>Website</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
