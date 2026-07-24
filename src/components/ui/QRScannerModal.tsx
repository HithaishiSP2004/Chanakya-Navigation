'use client';

import React, { useState, useEffect } from 'react';
import { QrCode, X, Sparkles, Navigation, CheckCircle2 } from 'lucide-react';
import { mockVenues } from '@/repositories/venueRepository';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useGPSStore } from '@/stores/useGPSStore';
import { useMapStore } from '@/stores/useMapStore';
import { NavigationRepository } from '@/repositories/navigationRepository';
import { Venue } from '@/types/venue';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose }) => {
  const [scannedVenue, setScannedVenue] = useState<Venue | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  const { setSelectedVenue, setActiveRoute, setMode, setSheetSnapPoint } = useNavigationStore();
  const { setCenter, setSelectedBuildingId } = useMapStore();
  const { userLocation } = useGPSStore();

  useEffect(() => {
    if (!isOpen) return;

    setIsScanning(true);
    setScannedVenue(null);

    // Simulate scanning camera finding QR poster code
    const timer = setTimeout(() => {
      const target = mockVenues.find((v) => v.id === 'v-admis-room-01') || mockVenues[0];
      setScannedVenue(target);
      setIsScanning(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartNav = () => {
    if (!scannedVenue) return;
    const origin = userLocation || { lat: 13.2219, lng: 77.7539 };
    const route = NavigationRepository.calculateRoute(origin, scannedVenue.id);

    setSelectedVenue(scannedVenue);
    setCenter(scannedVenue.coordinate);
    setSelectedBuildingId(scannedVenue.buildingId || scannedVenue.id);

    if (route) {
      setActiveRoute(route);
      setMode('PREVIEW');
      setSheetSnapPoint(0.5);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-4 text-white animate-fade-in">
      <button
        onClick={onClose}
        aria-label="Close QR Scanner"
        className="absolute top-6 right-6 p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex flex-col items-center gap-6 max-w-sm text-center">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <QrCode className="w-5 h-5" />
          <span>Campus Poster QR Quick Navigator</span>
        </div>

        {/* Viewfinder Target Box */}
        <div className="relative w-64 h-64 rounded-3xl border-2 border-emerald-500/80 bg-slate-900/60 overflow-hidden flex flex-col items-center justify-center p-4 shadow-2xl">
          {/* Laser Scanner Line */}
          {isScanning && (
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce shadow-glow" />
          )}

          {isScanning ? (
            <div className="flex flex-col items-center gap-2">
              <QrCode className="w-16 h-16 text-emerald-400 animate-pulse" />
              <p className="text-xs text-slate-300 font-medium">Align camera with campus QR code poster...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300">QR Code Detected!</span>
              <h4 className="text-sm font-bold text-white">{scannedVenue?.name}</h4>
              <p className="text-[10px] text-slate-400">{scannedVenue?.buildingName}</p>
            </div>
          )}
        </div>

        {!isScanning && scannedVenue && (
          <button
            onClick={handleStartNav}
            className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
          >
            <Navigation className="w-4 h-4 fill-white" />
            <span>Navigate to Scanned Destination</span>
          </button>
        )}
      </div>
    </div>
  );
};
