/**
 * Chanakya Navigate — Analytics Layer Architecture Hook
 */

export type NavigationEventType = 
  | 'DESTINATION_SELECTED'
  | 'ROUTE_CALCULATED'
  | 'NAVIGATION_STARTED'
  | 'REROUTED'
  | 'NEARING_DESTINATION'
  | 'ARRIVED'
  | 'NAVIGATION_COMPLETED'
  | 'NAVIGATION_CANCELLED';

export interface NavigationEventPayload {
  venueId?: string;
  venueName?: string;
  category?: string;
  distanceMeters?: number;
  durationSeconds?: number;
  confidenceScore?: number;
  timestamp?: number;
}

export class NavigationAnalytics {
  private static eventsLog: Array<{ event: NavigationEventType; payload: NavigationEventPayload; time: string }> = [];

  public static track(event: NavigationEventType, payload: NavigationEventPayload = {}): void {
    const timestampedPayload = {
      ...payload,
      timestamp: payload.timestamp || Date.now(),
    };

    const entry = {
      event,
      payload: timestampedPayload,
      time: new Date().toISOString(),
    };

    this.eventsLog.push(entry);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[ANALYTICS LOG] ${event}:`, timestampedPayload);
    }
  }

  public static getRecentEvents() {
    return this.eventsLog;
  }
}
