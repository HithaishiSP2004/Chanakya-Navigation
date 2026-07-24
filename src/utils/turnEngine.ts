import { SpatialNode, RouteInstruction, TurnType } from '@/types/navigation';
import { Point2D } from '@/types/spatial';

export function generateTurnInstructions(nodes: SpatialNode[]): RouteInstruction[] {
  if (nodes.length === 0) return [];

  const instructions: RouteInstruction[] = [];

  // Step 1: Departure Instruction
  instructions.push({
    id: 'inst-0',
    stepIndex: 0,
    turnType: 'DEPART',
    text: `Depart from ${nodes[0].name}`,
    distanceMeters: 0,
    durationSeconds: 0,
    location: nodes[0].coordinate,
  });

  if (nodes.length === 1) {
    return instructions;
  }

  for (let i = 0; i < nodes.length - 1; i++) {
    const curr = nodes[i];
    const next = nodes[i + 1];
    const dist = calculateSegmentDistance(curr.coordinate, next.coordinate);

    let turnType: TurnType = 'STRAIGHT';

    if (i > 0) {
      const prev = nodes[i - 1];
      const bearing1 = calculateBearing(prev.coordinate, curr.coordinate);
      const bearing2 = calculateBearing(curr.coordinate, next.coordinate);
      const turnAngle = normalizeAngle(bearing2 - bearing1);

      if (turnAngle > -20 && turnAngle < 20) {
        turnType = 'STRAIGHT';
      } else if (turnAngle >= 20 && turnAngle < 45) {
        turnType = 'SLIGHT_RIGHT';
      } else if (turnAngle >= 45 && turnAngle < 120) {
        turnType = 'TURN_RIGHT';
      } else if (turnAngle >= 120) {
        turnType = 'SHARP_RIGHT';
      } else if (turnAngle <= -20 && turnAngle > -45) {
        turnType = 'SLIGHT_LEFT';
      } else if (turnAngle <= -45 && turnAngle > -120) {
        turnType = 'TURN_LEFT';
      } else if (turnAngle <= -120) {
        turnType = 'SHARP_LEFT';
      }

      instructions.push({
        id: `inst-${i}`,
        stepIndex: i,
        turnType,
        text: formatInstructionText(turnType, next.name),
        distanceMeters: Math.round(dist),
        durationSeconds: Math.round(dist / 1.4), // 1.4 m/s walking speed
        location: curr.coordinate,
      });
    }
  }

  // Final Step: Arrival Instruction
  const destinationNode = nodes[nodes.length - 1];
  instructions.push({
    id: `inst-${nodes.length - 1}`,
    stepIndex: nodes.length - 1,
    turnType: 'ARRIVE',
    text: `Arrive at ${destinationNode.name}`,
    distanceMeters: 0,
    durationSeconds: 0,
    location: destinationNode.coordinate,
  });

  return instructions;
}

function calculateBearing(start: Point2D, end: Point2D): number {
  const startLat = (start.lat * Math.PI) / 180;
  const startLng = (start.lng * Math.PI) / 180;
  const endLat = (end.lat * Math.PI) / 180;
  const endLng = (end.lng * Math.PI) / 180;

  const dLng = endLng - startLng;
  const y = Math.sin(dLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

  return (Math.atan2(y, x) * 180) / Math.PI;
}

function normalizeAngle(angle: number): number {
  while (angle <= -180) angle += 360;
  while (angle > 180) angle -= 360;
  return angle;
}

function calculateSegmentDistance(p1: Point2D, p2: Point2D): number {
  const R = 6371e3;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatInstructionText(turnType: TurnType, targetName: string): string {
  switch (turnType) {
    case 'SLIGHT_RIGHT': return `Slight right towards ${targetName}`;
    case 'TURN_RIGHT': return `Turn right towards ${targetName}`;
    case 'SHARP_RIGHT': return `Sharp right towards ${targetName}`;
    case 'SLIGHT_LEFT': return `Slight left towards ${targetName}`;
    case 'TURN_LEFT': return `Turn left towards ${targetName}`;
    case 'SHARP_LEFT': return `Sharp left towards ${targetName}`;
    case 'DESTINATION_AHEAD': return `Your destination ${targetName} is straight ahead`;
    case 'DESTINATION_LEFT': return `Your destination ${targetName} will be on your left`;
    case 'DESTINATION_RIGHT': return `Your destination ${targetName} will be on your right`;
    case 'ARRIVE': return `Arrive at ${targetName}`;
    default: return `Continue straight towards ${targetName}`;
  }
}
