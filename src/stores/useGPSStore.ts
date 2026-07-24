import { create } from 'zustand';
import { Point2D } from '@/types/spatial';

export type GPSSignalQuality = 'EXCELLENT' | 'GOOD' | 'POOR';

interface GPSState {
  userLocation: Point2D | null;
  rawLocation: Point2D | null;
  snappedLocation: Point2D | null;
  heading: number; // Compass angle (0-360)
  accuracyMeters: number;
  speedMps: number;
  isWalking: boolean;
  isStationary: boolean;
  signalQuality: GPSSignalQuality;
  confidenceScore: number;
  isHighAccuracyActive: boolean;
  isPermissionGranted: boolean;
  setUserLocation: (location: Point2D | null) => void;
  setRawLocation: (raw: Point2D | null) => void;
  setSnappedLocation: (snapped: Point2D | null) => void;
  setHeading: (heading: number) => void;
  setAccuracy: (accuracyMeters: number) => void;
  setSpeedMps: (speedMps: number) => void;
  setMovementState: (isWalking: boolean, isStationary: boolean) => void;
  setSignalQuality: (quality: GPSSignalQuality) => void;
  setConfidenceScore: (score: number) => void;
  setPermissionGranted: (granted: boolean) => void;
}

export const useGPSStore = create<GPSState>((set) => ({
  // Null by default — real GPS coordinates will be set by useGPSWatcher on first fix.
  // Never show a hardcoded fake location to the user.
  userLocation: null,
  rawLocation: null,
  snappedLocation: null,
  heading: 0,
  accuracyMeters: 99,
  speedMps: 0,
  isWalking: false,
  isStationary: true,
  signalQuality: 'POOR',      // Updated to GOOD/EXCELLENT on first real GPS fix
  confidenceScore: 0,
  isHighAccuracyActive: true,
  isPermissionGranted: false, // Set to true only after the browser grants geolocation
  setUserLocation: (userLocation) => set({ userLocation, snappedLocation: userLocation }),
  setRawLocation: (rawLocation) => set({ rawLocation }),
  setSnappedLocation: (snappedLocation) => set({ snappedLocation }),
  setHeading: (heading) => set({ heading }),
  setAccuracy: (accuracyMeters) => set({ accuracyMeters }),
  setSpeedMps: (speedMps) => set({ speedMps }),
  setMovementState: (isWalking, isStationary) => set({ isWalking, isStationary }),
  setSignalQuality: (signalQuality) => set({ signalQuality }),
  setConfidenceScore: (confidenceScore) => set({ confidenceScore }),
  setPermissionGranted: (isPermissionGranted) => set({ isPermissionGranted }),
}));
