'use client';

import React, { useState, useEffect } from 'react';
import { GoogleMapProvider } from './GoogleMapProvider';
import { MapPlaceholder } from './MapPlaceholder';

interface MapAdapterProps {
  children?: React.ReactNode;
}

export const MapAdapter: React.FC<MapAdapterProps> = ({ children }) => {
  const [hasMapError, setHasMapError] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Catch Google Maps global authentication failure dynamically
  useEffect(() => {
    const handleAuthFailure = () => {
      console.warn('Google Maps API authentication failed. Falling back to vector map canvas.');
      setHasMapError(true);
    };

    window.gm_authFailure = handleAuthFailure;
    return () => {
      window.gm_authFailure = undefined;
    };
  }, []);

  const isValidApiKey =
    apiKey &&
    apiKey.trim() !== '' &&
    apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

  if (isValidApiKey && !hasMapError) {
    return <GoogleMapProvider apiKey={apiKey}>{children}</GoogleMapProvider>;
  }

  return <MapPlaceholder>{children}</MapPlaceholder>;
};

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}
