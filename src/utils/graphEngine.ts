import { SpatialNode, SpatialEdge } from '@/types/navigation';
import nodesData from '@/gis/routing_nodes.json';
import edgesData from '@/gis/routing_edges.json';
import { Point2D } from '@/types/spatial';

export class GraphEngine {
  private nodes: Map<string, SpatialNode> = new Map();
  private adjacencyList: Map<string, { targetNodeId: string; edge: SpatialEdge }[]> = new Map();

  constructor() {
    this.loadGraph();
  }

  private loadGraph() {
    const rawNodes = nodesData as SpatialNode[];
    const rawEdges = edgesData as SpatialEdge[];

    rawNodes.forEach((node) => {
      this.nodes.set(node.id, node);
      this.adjacencyList.set(node.id, []);
    });

    rawEdges.forEach((edge) => {
      // Undirected graph for pedestrian walkways
      this.adjacencyList.get(edge.startNodeId)?.push({ targetNodeId: edge.endNodeId, edge });
      this.adjacencyList.get(edge.endNodeId)?.push({ targetNodeId: edge.startNodeId, edge });
    });
  }

  public getNode(id: string): SpatialNode | undefined {
    return this.nodes.get(id);
  }

  public getAllNodes(): SpatialNode[] {
    return Array.from(this.nodes.values());
  }

  public getNeighbors(nodeId: string): { targetNodeId: string; edge: SpatialEdge }[] {
    return this.adjacencyList.get(nodeId) || [];
  }

  // Find closest node to a given GPS point
  public getNearestNode(point: Point2D): SpatialNode {
    let nearestNode = this.getAllNodes()[0];
    let minDistance = Infinity;

    this.nodes.forEach((node) => {
      const dist = this.calculateDistance(point, node.coordinate);
      if (dist < minDistance) {
        minDistance = dist;
        nearestNode = node;
      }
    });

    return nearestNode;
  }

  public calculateDistance(p1: Point2D, p2: Point2D): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (p1.lat * Math.PI) / 180;
    const phi2 = (p2.lat * Math.PI) / 180;
    const deltaPhi = ((p2.lat - p1.lat) * Math.PI) / 180;
    const deltaLambda = ((p2.lng - p1.lng) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

export const graphEngine = new GraphEngine();
