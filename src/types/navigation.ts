import { Point2D, BuildingEntrance } from './spatial';

export type SpatialNodeType = 
  | 'WALKWAY'
  | 'ENTRANCE'
  | 'JUNCTION'
  | 'CROSSWALK'
  | 'POI'
  | 'EMERGENCY'
  | 'PARKING'
  | 'BUILDING_ENTRY';

export interface SpatialNode {
  id: string;
  name: string;
  type: SpatialNodeType;
  coordinate: Point2D;
}

export interface SpatialEdge {
  id: string;
  startNodeId: string;
  endNodeId: string;
  distanceMeters: number;
  isAccessible: boolean;
}

export type TurnType = 
  | 'DEPART'
  | 'STRAIGHT'
  | 'SLIGHT_LEFT'
  | 'TURN_LEFT'
  | 'SHARP_LEFT'
  | 'SLIGHT_RIGHT'
  | 'TURN_RIGHT'
  | 'SHARP_RIGHT'
  | 'DESTINATION_AHEAD'
  | 'DESTINATION_LEFT'
  | 'DESTINATION_RIGHT'
  | 'ARRIVE';

export interface RouteInstruction {
  id: string;
  stepIndex: number;
  turnType: TurnType;
  text: string;
  distanceMeters: number;
  durationSeconds: number;
  location: Point2D;
}

export interface Route {
  id: string;
  originCoordinate: Point2D;
  destinationBuildingId: string;
  destinationBuildingName: string;
  entrance: BuildingEntrance;
  polyline: Point2D[];
  nodes: SpatialNode[];
  edges: SpatialEdge[];
  instructions: RouteInstruction[];
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  currentStepIndex: number;
  remainingDistanceMeters: number;
  distanceWalkedMeters?: number;
  progressPercentage: number;
  walkingSpeedMps?: number;
  estimatedArrivalTime?: string;
  arrivalConfidenceScore?: number;
  isWheelchairAccessible: boolean;
  isRerouting?: boolean;
}

export type NavigationStateMode = 
  | 'IDLE'
  | 'DESTINATION_SELECTED'
  | 'ROUTE_CALCULATED'
  | 'READY_TO_NAVIGATE'
  | 'NAVIGATING'
  | 'OFF_ROUTE'
  | 'REROUTING'
  | 'NEARING_DESTINATION'
  | 'ARRIVED'
  | 'COMPLETED'
  | 'SEARCHING'
  | 'PREVIEW'
  | 'CALCULATING'
  | 'PAUSED'
  | 'CANCELLED'
  | 'ERROR';
