import { Point2D } from '@/types/spatial';
import { GPSSignalQuality } from '@/stores/useGPSStore';

/**
 * 2D Kalman Filter & GPS Signal Smoother
 */
export class GPSKalmanFilter {
  private Q: number; // Process noise
  private R: number; // Measurement noise
  private lat: number = 0;
  private lng: number = 0;
  private variance: number = -1;
  private lastTimestamp: number = 0;

  constructor(processNoise = 0.00001, measurementNoise = 0.0001) {
    this.Q = processNoise;
    this.R = measurementNoise;
  }

  /**
   * Filter a raw GPS position update
   */
  public filter(point: Point2D, accuracyMeters: number, timestamp = Date.now()): Point2D {
    if (this.variance < 0) {
      this.lat = point.lat;
      this.lng = point.lng;
      this.variance = accuracyMeters * accuracyMeters;
      this.lastTimestamp = timestamp;
      return point;
    }

    // Time elapsed in seconds
    const timeDelta = Math.max(0.1, (timestamp - this.lastTimestamp) / 1000);
    this.lastTimestamp = timestamp;

    // Increase variance by process noise over time
    this.variance += (this.Q * timeDelta);

    // Kalman gain
    const kGain = this.variance / (this.variance + (accuracyMeters * accuracyMeters));

    // Position update
    this.lat += kGain * (point.lat - this.lat);
    this.lng += kGain * (point.lng - this.lng);

    // Update variance
    this.variance = (1 - kGain) * this.variance;

    return { lat: this.lat, lng: this.lng };
  }

  /**
   * Calculate smooth heading (0-360 degrees) using Exponential Moving Average
   */
  public smoothHeading(currentHeading: number, newHeading: number, alpha = 0.25): number {
    if (isNaN(newHeading) || newHeading < 0) return currentHeading;

    let diff = newHeading - currentHeading;
    while (diff < -180) diff += 360;
    while (diff > 180) diff -= 360;

    const smoothed = (currentHeading + alpha * diff + 360) % 360;
    return Math.round(smoothed * 10) / 10;
  }

  /**
   * Assess GPS Signal Quality and Confidence Score (0-100%)
   */
  public static evaluateSignal(accuracyMeters: number): {
    quality: GPSSignalQuality;
    confidenceScore: number;
  } {
    if (accuracyMeters <= 5) {
      return { quality: 'EXCELLENT', confidenceScore: Math.min(100, Math.round(100 - (accuracyMeters * 2))) };
    } else if (accuracyMeters <= 15) {
      return { quality: 'GOOD', confidenceScore: Math.round(85 - ((accuracyMeters - 5) * 3)) };
    } else {
      return { quality: 'POOR', confidenceScore: Math.max(20, Math.round(55 - ((accuracyMeters - 15) * 1.5))) };
    }
  }

  /**
   * Calculate distance between two coordinates in meters (Haversine formula)
   */
  public static calculateDistance(p1: Point2D, p2: Point2D): number {
    const R = 6371e3; // Earth radius in meters
    const radLat1 = (p1.lat * Math.PI) / 180;
    const radLat2 = (p2.lat * Math.PI) / 180;
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export const globalKalmanFilter = new GPSKalmanFilter();
