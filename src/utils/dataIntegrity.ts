import { mockVenues } from '@/repositories/venueRepository';
import buildingPolygons from '@/gis/building-polygons.json';
import routingNodes from '@/gis/routing_nodes.json';
import routingEdges from '@/gis/routing_edges.json';

export interface DataIntegrityReport {
  passed: boolean;
  totalVenues: number;
  totalBuildings: number;
  totalNodes: number;
  totalEdges: number;
  errors: string[];
  warnings: string[];
}

export class DataIntegrityValidator {
  public static validateAll(): DataIntegrityReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    const buildingIds = new Set(buildingPolygons.map((b) => b.id));
    const nodeIds = new Set(routingNodes.map((n) => n.id));

    // Validate Venues
    mockVenues.forEach((venue) => {
      if (!venue.id || !venue.name) {
        errors.push(`Invalid venue missing ID or name: ${JSON.stringify(venue)}`);
      }

      if (venue.coordinate.lat < 13.2100 || venue.coordinate.lat > 13.2350) {
        errors.push(`Venue ${venue.name} coordinate out of campus latitude bounds: ${venue.coordinate.lat}`);
      }

      if (venue.buildingId && !buildingIds.has(venue.buildingId)) {
        warnings.push(`Venue ${venue.name} references building ID "${venue.buildingId}" not found in building-polygons.json`);
      }
    });

    // Validate Edges
    routingEdges.forEach((edge) => {
      if (!nodeIds.has(edge.startNodeId)) {
        errors.push(`Routing edge references invalid start node: ${edge.startNodeId}`);
      }
      if (!nodeIds.has(edge.endNodeId)) {
        errors.push(`Routing edge references invalid end node: ${edge.endNodeId}`);
      }
    });

    return {
      passed: errors.length === 0,
      totalVenues: mockVenues.length,
      totalBuildings: buildingPolygons.length,
      totalNodes: routingNodes.length,
      totalEdges: routingEdges.length,
      errors,
      warnings,
    };
  }
}
