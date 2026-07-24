import { graphEngine } from './graphEngine';
import { SpatialNode, SpatialEdge } from '@/types/navigation';

export interface PathfindingResult {
  nodes: SpatialNode[];
  edges: SpatialEdge[];
  totalDistanceMeters: number;
}

export function findShortestPath(
  startNodeId: string,
  targetNodeId: string,
  wheelchairOnly = false
): PathfindingResult | null {
  const distances: Map<string, number> = new Map();
  const previousNodes: Map<string, string | null> = new Map();
  const previousEdges: Map<string, SpatialEdge | null> = new Map();
  const unvisited: Set<string> = new Set();

  const allNodes = graphEngine.getAllNodes();
  allNodes.forEach((node) => {
    distances.set(node.id, Infinity);
    previousNodes.set(node.id, null);
    previousEdges.set(node.id, null);
    unvisited.add(node.id);
  });

  distances.set(startNodeId, 0);

  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let currentId: string | null = null;
    let smallestDistance = Infinity;

    unvisited.forEach((nodeId) => {
      const dist = distances.get(nodeId) ?? Infinity;
      if (dist < smallestDistance) {
        smallestDistance = dist;
        currentId = nodeId;
      }
    });

    if (!currentId || smallestDistance === Infinity) break;
    if (currentId === targetNodeId) break;

    unvisited.delete(currentId);

    const neighbors = graphEngine.getNeighbors(currentId);
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.targetNodeId)) continue;
      if (wheelchairOnly && !neighbor.edge.isAccessible) continue;

      const alt = distances.get(currentId)! + neighbor.edge.distanceMeters;
      if (alt < (distances.get(neighbor.targetNodeId) ?? Infinity)) {
        distances.set(neighbor.targetNodeId, alt);
        previousNodes.set(neighbor.targetNodeId, currentId);
        previousEdges.set(neighbor.targetNodeId, neighbor.edge);
      }
    }
  }

  // Reconstruct path
  const pathNodes: SpatialNode[] = [];
  const pathEdges: SpatialEdge[] = [];
  let curr: string | null = targetNodeId;

  if (distances.get(targetNodeId) === Infinity) {
    return null; // Path not found
  }

  while (curr) {
    const node = graphEngine.getNode(curr);
    if (node) pathNodes.unshift(node);

    const edge = previousEdges.get(curr);
    if (edge) pathEdges.unshift(edge);

    curr = previousNodes.get(curr) || null;
  }

  return {
    nodes: pathNodes,
    edges: pathEdges,
    totalDistanceMeters: distances.get(targetNodeId) || 0,
  };
}
