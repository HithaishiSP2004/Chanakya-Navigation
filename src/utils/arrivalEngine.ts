import { Point2D, BuildingPolygon } from '@/types/spatial';
import { graphEngine } from './graphEngine';

export function isUserInsidePolygon(point: Point2D, polygon: Point2D[]): boolean {
  let isInside = false;
  let j = polygon.length - 1;

  for (let i = 0; i < polygon.length; i++) {
    if (
      polygon[i].lng > point.lng !== polygon[j].lng > point.lng &&
      point.lat <
        ((polygon[j].lat - polygon[i].lat) * (point.lng - polygon[i].lng)) /
          (polygon[j].lng - polygon[i].lng) +
          polygon[i].lat
    ) {
      isInside = !isInside;
    }
    j = i;
  }

  return isInside;
}

export interface ArrivalCheckResult {
  isArrived: boolean;
  confidenceScore: number; // 0 - 100%
  reasons: string[];
}

export function checkArrival(
  userLocation: Point2D,
  entranceCoordinate: Point2D,
  buildingPolygon?: BuildingPolygon,
  gpsAccuracyMeters = 5,
  walkingSpeedMps = 1.4
): ArrivalCheckResult {
  let score = 0;
  const reasons: string[] = [];

  // Factor 1: Polygon Containment Check (40%)
  const isInside = buildingPolygon?.polygon ? isUserInsidePolygon(userLocation, buildingPolygon.polygon) : false;
  if (isInside) {
    score += 40;
    reasons.push('Inside building boundary');
  }

  // Factor 2: Entrance Proximity Check (35%)
  const distToEntrance = graphEngine.calculateDistance(userLocation, entranceCoordinate);
  if (distToEntrance <= 3) {
    score += 35;
    reasons.push(`Directly at entrance (${Math.round(distToEntrance)}m)`);
  } else if (distToEntrance <= 8) {
    score += 25;
    reasons.push(`Near entrance (${Math.round(distToEntrance)}m)`);
  } else if (distToEntrance <= 15) {
    score += 15;
    reasons.push(`Approaching entrance (${Math.round(distToEntrance)}m)`);
  }

  // Factor 3: GPS Signal Confidence (15%)
  if (gpsAccuracyMeters <= 5) {
    score += 15;
    reasons.push('High GPS confidence');
  } else if (gpsAccuracyMeters <= 12) {
    score += 10;
  }

  // Factor 4: Walking Speed Reduction on Arrival (10%)
  if (walkingSpeedMps < 0.6) {
    score += 10;
    reasons.push('Stationary/walking slow at destination');
  }

  const isArrived = score >= 85 || distToEntrance <= 4;

  return {
    isArrived,
    confidenceScore: Math.min(100, score),
    reasons,
  };
}
