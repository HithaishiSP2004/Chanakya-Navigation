'use client';

import React, { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { useMapStore } from '@/stores/useMapStore';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useGPSStore } from '@/stores/useGPSStore';
import { buildingPolygons } from '@/repositories/venueRepository';

export const MapCameraController: React.FC = () => {
  const map = useMap();
  const { center, zoom, mapType, bearing, selectedBuildingId } = useMapStore();
  const { mode, activeRoute } = useNavigationStore();
  const { userLocation } = useGPSStore();

  const lastMapType = useRef<string>('');
  const didInitialCenter = useRef(false);
  const lastSelectedBuilding = useRef<string | null>(null);
  const lastMode = useRef<string>('');

  // 1. Initial campus center on map first load
  useEffect(() => {
    if (!map || didInitialCenter.current) return;
    map.panTo({ lat: 13.2222, lng: 77.7554 }); // Campus centroid
    map.setZoom(17);
    didInitialCenter.current = true;
  }, [map]);

  // 2. Toggle Satellite / Roadmap
  useEffect(() => {
    if (!map || typeof google === 'undefined') return;
    const targetType =
      mapType === 'satellite' ? google.maps.MapTypeId.HYBRID : google.maps.MapTypeId.ROADMAP;
    if (lastMapType.current !== targetType) {
      map.setMapTypeId(targetType);
      lastMapType.current = targetType;
    }
  }, [map, mapType]);

  // 3. Map heading / bearing
  useEffect(() => {
    if (!map || typeof google === 'undefined') return;
    if (typeof map.setHeading === 'function') {
      map.setHeading(bearing);
    }
  }, [map, bearing]);

  // 4. PREVIEW mode: fitBounds to the entire route polyline so user sees full path
  useEffect(() => {
    if (!map || typeof google === 'undefined') return;
    if (mode !== 'PREVIEW' || !activeRoute || !activeRoute.polyline || activeRoute.polyline.length < 2) return;

    // Only re-fit when mode changes to PREVIEW or route changes
    if (lastMode.current === 'PREVIEW') return;
    lastMode.current = mode;

    const bounds = new google.maps.LatLngBounds();
    activeRoute.polyline.forEach((pt) => bounds.extend({ lat: pt.lat, lng: pt.lng }));

    // Add a bit of padding so origin/destination markers aren't clipped
    map.fitBounds(bounds, {
      top: 40,
      right: 20,
      bottom: 180, // leave room for bottom sheet panel
      left: 20,
    });
  }, [map, mode, activeRoute]);

  // 5. When mode leaves PREVIEW, reset lastMode so next PREVIEW re-fits
  useEffect(() => {
    if (mode !== 'PREVIEW') {
      lastMode.current = '';
    }
  }, [mode]);

  // 6. NAVIGATING mode: track user position in 3D perspective
  useEffect(() => {
    if (!map || mode !== 'NAVIGATING' || !userLocation) {
      if (map && mode !== 'NAVIGATING' && typeof map.setTilt === 'function') {
        map.setTilt(0);
      }
      return;
    }

    map.panTo({ lat: userLocation.lat, lng: userLocation.lng });
    if (typeof map.setTilt === 'function') {
      map.setTilt(50);
    }
    if (typeof map.setHeading === 'function' && bearing >= 0) {
      map.setHeading(bearing);
    }
    map.setZoom(19);
  }, [map, mode, userLocation, bearing]);

  // 7. Pan to selected building centroid
  useEffect(() => {
    if (!map) return;
    if (selectedBuildingId && selectedBuildingId !== lastSelectedBuilding.current && mode !== 'PREVIEW' && mode !== 'NAVIGATING') {
      lastSelectedBuilding.current = selectedBuildingId;
      const bldg = buildingPolygons.find((b) => b.id === selectedBuildingId);
      if (bldg) {
        map.panTo({ lat: bldg.centroid.lat, lng: bldg.centroid.lng });
        map.setZoom(18);
      }
    }
    if (!selectedBuildingId) {
      lastSelectedBuilding.current = null;
    }
  }, [map, selectedBuildingId, mode]);

  // 8. Pan to explicit center override (e.g. GPS recenter button)
  useEffect(() => {
    if (!map || selectedBuildingId || mode === 'NAVIGATING' || mode === 'PREVIEW') return;
    if (center) {
      map.panTo({ lat: center.lat, lng: center.lng });
      if (zoom) map.setZoom(zoom);
    }
  }, [map, center]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};
