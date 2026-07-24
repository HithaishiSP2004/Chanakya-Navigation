'use client';

import React from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { useMapStore } from '@/stores/useMapStore';
import { CampusPolygonOverlay } from './CampusPolygonOverlay';
import { UserLocationMarker } from './UserLocationMarker';
import { MapCameraController } from './MapCameraController';

interface GoogleMapProviderProps {
  apiKey: string;
  children?: React.ReactNode;
}

export const GoogleMapProvider: React.FC<GoogleMapProviderProps> = ({ apiKey, children }) => {
  const { center, zoom } = useMapStore();
  const customMapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
  const mapId = customMapId && customMapId.trim() !== '' ? customMapId : undefined;

  return (
    <APIProvider apiKey={apiKey}>
      {/* Full-screen Google Maps tile layer — no SVG fallback behind it */}
      <Map
        defaultCenter={{ lat: 13.221374, lng: 77.755169 }}
        defaultZoom={17}
        mapId={mapId}
        disableDefaultUI={true}
        gestureHandling={'greedy'}
        style={{ width: '100vw', height: '100vh', position: 'fixed', inset: 0, zIndex: 0 }}
      >
        {/* Live camera motion controller (pan/zoom/satellite) */}
        <MapCameraController />

        {/* Real GIS building polygons & door entrance pins on Google Maps vector tiles */}
        <CampusPolygonOverlay isLiveMap={true} />

        {/* Live user GPS blue dot anchored to map coordinates */}
        <UserLocationMarker />
      </Map>
    </APIProvider>
  );
};
