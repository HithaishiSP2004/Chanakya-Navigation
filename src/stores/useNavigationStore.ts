import { create } from 'zustand';
import { Venue } from '@/types/venue';
import { Route, NavigationStateMode } from '@/types/navigation';
import { Point2D } from '@/types/spatial';

export type NavigationMode = NavigationStateMode;

interface NavigationState {
  mode: NavigationMode;
  selectedVenue: Venue | null;
  activeRoute: Route | null;
  currentStepIndex: number;
  sheetSnapPoint: number | string | null;
  liveWalkingSpeedMps: number;
  distanceWalkedMeters: number;
  remainingDistanceMeters: number;
  remainingDurationSeconds: number;
  estimatedArrivalTime: string;
  remainingPolyline: Point2D[];
  reroutingMessage: string | null;
  arrivalConfidenceScore: number;
  setMode: (mode: NavigationMode) => void;
  setSelectedVenue: (venue: Venue | null) => void;
  setActiveRoute: (route: Route | null) => void;
  setStepIndex: (index: number) => void;
  setSheetSnapPoint: (snapPoint: number | string | null) => void;
  setLiveMetrics: (metrics: {
    liveWalkingSpeedMps?: number;
    distanceWalkedMeters?: number;
    remainingDistanceMeters?: number;
    remainingDurationSeconds?: number;
    estimatedArrivalTime?: string;
    arrivalConfidenceScore?: number;
    remainingPolyline?: Point2D[];
  }) => void;
  setReroutingMessage: (msg: string | null) => void;
  resetNavigation: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  mode: 'IDLE',
  selectedVenue: null,
  activeRoute: null,
  currentStepIndex: 0,
  sheetSnapPoint: 0.5,
  liveWalkingSpeedMps: 1.4,
  distanceWalkedMeters: 0,
  remainingDistanceMeters: 0,
  remainingDurationSeconds: 0,
  estimatedArrivalTime: '',
  remainingPolyline: [],
  reroutingMessage: null,
  arrivalConfidenceScore: 0,
  setMode: (mode) => set({ mode }),
  setSelectedVenue: (venue) => set({ selectedVenue: venue }),
  setActiveRoute: (activeRoute) => set({
    activeRoute,
    remainingDistanceMeters: activeRoute?.totalDistanceMeters ?? 0,
    remainingDurationSeconds: activeRoute?.totalDurationSeconds ?? 0,
    remainingPolyline: activeRoute?.polyline ?? [],
  }),
  setStepIndex: (currentStepIndex) => set({ currentStepIndex }),
  setSheetSnapPoint: (sheetSnapPoint) => set({ sheetSnapPoint }),
  setLiveMetrics: (metrics) =>
    set((state) => ({
      liveWalkingSpeedMps: metrics.liveWalkingSpeedMps ?? state.liveWalkingSpeedMps,
      distanceWalkedMeters: metrics.distanceWalkedMeters ?? state.distanceWalkedMeters,
      remainingDistanceMeters: metrics.remainingDistanceMeters ?? state.remainingDistanceMeters,
      remainingDurationSeconds: metrics.remainingDurationSeconds ?? state.remainingDurationSeconds,
      estimatedArrivalTime: metrics.estimatedArrivalTime ?? state.estimatedArrivalTime,
      arrivalConfidenceScore: metrics.arrivalConfidenceScore ?? state.arrivalConfidenceScore,
      remainingPolyline: metrics.remainingPolyline ?? state.remainingPolyline,
    })),
  setReroutingMessage: (reroutingMessage) => set({ reroutingMessage }),
  resetNavigation: () =>
    set({
      mode: 'IDLE',
      selectedVenue: null,
      activeRoute: null,
      currentStepIndex: 0,
      sheetSnapPoint: 0.5,
      liveWalkingSpeedMps: 1.4,
      distanceWalkedMeters: 0,
      remainingDistanceMeters: 0,
      remainingDurationSeconds: 0,
      estimatedArrivalTime: '',
      remainingPolyline: [],
      reroutingMessage: null,
      arrivalConfidenceScore: 0,
    }),
}));
