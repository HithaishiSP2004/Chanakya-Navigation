'use client';

import React, { useState } from 'react';
import { Plus, Crosshair, Search, Mic, Phone, X, Navigation, Bot, QrCode } from 'lucide-react';
import { useGPSStore } from '@/stores/useGPSStore';
import { useMapStore } from '@/stores/useMapStore';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useUIStore } from '@/stores/useUIStore';
import { VoiceSearchModal } from './VoiceSearchModal';
import { CampusAssistantModal } from './CampusAssistantModal';
import { QRScannerModal } from './QRScannerModal';

export const FloatingActionHub: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);

  const { userLocation } = useGPSStore();
  const { setCenter } = useMapStore();
  const { mode, setSheetSnapPoint } = useNavigationStore();
  const { setActiveTab } = useUIStore();

  // Hide during active navigation (NavGuidanceFooter takes over)
  if (mode === 'NAVIGATING') return null;

  const handleRecenter = () => {
    if (userLocation) setCenter(userLocation);
    setIsOpen(false);
  };

  const handleOpenSearch = () => {
    setActiveTab('NAVIGATE');
    setSheetSnapPoint(0.92);
    setIsOpen(false);
  };

  const handleVoiceSearch = () => {
    setIsVoiceOpen(true);
    setIsOpen(false);
  };

  const handleAssistantOpen = () => {
    setIsAssistantOpen(true);
    setIsOpen(false);
  };

  const handleQROpen = () => {
    setIsQROpen(true);
    setIsOpen(false);
  };

  const handleEmergencyCall = () => {
    window.location.href = 'tel:08031233100';
    setIsOpen(false);
  };

  return (
    <>
      <VoiceSearchModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSelectQuery={() => {
          setActiveTab('NAVIGATE');
          setSheetSnapPoint(0.92);
        }}
      />

      <CampusAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />

      <QRScannerModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
      />

      {/* Floating Hub Positioned at Right-Bottom (above bottom sheet / tab bar) */}
      <div className="fixed right-4 bottom-24 z-40 flex flex-col items-end gap-2.5">
        {/* Expanded Action Menu Items */}
        {isOpen && (
          <div className="flex flex-col items-end gap-2 mb-1 animate-fade-in">
            <button
              onClick={handleEmergencyCall}
              aria-label="Emergency Call"
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-rose-600 text-white text-xs font-bold shadow-xl border border-rose-500/50 hover:bg-rose-700 active:scale-95 transition-all"
            >
              <span>Emergency Helpdesk</span>
              <Phone className="w-4 h-4" />
            </button>

            <button
              onClick={handleAssistantOpen}
              aria-label="Campus AI Assistant"
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-bold shadow-xl border border-emerald-400/50 hover:scale-105 active:scale-95 transition-all"
            >
              <span>Ask AI Assistant</span>
              <Bot className="w-4 h-4 text-emerald-200" />
            </button>

            <button
              onClick={handleQROpen}
              aria-label="Scan Poster QR"
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/95 text-purple-300 text-xs font-bold shadow-xl border border-slate-700/80 hover:bg-slate-800 active:scale-95 transition-all"
            >
              <span>Scan Poster QR</span>
              <QrCode className="w-4 h-4 text-purple-400" />
            </button>

            <button
              onClick={handleVoiceSearch}
              aria-label="Voice Search"
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/95 text-emerald-400 text-xs font-bold shadow-xl border border-slate-700/80 hover:bg-slate-800 active:scale-95 transition-all"
            >
              <span>Voice Search</span>
              <Mic className="w-4 h-4 text-emerald-400" />
            </button>

            <button
              onClick={handleOpenSearch}
              aria-label="Quick Search"
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/95 text-white text-xs font-bold shadow-xl border border-slate-700/80 hover:bg-slate-800 active:scale-95 transition-all"
            >
              <span>Search Places</span>
              <Search className="w-4 h-4 text-blue-400" />
            </button>

            <button
              onClick={handleRecenter}
              aria-label="My Location"
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/95 text-white text-xs font-bold shadow-xl border border-slate-700/80 hover:bg-slate-800 active:scale-95 transition-all"
            >
              <span>My Location</span>
              <Crosshair className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        )}

        {/* Main Floating Trigger Button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Campus Action Hub"
          className="relative p-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-2xl border border-emerald-400/40 hover:scale-105 active:scale-95 transition-all duration-300 group"
        >
          {isOpen ? (
            <X className="w-6 h-6 rotate-90 transition-transform duration-300" />
          ) : (
            <Navigation className="w-6 h-6 fill-white group-hover:rotate-45 transition-transform duration-300" />
          )}
        </button>
      </div>
    </>
  );
};
