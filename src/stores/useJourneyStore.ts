import { create } from 'zustand';
import { Venue } from '@/types/venue';

export interface JourneyEntry {
  venueId: string;
  venueName: string;
  timestamp: string;
}

interface JourneyState {
  history: JourneyEntry[];
  lastUnfinishedVenue: Venue | null;
  addVisitedVenue: (venue: Venue) => void;
  setUnfinishedVenue: (venue: Venue | null) => void;
  clearUnfinishedVenue: () => void;
}

export const useJourneyStore = create<JourneyState>((set, get) => ({
  history: [],
  lastUnfinishedVenue: null,
  addVisitedVenue: (venue: Venue) => {
    const current = get().history;
    const filtered = current.filter((h) => h.venueId !== venue.id);
    const updated = [
      {
        venueId: venue.id,
        venueName: venue.name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...filtered,
    ].slice(0, 5);

    set({ history: updated });
  },
  setUnfinishedVenue: (venue: Venue | null) => set({ lastUnfinishedVenue: venue }),
  clearUnfinishedVenue: () => set({ lastUnfinishedVenue: null }),
}));
