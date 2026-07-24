export interface Point2D {
  lat: number;
  lng: number;
  altitude?: number;
}

export type BuildingEntranceType = 'MAIN' | 'WHEELCHAIR' | 'SIDE' | 'SERVICE' | 'EMERGENCY';

export type SpatialZoneType = 
  | 'ADMINISTRATIVE' 
  | 'ACADEMIC' 
  | 'RESIDENTIAL' 
  | 'SPORTS' 
  | 'FOOD' 
  | 'HEALTH' 
  | 'VISITOR' 
  | 'PARKING' 
  | 'GREEN_SUSTAINABILITY' 
  | 'FUTURE_DEVELOPMENT';

export type GISLayerType = 
  | 'BUILDINGS' 
  | 'WALKWAYS' 
  | 'ENTRANCES' 
  | 'POIS' 
  | 'NAVIGATION_GRAPH' 
  | 'PARKING' 
  | 'EMERGENCY' 
  | 'SUSTAINABILITY';

export interface GISVersionInfo {
  version: string;
  lastUpdated: string;
  author: string;
  crs: string;
  boundingBox: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

export interface BuildingEntrance {
  id: string;
  name: string;
  type: BuildingEntranceType;
  coordinate: Point2D;
  associatedNodeId: string;
  landmarkGuidance?: string;
  photoUrl?: string;
  securityLevel?: string;
}

export interface BuildingPolygon {
  id: string;
  code: string;
  name: string;
  zone: SpatialZoneType;
  version?: string;
  lastUpdated?: string;
  polygon: Point2D[];
  centroid: Point2D;
  entrances: BuildingEntrance[];
  heroImage: string;
  thumbnailImage: string;
  photos?: string[];
  description: string;
  landmarkGuidance?: string;
  officialWebLink?: string;
  containedInZone?: string;
  nearestParkingId?: string;
  nearestWalkwayNodeId?: string;
  isEmergencyAssemblyPoint?: boolean;
  isNetZeroFacility?: boolean;
  floors?: FloorSchema[];
}

export interface FloorSchema {
  floorNumber: number;
  floorName: string;
  rooms: RoomSchema[];
}

export interface RoomSchema {
  roomId: string;
  roomNumber: string;
  name: string;
  category: 'CLASSROOM' | 'LAB' | 'FACULTY_CABIN' | 'OFFICE' | 'AUDITORIUM';
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon' | 'Point' | 'LineString';
    coordinates: number[] | number[][] | number[][][];
  };
  properties: Record<string, unknown>;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
  metadata?: GISVersionInfo;
}
