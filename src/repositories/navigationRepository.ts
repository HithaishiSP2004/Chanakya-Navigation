import { Point2D, BuildingPolygon } from '@/types/spatial';
import { Route, RouteInstruction, SpatialNode } from '@/types/navigation';
import { graphEngine } from '@/utils/graphEngine';
import { findShortestPath } from '@/utils/dijkstra';
import { generateTurnInstructions } from '@/utils/turnEngine';
import buildingPolygonsData from '@/gis/building-polygons.json';
import { mockVenues } from '@/repositories/venueRepository';

const buildingPolygons = buildingPolygonsData as BuildingPolygon[];

/**
 * Campus main gate — the universal walk-route start point for visitors.
 * All routes begin here when the user is outside the campus (accuracy > 50m)
 * because network-based GPS can be 100–2000m off. We never call Google Directions
 * for a campus navigation app — the campus is ~500m wide and everyone enters via gate.
 */
const CAMPUS_GATE: Point2D = { lat: 13.220265, lng: 77.754062 };
const CAMPUS_RADIUS_METERS = 500; // within 500m of gate = user is on campus

function haversineDistance(p1: Point2D, p2: Point2D): number {
  const R = 6371e3;
  const φ1 = (p1.lat * Math.PI) / 180;
  const φ2 = (p2.lat * Math.PI) / 180;
  const Δφ = ((p2.lat - p1.lat) * Math.PI) / 180;
  const Δλ = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * NavigationRepository — Campus Walking Route Calculator
 *
 * Architecture (simplified — no Google Directions):
 *   Origin (gate or user) → Internal Dijkstra Graph → Destination
 *
 * Why no Google Directions API?
 *   - Campus is ~500m wide. Google Directions routes via public roads (external).
 *   - Network GPS can be 100–2000m off, placing the origin far outside campus.
 *   - Combining wrong GPS origin + external road routing = routes through farm fields.
 *   - Our internal Dijkstra graph uses real campus walkway data for accurate paths.
 *
 * Origin selection logic (decided by PlaceDetailSheet before calling here):
 *   accuracy > 100m → campus gate  (passed in as origin)
 *   accuracy 20-100m → snapped walkway node
 *   accuracy ≤ 20m → raw GPS
 */
export class NavigationRepository {

  /**
   * Async route calculation using internal Dijkstra graph only.
   * Kept async to preserve the calling interface (was previously calling Directions API).
   */
  static async calculateRouteAsync(
    origin: Point2D,
    destinationTargetId: string,
    wheelchairOnly = false
  ): Promise<Route | null> {
    // Delegate entirely to the sync implementation — no async ops needed anymore
    return this.calculateRoute(origin, destinationTargetId, wheelchairOnly);
  }

  /**
   * Core route: internal Dijkstra graph from origin → destination.
   * If origin is far from campus (> 500m), snaps to campus gate automatically.
   */
  static calculateRoute(
    origin: Point2D,
    destinationTargetId: string,
    wheelchairOnly = false
  ): Route | null {
    const building = this._resolveBuilding(destinationTargetId);
    if (!building || building.entrances.length === 0) return null;

    const entrance = building.entrances[0];
    const venue = mockVenues.find((v) => v.id === destinationTargetId);
    const targetCoordinate = venue
      ? (venue.entranceCoordinate || venue.coordinate)
      : entrance.coordinate;

    // Always snap to campus gate if origin is too far away.
    // This is the correct default — all visitors enter through the gate.
    const distFromGate = haversineDistance(origin, CAMPUS_GATE);
    const routeOrigin = distFromGate <= CAMPUS_RADIUS_METERS ? origin : CAMPUS_GATE;

    const startNode = graphEngine.getNearestNode(routeOrigin);
    const targetNode = graphEngine.getNearestNode(targetCoordinate);

    if (!startNode || !targetNode) return null;

    const pathResult = findShortestPath(startNode.id, targetNode.id, wheelchairOnly);
    if (!pathResult) return null;

    // Build accurate polyline from Dijkstra path
    const polyline: Point2D[] = [routeOrigin];
    let totalDistMeters = 0;

    pathResult.nodes.forEach((node) => {
      const prev = polyline[polyline.length - 1];
      const d = haversineDistance(prev, node.coordinate);
      if (d > 0.5) { // skip duplicate / micro-movement nodes
        polyline.push(node.coordinate);
        totalDistMeters += d;
      }
    });

    // Append the final target coordinate if not already there
    const lastPoint = polyline[polyline.length - 1];
    const finalSegDist = haversineDistance(lastPoint, targetCoordinate);
    if (finalSegDist > 0.5) {
      polyline.push(targetCoordinate);
      totalDistMeters += finalSegDist;
    }

    const totalDistanceMeters = Math.max(
      Math.round(totalDistMeters),
      Math.round(pathResult.totalDistanceMeters)
    );

    // Realistic campus walking pace: 1.2 m/s (4.3 km/h) — slower than road walking
    const totalDurationSeconds = Math.max(15, Math.round(totalDistanceMeters / 1.2));

    const instructions = generateTurnInstructions(pathResult.nodes);

    return {
      id: `route-${Date.now()}`,
      originCoordinate: routeOrigin,
      destinationBuildingId: building.id,
      destinationBuildingName: building.name,
      entrance,
      polyline,
      nodes: pathResult.nodes,
      edges: pathResult.edges ?? [],
      instructions,
      totalDistanceMeters,
      totalDurationSeconds,
      currentStepIndex: 0,
      remainingDistanceMeters: totalDistanceMeters,
      progressPercentage: 0,
      isWheelchairAccessible: wheelchairOnly,
    };
  }

  /** Resolve building polygon from a venue/building/node ID */
  private static _resolveBuilding(targetId: string): BuildingPolygon | undefined {
    const targetNorm = targetId.toLowerCase();

    // 1. Direct building ID match
    const directMatch = buildingPolygons.find((b) => b.id === targetId);
    if (directMatch) return directMatch;

    // 2. Venue-ID → building-id lookup via mockVenues
    const venue = mockVenues.find(
      (v) => v.id === targetId || v.subVenues?.some((s) => s.id === targetId)
    );
    if (venue?.buildingId) {
      const byBldgId = buildingPolygons.find((b) => b.id === venue.buildingId);
      if (byBldgId) return byBldgId;
    }

    // 3. Keyword pattern fallback per building
    return (
      buildingPolygons.find(
        (b) =>
          targetNorm.includes(b.id.toLowerCase().replace('bldg-', '')) ||
          targetNorm.includes(b.code.toLowerCase()) ||
          (b.id === 'bldg-admin-01' && (
            targetNorm.includes('admin') || targetNorm.includes('admis') ||
            targetNorm.includes('lib') || targetNorm.includes('audi') ||
            targetNorm.includes('cafe') || targetNorm === 'v-admin-block-01'
          )) ||
          (b.id === 'bldg-acad-02' && (
            targetNorm.includes('acad') || targetNorm === 'v-acad-02'
          )) ||
          (b.id === 'bldg-food-04' && (
            targetNorm.includes('food') || targetNorm.includes('din') ||
            targetNorm === 'v-food-01'
          )) ||
          (b.id === 'bldg-hostel-03' && (
            targetNorm.includes('hostel') || targetNorm === 'v-hostel-01'
          ))
      ) || buildingPolygons[0]
    );
  }
}
