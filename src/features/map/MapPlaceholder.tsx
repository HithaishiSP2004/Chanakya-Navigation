'use client';

import React from 'react';
import { useMapStore } from '@/stores/useMapStore';
import { CampusPolygonOverlay } from './CampusPolygonOverlay';

interface MapPlaceholderProps {
  children?: React.ReactNode;
}

export const MapPlaceholder: React.FC<MapPlaceholderProps> = ({ children }) => {
  const { mapType } = useMapStore();

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 overflow-hidden select-none">
      {/* Map Vector Grid Canvas Background */}
      <div 
        className="absolute inset-0 opacity-40 dark:opacity-60 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]"
        style={{
          backgroundColor: mapType === 'satellite' ? '#0b1329' : '#020617',
        }}
      />

      {/* Campus GIS Vector Building Polygons & Active Navigation Polyline */}
      <CampusPolygonOverlay isLiveMap={false} />

      {children}
    </div>
  );
};
