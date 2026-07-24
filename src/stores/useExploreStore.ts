import { create } from 'zustand';

export type ExploreTabCategory = 'ALL' | 'SCHOOLS' | 'FACILITIES' | 'DINING' | 'HOSTELS' | 'EMERGENCY';

interface ExploreState {
  activeCategory: ExploreTabCategory;
  searchQuery: string;
  selectedCardId: string | null;
  setActiveCategory: (category: ExploreTabCategory) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCardId: (id: string | null) => void;
}

export const useExploreStore = create<ExploreState>((set) => ({
  activeCategory: 'ALL',
  searchQuery: '',
  selectedCardId: null,
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCardId: (selectedCardId) => set({ selectedCardId }),
}));
