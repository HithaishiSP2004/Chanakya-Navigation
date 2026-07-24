import { create } from 'zustand';

const FAVORITES_STORAGE_KEY = 'chanakya_favorite_venue_ids_v1';

interface FavoritesState {
  favoriteIds: string[];
  toggleFavorite: (venueId: string) => void;
  isFavorite: (venueId: string) => boolean;
  hydrate: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: ['v-admis-room-01', 'v-food-01'],
  hydrate: () => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (stored) {
          set({ favoriteIds: JSON.parse(stored) });
        }
      } catch (e) {
        console.warn('Failed to hydrate favorites', e);
      }
    }
  },
  toggleFavorite: (venueId: string) => {
    const current = get().favoriteIds;
    const exists = current.includes(venueId);
    const updated = exists
      ? current.filter((id) => id !== venueId)
      : [...current, venueId];

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist favorites', e);
      }
    }

    set({ favoriteIds: updated });
  },
  isFavorite: (venueId: string) => get().favoriteIds.includes(venueId),
}));
