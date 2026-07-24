import { create } from 'zustand';
import { Point2D } from '@/types/spatial';

interface MapState {
  center: Point2D;
  zoom: number;
  bearing: number;
  pitch: number;
  selectedBuildingId: string | null;
  mapType: 'vector' | 'satellite' | 'terrain';
  setCenter: (center: Point2D) => void;
  setZoom: (zoom: number) => void;
  setBearing: (bearing: number) => void;
  setPitch: (pitch: number) => void;
  setSelectedBuildingId: (buildingId: string | null) => void;
  setMapType: (mapType: 'vector' | 'satellite' | 'terrain') => void;
}

// Chanakya University Global Campus Centroid: 13.2219148, 77.7551318 (Devanahalli, NH-648)
export const useMapStore = create<MapState>((set) => ({
  center: { lat: 13.221374, lng: 77.755169 },
  zoom: 17,
  bearing: 0,
  pitch: 0,
  selectedBuildingId: null,
  mapType: 'satellite',
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setBearing: (bearing) => set({ bearing }),
  setPitch: (pitch) => set({ pitch }),
  setSelectedBuildingId: (selectedBuildingId) => set({ selectedBuildingId }),
  setMapType: (mapType) => set({ mapType }),
}));
