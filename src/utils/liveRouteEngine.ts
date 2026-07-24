import { Point2D } from '@/types/spatial';
import { Route } from '@/types/navigation';
import { GPSKalmanFilter } from './kalmanFilter';

export interface LiveRouteMetrics {
  remainingDistanceMeters: number;
  distanceWalkedMeters: number;
  progressPercentage: number;
  walkingSpeedMps: number;
  remainingDurationSeconds: number;
  estimatedArrivalTime: string;
  currentStepIndex: number;
  remainingPolyline: Point2D[];
}

export class LiveRouteEngine {
  /**
   * Project a point onto a line segment and return the closest point on the segment.
   * This is used for accurate "walked distance" calculation (orthogonal projection).
   */
  private static projectPointOnSegment(
    point: Point2D,
    segStart: Point2D,
    segEnd: Point2D
  ): { projected: Point2D; t: number } {
    // Convert to approximate meters for calculation
    const dx = segEnd.lng - segStart.lng;
    const dy = segEnd.lat - segStart.lat;
    const lenSq = dx * dx + dy * dy;

    if (lenSq < 1e-12) {
      return { projected: segStart, t: 0 };
    }

    // Parameter t = dot product / length squared (clamped to [0,1])
    const t = Math.max(
      0,
      Math.min(
        1,
        ((point.lng - segStart.lng) * dx + (point.lat - segStart.lat) * dy) / lenSq
      )
    );

    return {
      projected: {
        lat: segStart.lat + t * dy,
        lng: segStart.lng + t * dx,
      },
      t,
    };
  }

  /**
   * Calculate real-time route progress using orthogonal projection onto route segments.
   * 
   * Unlike "nearest vertex" approach, this correctly handles positions anywhere along
   * a segment — distance shrinks smoothly as user walks, not in jumpy increments.
   */
  public static calculateProgress(
    userLocation: Point2D,
    route: Route,
    currentSpeedMps = 1.4
  ): LiveRouteMetrics {
    const emptyResult: LiveRouteMetrics = {
      remainingDistanceMeters: 0,
      distanceWalkedMeters: 0,
      progressPercentage: 100,
      walkingSpeedMps: currentSpeedMps,
      remainingDurationSeconds: 0,
      estimatedArrivalTime: this.formatClockTime(0),
      currentStepIndex: route?.instructions?.length ? route.instructions.length - 1 : 0,
      remainingPolyline: [],
    };

    if (!route || !route.polyline || route.polyline.length < 2) {
      return emptyResult;
    }

    const polyline = route.polyline;

    // Find the closest segment using orthogonal projection
    let bestSegmentIndex = 0;
    let bestProjected: Point2D = polyline[0];
    let bestT = 0;
    let minDistance = Infinity;

    for (let i = 0; i < polyline.length - 1; i++) {
      const { projected, t } = this.projectPointOnSegment(
        userLocation,
        polyline[i],
        polyline[i + 1]
      );
      const dist = GPSKalmanFilter.calculateDistance(userLocation, projected);
      if (dist < minDistance) {
        minDistance = dist;
        bestSegmentIndex = i;
        bestProjected = projected;
        bestT = t;
      }
    }

    // Calculate distance walked = sum of all segments before bestSegmentIndex + partial current segment
    let distanceWalked = 0;
    for (let i = 0; i < bestSegmentIndex; i++) {
      distanceWalked += GPSKalmanFilter.calculateDistance(polyline[i], polyline[i + 1]);
    }
    // Add the projected fraction of the current segment
    const currentSegmentLength = GPSKalmanFilter.calculateDistance(polyline[bestSegmentIndex], polyline[bestSegmentIndex + 1]);
    distanceWalked += bestT * currentSegmentLength;

    const totalDistance = Math.max(1, route.totalDistanceMeters);
    distanceWalked = Math.min(totalDistance, Math.round(distanceWalked));
    const remainingDistance = Math.max(0, totalDistance - distanceWalked);
    const progressPercentage = Math.min(100, Math.max(0, Math.round((distanceWalked / totalDistance) * 100)));

    // Walking speed (min 0.8 m/s, default 1.4 m/s)
    const effectiveSpeed = currentSpeedMps > 0.3 ? currentSpeedMps : 1.4;
    const remainingDurationSeconds = Math.round(remainingDistance / effectiveSpeed);

    // Build remaining route polyline from current projected position onwards
    const remainingPolyline: Point2D[] = [bestProjected];
    // Add remaining point of current segment (if t < 1)
    if (bestT < 0.99) {
      remainingPolyline.push(polyline[bestSegmentIndex + 1]);
    }
    // Add all subsequent segments
    for (let i = bestSegmentIndex + 2; i < polyline.length; i++) {
      remainingPolyline.push(polyline[i]);
    }

    // Determine current instruction step based on proximity to step waypoints
    let currentStepIndex = route.currentStepIndex || 0;
    if (route.instructions && route.instructions.length > 0) {
      for (let i = 0; i < route.instructions.length; i++) {
        const stepLoc = route.instructions[i].location;
        const d = GPSKalmanFilter.calculateDistance(userLocation, stepLoc);
        if (d <= 20) {
          currentStepIndex = Math.min(i + 1, route.instructions.length - 1);
        }
      }
    }

    return {
      remainingDistanceMeters: Math.round(remainingDistance),
      distanceWalkedMeters: Math.round(distanceWalked),
      progressPercentage,
      walkingSpeedMps: Math.round(effectiveSpeed * 10) / 10,
      remainingDurationSeconds,
      estimatedArrivalTime: this.formatClockTime(remainingDurationSeconds),
      currentStepIndex,
      remainingPolyline,
    };
  }

  /**
   * Format clock arrival time (e.g. "10:45 AM")
   */
  private static formatClockTime(secondsFromNow: number): string {
    const arrivalDate = new Date(Date.now() + secondsFromNow * 1000);
    return arrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
