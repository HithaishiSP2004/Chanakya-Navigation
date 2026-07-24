'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { Point2D } from '@/types/spatial';

interface GoogleMapPolygonProps {
  paths: Point2D[];
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  fillColor?: string;
  fillOpacity?: number;
  onClick?: () => void;
}

export const GoogleMapPolygon: React.FC<GoogleMapPolygonProps> = ({
  paths,
  strokeColor = '#3B82F6',
  strokeOpacity = 0.9,
  strokeWeight = 2,
  fillColor = '#1E293B',
  fillOpacity = 0.3,
  onClick,
}) => {
  const map = useMap();
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const listenerRef = useRef<google.maps.MapsEventListener | null>(null);

  // Create / destroy polygon only when map or paths change
  useEffect(() => {
    if (!map || typeof google === 'undefined') return;

    // Clean up previous instance
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }

    const polygon = new google.maps.Polygon({
      paths: paths.map((p) => ({ lat: p.lat, lng: p.lng })),
      strokeColor,
      strokeOpacity,
      strokeWeight,
      fillColor,
      fillOpacity,
      map,
    });

    polygonRef.current = polygon;

    return () => {
      if (listenerRef.current) {
        google.maps.event.removeListener(listenerRef.current);
        listenerRef.current = null;
      }
      polygon.setMap(null);
    };
    // Only re-create if the actual geometry changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, JSON.stringify(paths)]);

  // Update style props without re-creating the polygon
  useEffect(() => {
    if (!polygonRef.current) return;
    polygonRef.current.setOptions({ strokeColor, strokeOpacity, strokeWeight, fillColor, fillOpacity });
  }, [strokeColor, strokeOpacity, strokeWeight, fillColor, fillOpacity]);

  // Update click listener without re-creating the polygon
  useEffect(() => {
    if (!polygonRef.current || typeof google === 'undefined') return;
    if (listenerRef.current) {
      google.maps.event.removeListener(listenerRef.current);
      listenerRef.current = null;
    }
    if (onClick) {
      listenerRef.current = polygonRef.current.addListener('click', onClick);
    }
    return () => {
      if (listenerRef.current) {
        google.maps.event.removeListener(listenerRef.current);
        listenerRef.current = null;
      }
    };
  }, [onClick]);

  return null;
};
