'use client';

import { useEffect, useRef } from 'react';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useGPSStore } from '@/stores/useGPSStore';
import { snapToNearestEdge } from '@/utils/pathSnapping';
import { NavigationRepository } from '@/repositories/navigationRepository';
import { graphEngine } from '@/utils/graphEngine';
import { NavigationAnalytics } from '@/utils/analytics';

export const useRerouting = () => {
  const { mode, activeRoute, setActiveRoute, setMode, setReroutingMessage } = useNavigationStore();
  const { userLocation } = useGPSStore();
  const isReroutingRef = useRef(false);

  useEffect(() => {
    if (mode !== 'NAVIGATING' || !activeRoute || !userLocation || isReroutingRef.current) return;

    // Calculate minimum distance from user position to active route edges
    const snappedPoint = snapToNearestEdge(userLocation, activeRoute.edges, 15);
    const deviationDistance = graphEngine.calculateDistance(userLocation, snappedPoint);

    // If deviation > 15 meters, trigger instant automatic reroute
    if (deviationDistance > 15) {
      isReroutingRef.current = true;
      console.log('Off-route detected (>15m deviation). Recalculating path...');

      setMode('REROUTING');
      setReroutingMessage('Finding better route...');
      NavigationAnalytics.track('REROUTED', {
        venueId: activeRoute.destinationBuildingId,
        distanceMeters: deviationDistance,
      });

      // Recalculate route after subtle 400ms delay for UX feedback
      setTimeout(() => {
        const newRoute = NavigationRepository.calculateRoute(
          userLocation,
          activeRoute.destinationBuildingId,
          activeRoute.isWheelchairAccessible
        );

        if (newRoute) {
          setActiveRoute(newRoute);
          setReroutingMessage(null);
          setMode('NAVIGATING');
        } else {
          setReroutingMessage('Unable to calculate reroute');
          setTimeout(() => setReroutingMessage(null), 3000);
        }
        isReroutingRef.current = false;
      }, 400);
    }
  }, [userLocation, mode, activeRoute, setActiveRoute, setMode, setReroutingMessage]);
};
