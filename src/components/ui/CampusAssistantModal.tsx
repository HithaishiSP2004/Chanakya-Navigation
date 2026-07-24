'use client';

import React, { useState } from 'react';
import { Sparkles, X, Send, Navigation, MapPin, Lightbulb, Loader2 } from 'lucide-react';
import { AssistantEngine, AssistantAnswer } from '@/utils/assistantEngine';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useGPSStore } from '@/stores/useGPSStore';
import { useMapStore } from '@/stores/useMapStore';
import { NavigationRepository } from '@/repositories/navigationRepository';
import { Venue } from '@/types/venue';

interface CampusAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_PROMPTS = [
  { label: '🏛️ Admissions', query: 'Where is the Admissions Office?' },
  { label: '💰 Pay Fees', query: 'Where to pay fees?' },
  { label: '🍽️ Food Court', query: 'Take me to the food court' },
  { label: '📚 Library', query: 'Where is the library?' },
  { label: '⚽ Sports', query: 'Show me the sports complex' },
  { label: '🏥 Clinic', query: 'Where is the medical clinic?' },
  { label: '🏠 Hostel', query: 'Where are the student hostels?' },
  { label: '🖨️ Printing', query: 'Where can I print and photocopy?' },
];

export const CampusAssistantModal: React.FC<CampusAssistantModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<AssistantAnswer | null>(null);
  const [isNavigating, setIsNavigating] = useState<string | null>(null); // venueId being navigated to

  const { setSelectedVenue, setActiveRoute, setMode, setSheetSnapPoint } = useNavigationStore();
  const { setCenter, setSelectedBuildingId } = useMapStore();
  const { userLocation } = useGPSStore();

  if (!isOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setAnswer(AssistantEngine.processQuery(query, userLocation));
  };

  const handleChipClick = (q: string) => {
    setQuery(q);
    setAnswer(AssistantEngine.processQuery(q, userLocation));
  };

  const handleNavigateVenue = async (venue: Venue) => {
    setIsNavigating(venue.id);

    const origin = userLocation || { lat: 13.2219, lng: 77.7539 };

    try {
      const route = await NavigationRepository.calculateRouteAsync(origin, venue.id);
      setSelectedVenue(venue);
      setCenter(venue.coordinate);
      setSelectedBuildingId(venue.buildingId || venue.id);

      if (route) {
        setActiveRoute(route);
        setMode('PREVIEW');
        setSheetSnapPoint(0.5);
      } else {
        setSheetSnapPoint(0.92);
      }
    } finally {
      setIsNavigating(null);
    }
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-slate-950/92 backdrop-blur-xl p-3 sm:p-6 text-white cursor-pointer"
      style={{ animation: 'fadeIn 0.15s ease-out' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5 max-h-[88vh] overflow-y-auto no-scrollbar cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-900/40">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Campus Guide</h3>
              <p className="text-[10px] font-semibold text-emerald-400">Find any room · Get directions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick prompts */}
        <div className="grid grid-cols-4 gap-1.5">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p.query}
              onClick={() => handleChipClick(p.query)}
              className="px-2 py-2 rounded-2xl bg-slate-800 hover:bg-emerald-950/80 hover:border-emerald-800 border border-slate-700 text-slate-300 hover:text-emerald-300 text-[10px] font-bold text-center transition-all active:scale-95 leading-tight"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='e.g. "Where is fee payment?" or "Find library"'
            className="w-full h-12 pl-4 pr-12 rounded-2xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-2 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Answer output */}
        {answer && (
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            {/* Intent tag + title */}
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                {answer.intent.replace(/_/g, ' ')}
              </span>
              <h4 className="text-sm font-bold text-slate-100 mt-2">{answer.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">{answer.responseMessage}</p>
            </div>

            {/* Distance note (only when GPS known) */}
            {answer.distanceNote && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-300">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{answer.distanceNote}</span>
              </div>
            )}

            {/* Tip */}
            {answer.tip && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>{answer.tip}</span>
              </div>
            )}

            {/* Recommended venue cards */}
            <div className="flex flex-col gap-2 mt-0.5">
              {answer.recommendedVenues.map((v) => {
                const isLoading = isNavigating === v.id;
                return (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-xl bg-emerald-950 text-emerald-400 shrink-0">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-100 truncate group-hover:text-emerald-400 transition-colors">
                          {v.name}
                        </h5>
                        <p className="text-[10px] text-slate-400 truncate">
                          {v.buildingName}{v.floorName ? ` · ${v.floorName}` : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleNavigateVenue(v)}
                      disabled={!!isNavigating}
                      className="ml-2 shrink-0 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-md hover:bg-emerald-500 active:scale-95 transition-all disabled:opacity-60"
                    >
                      {isLoading
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Navigation className="w-3 h-3 fill-white" />
                      }
                      <span>{isLoading ? '...' : 'Go'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
