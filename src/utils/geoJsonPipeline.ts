import { BuildingPolygon, GeoJSONFeatureCollection, GISVersionInfo } from '@/types/spatial';

export class GeoJSONPipeline {
  private static DEFAULT_METADATA: GISVersionInfo = {
    version: '1.0.2',
    lastUpdated: '2026-07-23',
    author: 'Chanakya University GIS Team',
    crs: 'EPSG:4326',
    boundingBox: {
      minLat: 13.2200,
      maxLat: 13.2245,
      minLng: 77.7535,
      maxLng: 77.7575,
    },
  };

  /**
   * Convert internal BuildingPolygon array to GeoJSON FeatureCollection format
   */
  public static exportCampusToGeoJSON(buildings: BuildingPolygon[]): GeoJSONFeatureCollection {
    const features = buildings.map((bldg) => {
      const ring = bldg.polygon.map((p) => [p.lng, p.lat]);
      // Close polygon ring if not closed
      if (ring.length > 0 && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) {
        ring.push([...ring[0]]);
      }

      return {
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [ring],
        },
        properties: {
          id: bldg.id,
          code: bldg.code,
          name: bldg.name,
          zone: bldg.zone,
          entrancesCount: bldg.entrances?.length || 0,
          centroidLat: bldg.centroid.lat,
          centroidLng: bldg.centroid.lng,
          description: bldg.description,
          officialWebLink: bldg.officialWebLink,
        },
      };
    });

    return {
      type: 'FeatureCollection',
      features,
      metadata: this.DEFAULT_METADATA,
    };
  }

  /**
   * Import GeoJSON FeatureCollection into internal BuildingPolygon objects
   */
  public static importFromGeoJSON(geoJson: GeoJSONFeatureCollection): Partial<BuildingPolygon>[] {
    if (!geoJson || geoJson.type !== 'FeatureCollection' || !Array.isArray(geoJson.features)) {
      throw new Error('Invalid GeoJSON FeatureCollection structure');
    }

    return geoJson.features.map((feature, idx) => {
      const props = feature.properties || {};
      let polygonCoords: { lat: number; lng: number }[] = [];

      if (feature.geometry.type === 'Polygon') {
        const ring = (feature.geometry.coordinates as number[][][])[0] || [];
        polygonCoords = ring.map(([lng, lat]) => ({ lat, lng }));
      }

      return {
        id: (props.id as string) || `imported-bldg-${idx}`,
        code: (props.code as string) || `IMP-${idx}`,
        name: (props.name as string) || 'Imported Building',
        zone: (props.zone as any) || 'ACADEMIC',
        polygon: polygonCoords,
        centroid: {
          lat: (props.centroidLat as number) || (polygonCoords[0]?.lat || 13.2219),
          lng: (props.centroidLng as number) || (polygonCoords[0]?.lng || 77.7539),
        },
        entrances: [],
        heroImage: '/images/placeholders/building.svg',
        thumbnailImage: '/images/placeholders/building.svg',
        description: (props.description as string) || 'Imported GIS Footprint',
      };
    });
  }
}
