import buildingPolygonsData from '@/gis/building-polygons.json';
import routingEdgesData from '@/gis/routing_edges.json';
import routingNodesData from '@/gis/routing_nodes.json';
import { BuildingPolygon, GISLayerType, GISVersionInfo } from '@/types/spatial';

export class GISRepository {
  private static versionInfo: GISVersionInfo = {
    version: '1.0.2',
    lastUpdated: '2026-07-23',
    author: 'Chanakya University GIS Cartography Team',
    crs: 'EPSG:4326',
    boundingBox: {
      minLat: 13.2200,
      maxLat: 13.2245,
      minLng: 77.7535,
      maxLng: 77.7575,
    },
  };

  public static getBuildings(): BuildingPolygon[] {
    return buildingPolygonsData as BuildingPolygon[];
  }

  public static getBuildingById(id: string): BuildingPolygon | undefined {
    return (buildingPolygonsData as BuildingPolygon[]).find((b) => b.id === id);
  }

  public static getBuildingsByZone(zone: string): BuildingPolygon[] {
    return (buildingPolygonsData as BuildingPolygon[]).filter((b) => b.zone === zone);
  }

  public static getRoutingNodes() {
    return routingNodesData;
  }

  public static getRoutingEdges() {
    return routingEdgesData;
  }

  public static getGISVersion(): GISVersionInfo {
    return this.versionInfo;
  }
}
