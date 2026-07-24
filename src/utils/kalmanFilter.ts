import { Point2D } from '@/types/spatial';
import { GPSSignalQuality } from '@/stores/useGPSStore';

/**
 * 2D Kalman Filter & GPS Signal Smoother
 *
 * Tuning Notes:
 * - Q (process noise): how much we expect position to change between updates.
 *   Higher = filter trusts new GPS readings more, tracks movement faster.
 *   Lower = filter smooths more aggressively, lags on movement.
 *   For a pedestrian navigator: 0.001 (was 0.00001 — caused severe sticky lag)
 *
 * - R (measurement noise): set proportional to GPS accuracy² per reading.
 *   We inject the actual accuracy on every filter() call, so this is just the
 *   fallback default when accuracy is unknown.
 */
export class GPSKalmanFilter {
  private Q: number; // Process noise — how much position drifts per second
  private R: number; // Measurement noise baseline (overridden per reading)
  private lat: number = 0;
  private lng: number = 0;
  private variance: number = -1; // Negative = uninitialised
  private lastTimestamp: number = 0;

  constructor(
    processNoise = 0.001,       // 100x more responsive than before (was 0.00001)
    measurementNoise = 0.0001
  ) {
    this.Q = processNoise;
    this.R = measurementNoise;
  }

  /**
   * Filter a raw GPS position update.
   * On the very first call the filter is initialised to the given point.
   */
  public filter(point: Point2D, accuracyMeters: number, timestamp = Date.now()): Point2D {
    if (this.variance < 0) {
      // First reading — initialise
      this.lat = point.lat;
      this.lng = point.lng;
      this.variance = accuracyMeters * accuracyMeters;
      this.lastTimestamp = timestamp;
      return point;
    }

    // Time elapsed in seconds (clamped to at least 0.1s to avoid division weirdness)
    const timeDelta = Math.max(0.1, (timestamp - this.lastTimestamp) / 1000);
    this.lastTimestamp = timestamp;

    // Grow uncertainty over time (model random walk)
    this.variance += this.Q * timeDelta;

    // Kalman gain: how much to trust the new reading vs our prediction
    const measurementVariance = accuracyMeters * accuracyMeters;
    const kGain = this.variance / (this.variance + measurementVariance);

    // Fuse prediction with measurement
    this.lat += kGain * (point.lat - this.lat);
    this.lng += kGain * (point.lng - this.lng);

    // Update posterior variance
    this.variance = (1 - kGain) * this.variance;

    return { lat: this.lat, lng: this.lng };
  }

  /**
   * Reset the filter — call when GPS signal is lost and regained,
   * or when the user's location makes a large jump (e.g. app resumed from background).
   */
  public reset(): void {
    this.variance = -1;
    this.lat = 0;
    this.lng = 0;
    this.lastTimestamp = 0;
  }

  /**
   * Returns true if a jump in position is implausibly large
   * (e.g. >500m in one reading — likely a GPS glitch or cold start artifact).
   */
  public isGlitch(newPoint: Point2D, thresholdMeters = 500): boolean {
    if (this.variance < 0) return false; // Not yet initialised
    const dist = GPSKalmanFilter.calculateDistance(
      { lat: this.lat, lng: this.lng },
      newPoint
    );
    return dist > thresholdMeters;
  }

  /**
   * Calculate smooth heading (0–360°) using Exponential Moving Average.
   * alpha = 0.3 for pedestrians (higher = more responsive, lower = smoother)
   */
  public smoothHeading(currentHeading: number, newHeading: number, alpha = 0.3): number {
    if (isNaN(newHeading) || newHeading < 0) return currentHeading;

    // Shortest-path circular interpolation
    let diff = newHeading - currentHeading;
    while (diff < -180) diff += 360;
    while (diff > 180) diff -= 360;

    const smoothed = (currentHeading + alpha * diff + 360) % 360;
    return Math.round(smoothed * 10) / 10;
  }

  /**
   * Assess GPS Signal Quality and Confidence Score (0–100%)
   */
  public static evaluateSignal(accuracyMeters: number): {
    quality: GPSSignalQuality;
    confidenceScore: number;
  } {
    if (accuracyMeters <= 5) {
      return { quality: 'EXCELLENT', confidenceScore: Math.min(100, Math.round(100 - accuracyMeters * 2)) };
    } else if (accuracyMeters <= 15) {
      return { quality: 'GOOD', confidenceScore: Math.round(85 - (accuracyMeters - 5) * 3) };
    } else if (accuracyMeters <= 40) {
      return { quality: 'POOR', confidenceScore: Math.max(30, Math.round(55 - (accuracyMeters - 15) * 1.0)) };
    } else {
      // Very weak — essentially unusable for routing
      return { quality: 'POOR', confidenceScore: Math.max(5, Math.round(30 - (accuracyMeters - 40) * 0.5)) };
    }
  }

  /**
   * Calculate distance between two lat/lng coordinates in meters (Haversine formula)
   */
  public static calculateDistance(p1: Point2D, p2: Point2D): number {
    const R = 6371e3;
    const radLat1 = (p1.lat * Math.PI) / 180;
    const radLat2 = (p2.lat * Math.PI) / 180;
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(radLat1) * Math.cos(radLat2) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export const globalKalmanFilter = new GPSKalmanFilter();
