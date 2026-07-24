import { Point2D, BuildingPolygon } from '@/types/spatial';
import { Route, RouteInstruction, SpatialNode } from '@/types/navigation';
import { graphEngine } from '@/utils/graphEngine';
import { findShortestPath } from '@/utils/dijkstra';
import { generateTurnInstructions } from '@/utils/turnEngine';
import buildingPolygonsData from '@/gis/building-polygons.json';
import { mockVenues } from '@/repositories/venueRepository';

const buildingPolygons = buildingPolygonsData as BuildingPolygon[];

// Campus main gate / outdoor entry point for routing
const CAMPUS_GATE: Point2D = { lat: 13.220265, lng: 77.754062 };
const CAMPUS_RADIUS_METERS = 2000;

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
 * NavigationRepository — Hybrid Walking Route Calculator
 *
 * Architecture:
 *   Outdoor  →  Google Directions API (real walking paths on actual roads/paths)
 *                         ↓ (on Directions API success)
 *   Building Entrance  →  Internal Dijkstra Graph  →  Destination Room
 *
 * Fallback (when Directions API is unavailable or returns no results):
 *   Origin  →  Internal Dijkstra Graph  →  Destination
 */
export class NavigationRepository {

  /**
   * Async: Calculate route using Google Directions API for outdoor segment,
   * then append indoor Dijkstra graph for the building interior segment.
   */
  static async calculateRouteAsync(
    origin: Point2D,
    destinationTargetId: string,
    wheelchairOnly = false
  ): Promise<Route | null> {
    const building = this._resolveBuilding(destinationTargetId);
    if (!building || building.entrances.length === 0) return null;

    const entrance = building.entrances[0];
    const venue = mockVenues.find((v) => v.id === destinationTargetId);
    const targetCoordinate = venue ? (venue.entranceCoordinate || venue.coordinate) : entrance.coordinate;
    const entranceCoordinate = entrance.coordinate;

    const distFromCampus = haversineDistance(origin, CAMPUS_GATE);
    const distTargetFromCampus = haversineDistance(targetCoordinate, CAMPUS_GATE);
    const isBothOnCampus = distFromCampus <= 1500 && distTargetFromCampus <= 1500;

    // === OUTDOOR SEGMENT: Google Directions API (for users arriving from outside campus) ===
    let outdoorPolyline: Point2D[] = [];
    let outdoorDistanceMeters = 0;
    let outdoorDurationSeconds = 0;
    let outdoorSteps: RouteInstruction[] = [];
    let directionsApiUsed = false;

    if (!isBothOnCampus) {
      const routeOrigin = distFromCampus <= CAMPUS_RADIUS_METERS ? origin : CAMPUS_GATE;
      try {
        const params = new URLSearchParams({
          originLat: String(routeOrigin.lat),
          originLng: String(routeOrigin.lng),
          destLat: String(CAMPUS_GATE.lat),
          destLng: String(CAMPUS_GATE.lng),
        });

        const res = await fetch(`/api/directions?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.polyline && data.polyline.length >= 2) {
            outdoorPolyline = data.polyline as Point2D[];
            outdoorDistanceMeters = data.distanceMeters;
            outdoorDurationSeconds = data.durationSeconds;
            directionsApiUsed = true;

            outdoorSteps = (data.steps as Array<{
              stepIndex: number;
              text: string;
              distanceMeters: number;
              durationSeconds: number;
              location: Point2D;
              maneuver: string;
            }>).map((s, i) => ({
              id: `outdoor-step-${i}`,
              stepIndex: i,
              turnType: this._mapManeuverToTurnType(s.maneuver),
              text: s.text,
              distanceMeters: s.distanceMeters,
              durationSeconds: s.durationSeconds,
              location: s.location,
            }));
          }
        }
      } catch (err) {
        console.warn('[Navigation] Directions API unavailable, using internal graph:', err);
      }
    }

    // === CAMPUS SEGMENT: Internal Dijkstra Graph (follows paved road waypoints) ===
    const startNode = graphEngine.getNearestNode(isBothOnCampus ? origin : (directionsApiUsed ? CAMPUS_GATE : origin));
    const targetNode = graphEngine.getNearestNode(targetCoordinate);

    let indoorPolyline: Point2D[] = [];
    let indoorDistanceMeters = 0;
    let indoorDurationSeconds = 0;
    let indoorSteps: RouteInstruction[] = [];
    let dijkstraNodes: SpatialNode[] = [];

    if (startNode && targetNode) {
      const pathResult = findShortestPath(startNode.id, targetNode.id, wheelchairOnly);
      if (pathResult) {
        dijkstraNodes = pathResult.nodes;
        const dijkstraPolyline: Point2D[] = [];
        let totalDist = 0;

        pathResult.nodes.forEach((node) => {
          const prev = dijkstraPolyline[dijkstraPolyline.length - 1];
          if (!prev) {
            dijkstraPolyline.push(node.coordinate);
          } else {
            const d = haversineDistance(prev, node.coordinate);
            if (d > 0.5) {
              dijkstraPolyline.push(node.coordinate);
              totalDist += d;
            }
          }
        });

        // Append destination coordinate
        const lastNode = dijkstraPolyline[dijkstraPolyline.length - 1];
        if (lastNode) {
          const finalDist = haversineDistance(lastNode, targetCoordinate);
          if (finalDist > 0.5) {
            dijkstraPolyline.push(targetCoordinate);
            totalDist += finalDist;
          }
        }

        indoorPolyline = dijkstraPolyline;
        indoorDistanceMeters = Math.max(Math.round(totalDist), Math.round(pathResult.totalDistanceMeters));
        indoorDurationSeconds = Math.round(indoorDistanceMeters / 1.3);

        const rawIndoorInstructions = generateTurnInstructions(pathResult.nodes);
        indoorSteps = rawIndoorInstructions.map((ins, i) => ({
          ...ins,
          stepIndex: outdoorSteps.length + i,
        }));
      }
    }

    // === MERGE: Build final combined polyline & instructions ===
    let fullPolyline: Point2D[];
    let totalDistanceMeters: number;
    let totalDurationSeconds: number;

    if (directionsApiUsed && outdoorPolyline.length >= 2) {
      // Hybrid: Outdoor (real streets) + Indoor (campus graph)
      fullPolyline = [...outdoorPolyline];

      // Append indoor segment, avoiding duplicate start point
      if (indoorPolyline.length > 0) {
        fullPolyline.push(...indoorPolyline.slice(1));
      } else {
        // No indoor graph: just connect directly to target coordinate
        const last = fullPolyline[fullPolyline.length - 1];
        if (haversineDistance(last, targetCoordinate) > 1) {
          fullPolyline.push(targetCoordinate);
        }
      }

      totalDistanceMeters = outdoorDistanceMeters + indoorDistanceMeters;
      totalDurationSeconds = outdoorDurationSeconds + indoorDurationSeconds;
    } else {
      // Pure internal graph fallback
      fullPolyline = [origin, ...indoorPolyline];
      totalDistanceMeters = indoorDistanceMeters;
      totalDurationSeconds = Math.max(15, indoorDurationSeconds);
    }

    const allInstructions = [...outdoorSteps, ...indoorSteps];

    return {
      id: `route-${Date.now()}`,
      originCoordinate: origin,
      destinationBuildingId: building.id,
      destinationBuildingName: building.name,
      entrance,
      polyline: fullPolyline,
      nodes: dijkstraNodes,
      edges: [],
      instructions: allInstructions,
      totalDistanceMeters: Math.max(10, totalDistanceMeters),
      totalDurationSeconds: Math.max(15, totalDurationSeconds),
      currentStepIndex: 0,
      remainingDistanceMeters: Math.max(10, totalDistanceMeters),
      progressPercentage: 0,
      isWheelchairAccessible: wheelchairOnly,
    };
  }

  /**
   * Synchronous fallback: uses internal Dijkstra graph only.
   * Used when async is not available (e.g. resume navigation).
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
    const targetCoordinate = venue ? (venue.entranceCoordinate || venue.coordinate) : entrance.coordinate;

    const distFromCampus = haversineDistance(origin, CAMPUS_GATE);
    const routeOrigin = distFromCampus <= CAMPUS_RADIUS_METERS ? origin : CAMPUS_GATE;

    const startNode = graphEngine.getNearestNode(routeOrigin);
    const targetNode = graphEngine.getNearestNode(targetCoordinate);

    if (!startNode || !targetNode) return null;

    const pathResult = findShortestPath(startNode.id, targetNode.id, wheelchairOnly);
    if (!pathResult) return null;

    const polyline: Point2D[] = [routeOrigin];
    let totalDistMeters = 0;

    pathResult.nodes.forEach((node) => {
      const prev = polyline[polyline.length - 1];
      const d = haversineDistance(prev, node.coordinate);
      if (d > 0.5) {
        polyline.push(node.coordinate);
        totalDistMeters += d;
      }
    });

    const lastPoint = polyline[polyline.length - 1];
    const finalSegDist = haversineDistance(lastPoint, targetCoordinate);
    if (finalSegDist > 0.5) {
      polyline.push(targetCoordinate);
      totalDistMeters += finalSegDist;
    }

    const totalDistanceMeters = Math.max(Math.round(totalDistMeters), Math.round(pathResult.totalDistanceMeters));
    const totalDurationSeconds = Math.max(15, Math.round(totalDistanceMeters / 1.3));
    const instructions = generateTurnInstructions(pathResult.nodes);

    return {
      id: `route-${Date.now()}`,
      originCoordinate: origin,
      destinationBuildingId: building.id,
      destinationBuildingName: building.name,
      entrance,
      polyline,
      nodes: pathResult.nodes,
      edges: pathResult.edges,
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
    const venue = mockVenues.find((v) => v.id === targetId || v.subVenues?.some((s) => s.id === targetId));
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


  /** Map Google Directions maneuver string to our TurnType */
  private static _mapManeuverToTurnType(maneuver: string): RouteInstruction['turnType'] {
    switch (maneuver) {
      case 'turn-left': return 'TURN_LEFT';
      case 'turn-right': return 'TURN_RIGHT';
      case 'turn-slight-left': return 'SLIGHT_LEFT';
      case 'turn-slight-right': return 'SLIGHT_RIGHT';
      case 'turn-sharp-left': return 'SHARP_LEFT';
      case 'turn-sharp-right': return 'SHARP_RIGHT';
      case 'straight': return 'STRAIGHT';
      case '': return 'DEPART';
      default: return 'STRAIGHT';
    }
  }
}
