'use client';

import { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { Point2D } from '@/types/spatial';

interface GoogleMapPolylineProps {
  path: Point2D[];
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
}

export const GoogleMapPolyline: React.FC<GoogleMapPolylineProps> = ({
  path,
  strokeColor = '#1A73E8',
  strokeOpacity = 0.9,
  strokeWeight = 6,
}) => {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  // Create / destroy when map or path geometry changes
  useEffect(() => {
    if (!map || typeof google === 'undefined' || path.length < 2) return;

    // Destroy previous instance before creating a new one
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    const polyline = new google.maps.Polyline({
      path: path.map((p) => ({ lat: p.lat, lng: p.lng })),
      geodesic: true,
      strokeColor,
      strokeOpacity,
      strokeWeight,
      map,
    });

    polylineRef.current = polyline;

    return () => {
      polyline.setMap(null);
      polylineRef.current = null;
    };
    // Stringify path to avoid object-reference false positives
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, JSON.stringify(path)]);

  // Update style without re-creating
  useEffect(() => {
    if (!polylineRef.current) return;
    polylineRef.current.setOptions({ strokeColor, strokeOpacity, strokeWeight });
  }, [strokeColor, strokeOpacity, strokeWeight]);

  return null;
};
