import { Point2D } from '@/types/spatial';
import { SpatialEdge } from '@/types/navigation';
import { graphEngine } from './graphEngine';

export function snapToNearestEdge(
  point: Point2D,
  edges: SpatialEdge[],
  maxSnapDistanceMeters = 12
): Point2D {
  let nearestPoint = point;
  let minDistance = Infinity;

  edges.forEach((edge) => {
    const startNode = graphEngine.getNode(edge.startNodeId);
    const endNode = graphEngine.getNode(edge.endNodeId);

    if (!startNode || !endNode) return;

    const projected = getClosestPointOnSegment(point, startNode.coordinate, endNode.coordinate);
    const dist = graphEngine.calculateDistance(point, projected);

    if (dist < minDistance && dist <= maxSnapDistanceMeters) {
      minDistance = dist;
      nearestPoint = projected;
    }
  });

  return nearestPoint;
}

function getClosestPointOnSegment(p: Point2D, a: Point2D, b: Point2D): Point2D {
  const l2 = (b.lat - a.lat) ** 2 + (b.lng - a.lng) ** 2;
  if (l2 === 0) return a;

  let t = ((p.lat - a.lat) * (b.lat - a.lat) + (p.lng - a.lng) * (b.lng - a.lng)) / l2;
  t = Math.max(0, Math.min(1, t));

  return {
    lat: a.lat + t * (b.lat - a.lat),
    lng: a.lng + t * (b.lng - a.lng),
  };
}
