import { create } from 'zustand';

interface DemoState {
  isDemoActive: boolean;
  isPaused: boolean;
  playbackSpeed: number; // 1, 2, 5, 10
  selectedOriginNodeId: string;
  selectedDestinationBuildingId: string;
  simulationProgress: number; // 0 to 100%
  toggleDemoMode: () => void;
  setDemoActive: (active: boolean) => void;
  setIsPaused: (paused: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setOriginNodeId: (id: string) => void;
  setDestinationBuildingId: (id: string) => void;
  setSimulationProgress: (progress: number) => void;
  resetSimulation: () => void;
}

export const useDemoStore = create<DemoState>((set) => ({
  isDemoActive: false,
  isPaused: false,
  playbackSpeed: 2,
  selectedOriginNodeId: 'node-gate-01',
  selectedDestinationBuildingId: 'bldg-admin-01',
  simulationProgress: 0,
  toggleDemoMode: () => set((state) => ({ isDemoActive: !state.isDemoActive })),
  setDemoActive: (isDemoActive) => set({ isDemoActive }),
  setIsPaused: (isPaused) => set({ isPaused }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
  setOriginNodeId: (selectedOriginNodeId) => set({ selectedOriginNodeId }),
  setDestinationBuildingId: (selectedDestinationBuildingId) => set({ selectedDestinationBuildingId }),
  setSimulationProgress: (simulationProgress) => set({ simulationProgress }),
  resetSimulation: () =>
    set({
      isDemoActive: false,
      isPaused: false,
      simulationProgress: 0,
    }),
}));
