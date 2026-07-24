'use client';

import { useEffect } from 'react';
import { useGPSStore } from '@/stores/useGPSStore';
import { useMapStore } from '@/stores/useMapStore';
import { globalKalmanFilter, GPSKalmanFilter } from '@/utils/kalmanFilter';
import { snapToNearestEdge } from '@/utils/pathSnapping';
import { SpatialEdge } from '@/types/navigation';
import routingEdgesData from '@/gis/routing_edges.json';

// Chanakya University campus centroid (used when user is outside campus)
const CAMPUS_CENTROID = { lat: 13.2222, lng: 77.7554 };
const CAMPUS_GATE = { lat: 13.2219, lng: 77.7539 };
const CAMPUS_RADIUS_METERS = 2000; // 2km bounds check

/**
 * useGPSWatcher — starts a high-accuracy watchPosition listener.
 * - Uses maximumAge:0 to always fetch fresh GPS (never stale cached position).
 * - On first fix, centers map on the user's real smoothed location (not snapped node).
 * - Does NOT force a permission prompt — LocationPermissionBanner handles that.
 */
export const useGPSWatcher = () => {
  const {
    setUserLocation,
    setRawLocation,
    setSnappedLocation,
    setAccuracy,
    setHeading,
    setSpeedMps,
    setMovementState,
    setSignalQuality,
    setConfidenceScore,
    setPermissionGranted,
  } = useGPSStore();
  const { setCenter, setZoom } = useMapStore();

  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setPermissionGranted(false);
      return;
    }

    let firstFix = true;
    let lastPoint: { lat: number; lng: number } | null = null;
    let lastTime = Date.now();
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    const handlePosition = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy, heading, speed } = position.coords;
      const now = Date.now();
      const rawPt = { lat: latitude, lng: longitude };

      setRawLocation(rawPt);
      setAccuracy(accuracy || 15);
      setPermissionGranted(true);

      // Clear any pending retry
      if (retryTimeout) {
        clearTimeout(retryTimeout);
        retryTimeout = null;
      }

      // 1. Kalman Filter position smoothing on real raw GPS coordinate
      const smoothedPt = globalKalmanFilter.filter(rawPt, accuracy || 15, now);
      setUserLocation(smoothedPt);

      // 2. Map Matching (Snap to nearest routing edge) — used for routing, not for display
      const snappedPt = snapToNearestEdge(smoothedPt, routingEdgesData as SpatialEdge[], 15);
      setSnappedLocation(snappedPt);

      // 3. Signal Quality & Confidence Evaluation
      const { quality, confidenceScore } = GPSKalmanFilter.evaluateSignal(accuracy || 15);
      setSignalQuality(quality);
      setConfidenceScore(confidenceScore);

      // 4. Speed & Walking Detection
      let currentSpeed = speed !== null && !isNaN(speed) ? speed : 0;
      if (lastPoint && currentSpeed === 0) {
        const deltaD = GPSKalmanFilter.calculateDistance(lastPoint, rawPt);
        const deltaT = Math.max(0.5, (now - lastTime) / 1000);
        currentSpeed = deltaD / deltaT;
      }
      lastPoint = rawPt;
      lastTime = now;

      const isWalking = currentSpeed >= 0.3 && currentSpeed <= 2.5;
      const isStationary = currentSpeed < 0.3;
      setSpeedMps(Math.round(currentSpeed * 10) / 10);
      setMovementState(isWalking, isStationary);

      if (heading !== null && !isNaN(heading)) {
        setHeading(heading);
      }

      // 5. On first real GPS fix: center map on the SMOOTHED real position (not snapped routing node)
      //    This ensures the blue dot matches the map center exactly on load.
      if (firstFix) {
        firstFix = false;
        const distanceFromCampus = GPSKalmanFilter.calculateDistance(rawPt, CAMPUS_CENTROID);
        if (distanceFromCampus <= CAMPUS_RADIUS_METERS) {
          // User is on or near campus — center on their real smoothed GPS position
          setCenter(smoothedPt);
          setZoom(19);
        } else {
          // User is far from campus (e.g. opening app from home) — show campus overview
          setCenter(CAMPUS_GATE);
          setZoom(17);
        }
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      if (error.code === error.PERMISSION_DENIED) {
        setPermissionGranted(false);
      } else if (error.code === error.TIMEOUT) {
        // On timeout, retry getCurrentPosition once for a quick fix
        retryTimeout = setTimeout(() => {
          navigator.geolocation.getCurrentPosition(handlePosition, () => {}, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          });
        }, 2000);
      }
      console.warn(`GPS [${error.code}]:`, error.message);
    };

    const watchId = navigator.geolocation.watchPosition(handlePosition, handleError, {
      enableHighAccuracy: true,   // Always request the most accurate GPS available
      timeout: 20000,             // Wait up to 20s for initial fix
      maximumAge: 0,              // ALWAYS get a fresh reading — never use cached stale position
    });

    // Device compass heading listener (for heading cone direction)
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let compassHeading: number | null = null;
      if ('webkitCompassHeading' in event && typeof (event as unknown as { webkitCompassHeading: number }).webkitCompassHeading === 'number') {
        compassHeading = (event as unknown as { webkitCompassHeading: number }).webkitCompassHeading;
      } else if (event.alpha !== null) {
        compassHeading = 360 - event.alpha;
      }
      if (compassHeading !== null && !isNaN(compassHeading)) {
        setHeading(compassHeading);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      navigator.geolocation.clearWatch(watchId);
      if (retryTimeout) clearTimeout(retryTimeout);
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, [
    setUserLocation,
    setRawLocation,
    setSnappedLocation,
    setAccuracy,
    setHeading,
    setSpeedMps,
    setMovementState,
    setSignalQuality,
    setConfidenceScore,
    setPermissionGranted,
    setCenter,
    setZoom,
  ]);
};
