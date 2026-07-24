import { Point2D, BuildingPolygon, BuildingEntrance } from '@/types/spatial';
import { Venue } from '@/types/venue';
import { GPSKalmanFilter } from './kalmanFilter';

export class GISEngine {
  /**
   * Check if a point is inside a polygon using Ray-Casting algorithm
   */
  public static isPointInsidePolygon(point: Point2D, polygon: Point2D[]): boolean {
    if (!polygon || polygon.length < 3) return false;

    let isInside = false;
    const { lat: x, lng: y } = point;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat;
      const yi = polygon[i].lng;
      const xj = polygon[j].lat;
      const yj = polygon[j].lng;

      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) isInside = !isInside;
    }

    return isInside;
  }

  /**
   * Find nearest building footprint to a given coordinate
   */
  public static getNearestBuilding(
    point: Point2D,
    buildings: BuildingPolygon[]
  ): { building: BuildingPolygon; distanceMeters: number } | null {
    if (!buildings || buildings.length === 0) return null;

    let nearest: BuildingPolygon | null = null;
    let minDistance = Infinity;

    buildings.forEach((bldg) => {
      // Check centroid distance
      const dist = GPSKalmanFilter.calculateDistance(point, bldg.centroid);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = bldg;
      }
    });

    return nearest ? { building: nearest, distanceMeters: Math.round(minDistance) } : null;
  }

  /**
   * Find nearest entrance node across all campus buildings
   */
  public static getNearestEntrance(
    point: Point2D,
    buildings: BuildingPolygon[]
  ): { entrance: BuildingEntrance; building: BuildingPolygon; distanceMeters: number } | null {
    let nearestEnt: BuildingEntrance | null = null;
    let nearestBldg: BuildingPolygon | null = null;
    let minDistance = Infinity;

    buildings.forEach((bldg) => {
      bldg.entrances?.forEach((ent) => {
        const dist = GPSKalmanFilter.calculateDistance(point, ent.coordinate);
        if (dist < minDistance) {
          minDistance = dist;
          nearestEnt = ent;
          nearestBldg = bldg;
        }
      });
    });

    if (nearestEnt && nearestBldg) {
      return { entrance: nearestEnt, building: nearestBldg, distanceMeters: Math.round(minDistance) };
    }
    return null;
  }

  /**
   * Spatial query to fetch all venues within a given radius (meters)
   */
  public static getVenuesInRadius(
    point: Point2D,
    radiusMeters: number,
    venues: Venue[]
  ): Venue[] {
    return venues.filter((venue) => {
      const dist = GPSKalmanFilter.calculateDistance(point, venue.coordinate);
      return dist <= radiusMeters;
    });
  }
}
