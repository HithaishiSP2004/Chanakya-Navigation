import { BuildingPolygon } from '@/types/spatial';
import { Venue } from '@/types/venue';
import routingNodesData from '@/gis/routing_nodes.json';

export interface GISDiagnosticReport {
  timestamp: string;
  totalBuildings: number;
  totalEntrances: number;
  totalGraphNodes: number;
  unlinkedEntrances: string[];
  invalidPolygons: string[];
  duplicateVenues: string[];
  gisIntegrityScore: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}

export class GISValidationTool {
  /**
   * Run comprehensive Spatial Validation Health Check on Campus GIS Dataset
   */
  public static runHealthCheck(
    buildings: BuildingPolygon[],
    venues: Venue[] = []
  ): GISDiagnosticReport {
    const unlinkedEntrances: string[] = [];
    const invalidPolygons: string[] = [];
    const duplicateVenues: string[] = [];

    const graphNodeIds = new Set(routingNodesData.map((n) => n.id));
    const venueIds = new Set<string>();

    let totalEntrances = 0;

    buildings.forEach((bldg) => {
      // Validate polygon ring closure and point count
      if (!bldg.polygon || bldg.polygon.length < 3) {
        invalidPolygons.push(`Building ${bldg.name} (${bldg.id}) has invalid polygon vertex count`);
      }

      // Check WGS84 coordinate boundaries
      bldg.polygon.forEach((pt) => {
        if (pt.lat < 13.2100 || pt.lat > 13.2350 || pt.lng < 77.7400 || pt.lng > 77.7700) {
          invalidPolygons.push(`Building ${bldg.name} coordinate out of campus WGS84 bounds (${pt.lat}, ${pt.lng})`);
        }
      });

      // Validate entrances link to existing graph nodes
      bldg.entrances?.forEach((ent) => {
        totalEntrances++;
        if (!ent.associatedNodeId || !graphNodeIds.has(ent.associatedNodeId)) {
          unlinkedEntrances.push(`Entrance ${ent.name} (${ent.id}) in ${bldg.name} links to invalid graph node: "${ent.associatedNodeId}"`);
        }
      });
    });

    // Check duplicate venue IDs
    venues.forEach((v) => {
      if (venueIds.has(v.id)) {
        duplicateVenues.push(`Duplicate venue ID found: ${v.id}`);
      } else {
        venueIds.add(v.id);
      }
    });

    const totalIssues = unlinkedEntrances.length + invalidPolygons.length + duplicateVenues.length;
    const gisIntegrityScore = Math.max(0, 100 - totalIssues * 5);
    const status = gisIntegrityScore >= 95 ? 'HEALTHY' : gisIntegrityScore >= 80 ? 'WARNING' : 'CRITICAL';

    return {
      timestamp: new Date().toISOString(),
      totalBuildings: buildings.length,
      totalEntrances,
      totalGraphNodes: routingNodesData.length,
      unlinkedEntrances,
      invalidPolygons,
      duplicateVenues,
      gisIntegrityScore,
      status,
    };
  }
}
