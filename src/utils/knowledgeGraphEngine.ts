import { Venue } from '@/types/venue';
import { GPSKalmanFilter } from './kalmanFilter';

export interface ContextualRecommendation {
  venue: Venue;
  distanceMeters: number;
  walkingTimeMinutes: number;
  relationshipLabel: string;
}

export class KnowledgeGraphEngine {
  /**
   * Get contextual recommendations for a given venue (e.g. "Because you're visiting X...")
   */
  public static getContextualRecommendations(
    currentVenue: Venue,
    allVenues: Venue[],
    limit = 3
  ): ContextualRecommendation[] {
    if (!currentVenue || !allVenues || allVenues.length === 0) return [];

    const candidates = allVenues.filter((v) => v.id !== currentVenue.id);
    const recommendations: ContextualRecommendation[] = [];

    candidates.forEach((venue) => {
      const distanceMeters = Math.round(
        GPSKalmanFilter.calculateDistance(currentVenue.coordinate, venue.coordinate)
      );

      // Walking time assuming average 1.4 m/s (~84 m/min)
      const walkingTimeMinutes = Math.max(1, Math.ceil(distanceMeters / 84));

      let relationshipLabel = 'Nearby Facility';

      if (currentVenue.connectedVenueIds?.includes(venue.id)) {
        relationshipLabel = 'Connected Hub';
      } else if (currentVenue.buildingId && venue.buildingId === currentVenue.buildingId) {
        relationshipLabel = 'In Same Building';
      } else if (currentVenue.category === 'LIBRARY' && venue.category === 'ACADEMIC') {
        relationshipLabel = 'Study & Research Pair';
      } else if (currentVenue.category === 'ACADEMIC' && venue.category === 'CAFETERIA') {
        relationshipLabel = 'Dining & Breaks';
      } else if (currentVenue.category === 'ADMISSION' && venue.category === 'CAFETERIA') {
        relationshipLabel = 'Visitor Dining';
      } else if (currentVenue.category === 'HOSTEL' && venue.category === 'SPORTS') {
        relationshipLabel = 'Recreation & Fitness';
      }

      recommendations.push({
        venue,
        distanceMeters,
        walkingTimeMinutes,
        relationshipLabel,
      });
    });

    // Sort by connected venue priority first, then by distance
    recommendations.sort((a, b) => {
      const aIsConnected = currentVenue.connectedVenueIds?.includes(a.venue.id) ? 1 : 0;
      const bIsConnected = currentVenue.connectedVenueIds?.includes(b.venue.id) ? 1 : 0;
      if (aIsConnected !== bIsConnected) return bIsConnected - aIsConnected;
      return a.distanceMeters - b.distanceMeters;
    });

    return recommendations.slice(0, limit);
  }

  /**
   * Resolve Parent Building venue for a room
   */
  public static getParentBuilding(venue: Venue, allVenues: Venue[]): Venue | undefined {
    if (venue.parentVenueId) {
      return allVenues.find((v) => v.id === venue.parentVenueId);
    }
    if (venue.buildingId) {
      return allVenues.find((v) => v.buildingId === venue.buildingId && v.id !== venue.id);
    }
    return undefined;
  }
}
