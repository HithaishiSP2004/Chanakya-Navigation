'use client';

import { useEffect, useRef } from 'react';
import { useGPSStore } from '@/stores/useGPSStore';
import { useMapStore } from '@/stores/useMapStore';
import { globalKalmanFilter, GPSKalmanFilter } from '@/utils/kalmanFilter';
import { snapToNearestEdge } from '@/utils/pathSnapping';
import { SpatialEdge } from '@/types/navigation';
import routingEdgesData from '@/gis/routing_edges.json';

// Chanakya University campus centroid & main gate
const CAMPUS_CENTROID = { lat: 13.2222, lng: 77.7554 };
const CAMPUS_GATE     = { lat: 13.2219, lng: 77.7539 };
const CAMPUS_RADIUS_METERS = 2500;

/**
 * useGPSWatcher — High-accuracy GPS tracker
 *
 * Strategy:
 *  1. Pre-fetch with getCurrentPosition() for instant first fix
 *  2. Continuous watchPosition() for live tracking
 *  3. ALWAYS set userLocation on the very first reading (no warm-up skip)
 *     — even a ±2000m reading shows a blue dot immediately
 *     — Kalman filter smooths subsequent readings
 *  4. Map centering gated: only center map when accuracy < 80m
 *     (prevents jumping to a wrong city on first network-based fix)
 *  5. 8-second fallback: if GPS never gets good, center on campus gate
 *  6. Glitch detection: rejects >500m position jumps
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

  const hasCenteredRef   = useRef(false);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPointRef     = useRef<{ lat: number; lng: number } | null>(null);
  const lastTimeRef      = useRef(Date.now());
  const hasAnyFixRef     = useRef(false); // Did we get ANY position fix yet?

  // Threshold for map auto-centering (not for showing the dot)
  const CENTER_ACCURACY_THRESHOLD = 80;

  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setPermissionGranted(false);
      return;
    }

    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    const handlePosition = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy, heading, speed } = position.coords;
      const now = Date.now();
      const rawPt = { lat: latitude, lng: longitude };

      setPermissionGranted(true);
      setRawLocation(rawPt);
      setAccuracy(accuracy ?? 99);

      if (retryTimeout) { clearTimeout(retryTimeout); retryTimeout = null; }

      // ── 1. Glitch rejection: ignore >500m jumps (GPS error/app resume) ──
      if (globalKalmanFilter.isGlitch(rawPt, 500)) {
        globalKalmanFilter.reset();
      }

      // ── 2. Kalman filter — always process EVERY reading ─────────────
      //    No warm-up skip. The filter handles bad readings gracefully.
      //    This ensures userLocation is set from the very first reading
      //    so the blue dot appears immediately.
      const smoothedPt = globalKalmanFilter.filter(rawPt, accuracy ?? 99, now);
      setUserLocation(smoothedPt);
      hasAnyFixRef.current = true;

      // ── 3. Walkway edge snapping (routing use only, not display) ────
      const snappedPt = snapToNearestEdge(smoothedPt, routingEdgesData as SpatialEdge[], 20);
      setSnappedLocation(snappedPt);

      // ── 4. Signal quality ────────────────────────────────────────────
      const { quality, confidenceScore } = GPSKalmanFilter.evaluateSignal(accuracy ?? 99);
      setSignalQuality(quality);
      setConfidenceScore(confidenceScore);

      // ── 5. Speed & movement detection ───────────────────────────────
      let currentSpeed = (speed !== null && !isNaN(speed)) ? speed : 0;
      if (lastPointRef.current && currentSpeed === 0) {
        const deltaD = GPSKalmanFilter.calculateDistance(lastPointRef.current, rawPt);
        const deltaT = Math.max(0.5, (now - lastTimeRef.current) / 1000);
        currentSpeed = deltaD / deltaT;
      }
      lastPointRef.current = rawPt;
      lastTimeRef.current  = now;

      const isWalking    = currentSpeed >= 0.3 && currentSpeed <= 3.0;
      const isStationary = currentSpeed < 0.3;
      setSpeedMps(Math.round(currentSpeed * 10) / 10);
      setMovementState(isWalking, isStationary);

      // ── 6. Compass heading ───────────────────────────────────────────
      if (heading !== null && !isNaN(heading)) {
        setHeading(heading);
      }

      // ── 7. Map centering — only once GPS is reasonably accurate ──────
      //    We don't center on a ±2000m reading to avoid jumping far away.
      //    The blue dot still shows (step 2 above), just the map won't jump.
      if (!hasCenteredRef.current && (accuracy ?? 999) <= CENTER_ACCURACY_THRESHOLD) {
        hasCenteredRef.current = true;
        if (fallbackTimerRef.current) {
          clearTimeout(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }
        const distFromCampus = GPSKalmanFilter.calculateDistance(rawPt, CAMPUS_CENTROID);
        if (distFromCampus <= CAMPUS_RADIUS_METERS) {
          setCenter(smoothedPt);
          setZoom(19);
        } else {
          setCenter(CAMPUS_GATE);
          setZoom(17);
        }
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      if (error.code === error.PERMISSION_DENIED) {
        setPermissionGranted(false);
      } else if (error.code === error.TIMEOUT) {
        retryTimeout = setTimeout(() => {
          navigator.geolocation.getCurrentPosition(handlePosition, () => {}, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        }, 1500);
      }
      console.warn(`GPS [code=${error.code}]:`, error.message);
    };

    // ── Step A: Immediate pre-fetch for fastest first fix ────────────
    navigator.geolocation.getCurrentPosition(handlePosition, () => {}, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    // ── Step B: Continuous watchPosition for live tracking ────────────
    const watchId = navigator.geolocation.watchPosition(handlePosition, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    // ── Fallback: center map on campus gate after 8s if GPS still bad ──
    fallbackTimerRef.current = setTimeout(() => {
      if (!hasCenteredRef.current) {
        hasCenteredRef.current = true;
        const loc = useGPSStore.getState().userLocation;
        if (loc) {
          const distFromCampus = GPSKalmanFilter.calculateDistance(loc, CAMPUS_CENTROID);
          setCenter(distFromCampus <= CAMPUS_RADIUS_METERS ? loc : CAMPUS_GATE);
          setZoom(distFromCampus <= CAMPUS_RADIUS_METERS ? 18 : 17);
        } else {
          setCenter(CAMPUS_GATE);
          setZoom(17);
        }
      }
    }, 8000);

    // ── Device Compass for heading cone ──────────────────────────────
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let compassHeading: number | null = null;
      if (
        'webkitCompassHeading' in event &&
        typeof (event as unknown as { webkitCompassHeading: number }).webkitCompassHeading === 'number'
      ) {
        compassHeading = (event as unknown as { webkitCompassHeading: number }).webkitCompassHeading;
      } else if (event.alpha !== null) {
        compassHeading = (360 - event.alpha) % 360;
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
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
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
