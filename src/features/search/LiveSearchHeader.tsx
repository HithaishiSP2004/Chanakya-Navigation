'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, MapPin, ChevronRight, TrendingUp, Clock } from 'lucide-react';
import { mockVenues } from '@/repositories/venueRepository';
import { Venue } from '@/types/venue';
import { useMapStore } from '@/stores/useMapStore';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { SmartSearchEngine } from '@/utils/searchEngine';
import { NavigationAnalytics } from '@/utils/analytics';
import synonyms from '@/gis/synonyms.json';

const synonymMap: Record<string, string> = synonyms;

export const LiveSearchHeader: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const { setCenter, setSelectedBuildingId } = useMapStore();
  const { setSelectedVenue, setSheetSnapPoint } = useNavigationStore();

  useEffect(() => {
    setRecentSearches(SmartSearchEngine.getRecentSearches());
  }, []);

  const categories = [
    { id: 'ALL', label: 'All Places' },
    { id: 'ADMISSION', label: 'Admissions' },
    { id: 'ACADEMIC', label: 'Academic' },
    { id: 'CAFETERIA', label: 'Dining' },
    { id: 'SPORTS', label: 'Sports' },
    { id: 'HOSTEL', label: 'Hostel' },
    { id: 'MEDICAL', label: 'Health' },
  ];

  const popularSearchItems = [
    'Admissions Counter',
    'Food Court',
    'Badminton Court',
    'Library',
    'Engineering Labs',
  ];

  // Smart Multi-Tier Search Engine Logic with Relevance Ranking
  const filteredVenues = useMemo(() => {
    return SmartSearchEngine.search(query, selectedCategory, mockVenues);
  }, [query, selectedCategory]);

  const handleSelectVenue = (venue: Venue) => {
    if (query.trim()) {
      SmartSearchEngine.addRecentSearch(query.trim());
      setRecentSearches(SmartSearchEngine.getRecentSearches());
    }
    NavigationAnalytics.track('DESTINATION_SELECTED', {
      venueId: venue.id,
      venueName: venue.name,
      category: venue.category,
    });
    setSelectedVenue(venue);
    setCenter(venue.coordinate);
    setSelectedBuildingId(venue.buildingId || venue.id);
    setSheetSnapPoint(0.92);
    setIsFocused(false);
  };

  const handlePopularChipClick = (term: string) => {
    setQuery(term);
    setIsFocused(true);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Brand Header with Chanakya Logo */}
      <div className="flex items-center gap-2.5 mb-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/placeholders/campus-logo.svg"
          alt="Chanakya University Logo"
          className="w-8 h-8 rounded-full border border-emerald-500/40 shadow-lg"
        />
        <div>
          <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none">
            Chanakya Navigate
          </h1>
          <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            Official Digital Campus Guide & GIS Map
          </p>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="relative flex items-center w-full">
        <Search className="absolute left-4 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search admissions, engineering, sports, food..."
          className="w-full h-12 pl-11 pr-10 rounded-2xl bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm font-medium transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            aria-label="Clear Search"
            className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              // Auto-open results when a non-ALL category is selected
              if (cat.id !== 'ALL') setIsFocused(true);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
              selectedCategory === cat.id
                ? 'bg-emerald-700 text-white shadow-md dark:bg-emerald-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Popular Search Suggestions Chips */}
      {!query && isFocused && (
        <div className="flex flex-col gap-2 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              Popular Searches
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full">
            {popularSearchItems.map((item) => (
              <button
                key={item}
                onClick={() => handlePopularChipClick(item)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold whitespace-nowrap shrink-0 hover:bg-emerald-100 dark:hover:bg-emerald-950 hover:text-emerald-600 transition-all active:scale-95"
              >
                {item}
              </button>
            ))}
          </div>

          {recentSearches.length > 0 && (
            <>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  Recent Searches
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full">
                {recentSearches.map((rec) => (
                  <button
                    key={rec}
                    onClick={() => handlePopularChipClick(rec)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs font-semibold whitespace-nowrap shrink-0 hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-all"
                  >
                    {rec}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Live Search Results Overlay Dropdown */}
      {isFocused && (query.trim() || selectedCategory !== 'ALL') && (
        <div className="flex flex-col gap-2 mt-1 max-h-64 overflow-y-auto no-scrollbar rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 shadow-2xl">
          {filteredVenues.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
              No matching campus locations found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            filteredVenues.map((venue) => (
              <div
                key={venue.id}
                onClick={() => handleSelectVenue(venue)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {venue.name}
                      </h4>
                      {venue.status === 'OPEN' && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold">
                          Open Now
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {venue.buildingName} {venue.roomNumber ? `• Room ${venue.roomNumber}` : ''}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
