'use client';

import { useEffect, useRef } from 'react';
import { useGPSStore } from '@/stores/useGPSStore';
import { useMapStore } from '@/stores/useMapStore';
import { globalKalmanFilter, GPSKalmanFilter } from '@/utils/kalmanFilter';
import { snapToNearestEdge } from '@/utils/pathSnapping';
import { SpatialEdge } from '@/types/navigation';
import routingEdgesData from '@/gis/routing_edges.json';

// Campus centroid and gate (fallback when user is far from campus)
const CAMPUS_CENTROID = { lat: 13.2222, lng: 77.7554 };
const CAMPUS_GATE     = { lat: 13.2219, lng: 77.7539 };
const CAMPUS_RADIUS_METERS = 2500;

/**
 * Maximum accuracy threshold to accept a GPS reading for map centering.
 * Mobile browsers often deliver the first 1-3 readings at ±100–300m from
 * a cached network position before GPS hardware locks on. We skip those.
 */
const ACCURACY_THRESHOLD_METERS = 50;

/**
 * Warm-up: skip this many inaccurate readings before trusting any position.
 * Set to 0 once accuracy is good enough.
 */
const WARMUP_SKIP_COUNT = 3;

/**
 * Fallback: if GPS never gets below ACCURACY_THRESHOLD_METERS within this
 * many milliseconds, use whatever we have (outdoor campus may still be ≈50m).
 */
const ACCURACY_FALLBACK_MS = 8000;

/**
 * useGPSWatcher — High-accuracy GPS tracker with:
 *  - Pre-fetch via getCurrentPosition before watchPosition (faster initial fix)
 *  - Warm-up skipping of inaccurate first readings (avoids ±100m cold-start lock)
 *  - Kalman filter smoothing (tuned Q=0.001 for pedestrian responsiveness)
 *  - Map centering only after accuracy < 50m (or 8s timeout)
 *  - Glitch detection: rejects >500m jumps
 *  - DeviceOrientation compass for heading cone
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

  // Track across readings without triggering re-renders
  const warmupCountRef   = useRef(0);        // number of inaccurate readings skipped
  const hasCenteredRef   = useRef(false);    // have we done the first map center?
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPointRef     = useRef<{ lat: number; lng: number } | null>(null);
  const lastTimeRef      = useRef(Date.now());

  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setPermissionGranted(false);
      return;
    }

    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    // ── Core position handler ──────────────────────────────────────
    const handlePosition = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy, heading, speed } = position.coords;
      const now = Date.now();
      const rawPt = { lat: latitude, lng: longitude };

      setPermissionGranted(true);
      setRawLocation(rawPt);
      setAccuracy(accuracy ?? 15);

      if (retryTimeout) { clearTimeout(retryTimeout); retryTimeout = null; }

      // ── 1. Glitch detection: reject implausible jumps ────────────
      if (globalKalmanFilter.isGlitch(rawPt, 500)) {
        // Large jump — likely GPS error or user resumed app after a trip
        // Reset filter so it re-initialises cleanly from new position
        globalKalmanFilter.reset();
      }

      // ── 2. Warm-up: skip first N readings if accuracy is poor ────
      //    Mobile often delivers a ±200m "cached" network fix first.
      //    We count bad readings and only start trusting GPS after either:
      //      (a) N bad readings have been skipped, or
      //      (b) accuracy has reached an acceptable level
      const isAccurate = (accuracy ?? 999) <= ACCURACY_THRESHOLD_METERS;
      if (!isAccurate && warmupCountRef.current < WARMUP_SKIP_COUNT) {
        warmupCountRef.current++;
        // Still feed to signal quality display so UI can show "acquiring"
        const { quality, confidenceScore } = GPSKalmanFilter.evaluateSignal(accuracy ?? 999);
        setSignalQuality(quality);
        setConfidenceScore(confidenceScore);
        return; // Skip this reading for positioning
      }

      // ── 3. Kalman filter smoothing ───────────────────────────────
      const smoothedPt = globalKalmanFilter.filter(rawPt, accuracy ?? 15, now);
      setUserLocation(smoothedPt);

      // ── 4. Walkway edge snapping (for routing — not for display) ─
      const snappedPt = snapToNearestEdge(smoothedPt, routingEdgesData as SpatialEdge[], 20);
      setSnappedLocation(snappedPt);

      // ── 5. Signal quality evaluation ────────────────────────────
      const { quality, confidenceScore } = GPSKalmanFilter.evaluateSignal(accuracy ?? 15);
      setSignalQuality(quality);
      setConfidenceScore(confidenceScore);

      // ── 6. Speed & walking detection ────────────────────────────
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

      // ── 7. Compass heading ───────────────────────────────────────
      if (heading !== null && !isNaN(heading)) {
        setHeading(heading);
      }

      // ── 8. First accurate fix → center map on user's position ───
      if (!hasCenteredRef.current && isAccurate) {
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
          // User is off-campus (e.g. opened app from home) — show campus overview
          setCenter(CAMPUS_GATE);
          setZoom(17);
        }
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      if (error.code === error.PERMISSION_DENIED) {
        setPermissionGranted(false);
      } else if (error.code === error.TIMEOUT) {
        // Retry with a quick getCurrentPosition burst
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

    // ── Step A: Pre-fetch with getCurrentPosition for fastest first fix ──
    // This fires a single high-accuracy request immediately, which the OS
    // often fulfils faster than watchPosition's first callback.
    navigator.geolocation.getCurrentPosition(handlePosition, () => {}, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    // ── Step B: Continuous watchPosition for live tracking ────────────
    const watchId = navigator.geolocation.watchPosition(handlePosition, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,       // Shorter than before (was 20s) — retries faster
      maximumAge: 0,        // Always fresh — never use cached stale position
    });

    // ── Fallback timer: if accuracy never gets good in 8s, use whatever we have ──
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
    }, ACCURACY_FALLBACK_MS);

    // ── Device Compass for heading cone ──────────────────────────────
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let compassHeading: number | null = null;
      if (
        'webkitCompassHeading' in event &&
        typeof (event as unknown as { webkitCompassHeading: number }).webkitCompassHeading === 'number'
      ) {
        // iOS Safari
        compassHeading = (event as unknown as { webkitCompassHeading: number }).webkitCompassHeading;
      } else if (event.alpha !== null) {
        // Android
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
