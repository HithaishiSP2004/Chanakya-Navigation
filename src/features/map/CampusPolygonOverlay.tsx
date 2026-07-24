'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useMap, AdvancedMarker } from '@vis.gl/react-google-maps';
import { 
  Building2, 
  GraduationCap, 
  BookOpen, 
  Utensils, 
  Home, 
  Trophy, 
  HeartPulse, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  DoorOpen, 
  CreditCard, 
  Coffee, 
  ShoppingBag 
} from 'lucide-react';
import { mockVenues } from '@/repositories/venueRepository';
import { useMapStore } from '@/stores/useMapStore';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { Venue } from '@/types/venue';
import { GoogleMapPolyline } from './GoogleMapPolyline';

interface CampusPolygonOverlayProps {
  isLiveMap?: boolean;
}

// ─── Category Config ─────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<string, {
  bg: string; ring: string; glow: string;
}> = {
  ADMISSION: { bg: '#059669', ring: '#34d399', glow: '#05966966' },
  ACADEMIC:  { bg: '#2563eb', ring: '#60a5fa', glow: '#2563eb55' },
  LIBRARY:   { bg: '#0d9488', ring: '#2dd4bf', glow: '#0d948855' },
  CAFETERIA: { bg: '#ea580c', ring: '#fb923c', glow: '#ea580c55' },
  HOSTEL:    { bg: '#d97706', ring: '#fbbf24', glow: '#d9770655' },
  SPORTS:    { bg: '#0891b2', ring: '#22d3ee', glow: '#0891b255' },
  MEDICAL:   { bg: '#e11d48', ring: '#fb7185', glow: '#e11d4855' },
  EVENTS:    { bg: '#7c3aed', ring: '#a78bfa', glow: '#7c3aed55' },
  SERVICES:  { bg: '#334155', ring: '#94a3b8', glow: '#33415555' },
  DEFAULT:   { bg: '#475569', ring: '#94a3b8', glow: '#47556955' },
};

function getCfg(category: string) {
  return CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.DEFAULT;
}

// ─── Crisp Vector Lucide Icon Renderer for Pin ───────────────────────
function renderVenueIcon(venue: Venue) {
  if (venue.id === 'v-gate-05') return <DoorOpen className="w-3.5 h-3.5 text-slate-800" />;
  if (venue.id === 'v-admis-room-01') return <CreditCard className="w-3.5 h-3.5 text-emerald-800" />;
  if (venue.id === 'v-admin-cafe-01') return <Coffee className="w-3.5 h-3.5 text-amber-800" />;
  if (venue.id === 'v-shop-01') return <ShoppingBag className="w-3.5 h-3.5 text-orange-800" />;

  switch (venue.category) {
    case 'ADMISSION': return <Building2 className="w-3.5 h-3.5 text-emerald-800" />;
    case 'ACADEMIC':  return <GraduationCap className="w-3.5 h-3.5 text-blue-800" />;
    case 'LIBRARY':   return <BookOpen className="w-3.5 h-3.5 text-teal-800" />;
    case 'CAFETERIA': return <Utensils className="w-3.5 h-3.5 text-orange-800" />;
    case 'HOSTEL':    return <Home className="w-3.5 h-3.5 text-amber-800" />;
    case 'SPORTS':    return <Trophy className="w-3.5 h-3.5 text-cyan-800" />;
    case 'MEDICAL':   return <HeartPulse className="w-3.5 h-3.5 text-rose-800" />;
    case 'EVENTS':    return <Sparkles className="w-3.5 h-3.5 text-purple-800" />;
    case 'SERVICES':  return <ShieldCheck className="w-3.5 h-3.5 text-slate-800" />;
    default:          return <MapPin className="w-3.5 h-3.5 text-slate-800" />;
  }
}

// ─── Zoom-based Visibility Tiers ────────────────────────────────────
//
//  < 15.5   → No markers at all (campus too zoomed-out, too cluttered)
//  15.5–17  → Only PRIORITY venues (major buildings, ~6-8 pins)
//  ≥ 17     → All venues (sub-rooms, detailed facilities)
//
const MIN_SHOW_ZOOM = 15.5;
const ALL_VENUES_ZOOM = 17.0;

// Priority venues shown at medium zoom (priority >= 7 OR manually listed)
const PRIORITY_VENUE_IDS = new Set([
  'v-admin-block-01',    // Admin Block
  'v-acad-01',           // Academic Block 1
  'v-acad-02',           // Academic Block 2
  'v-hostel-01',         // Hostel
  'v-food-01',           // Food Court
  'v-sports-complex',    // Sports Complex
  'v-clinic-01',         // Health Centre
  'v-gate-05',           // Gate 5 Entrance
  'v-main-gate',         // Main Gate
  'v-creative-block-01', // Creative/Innovation Block
]);

// Sub-detail venues: only shown at high zoom (≥17.5)
const DETAIL_VENUE_IDS = new Set([
  'v-admis-room-01',
  'v-admin-cafe-01',
  'v-lib-01',
  'v-audi-01',
  'v-sports-basketball',
  'v-sports-badminton-out',
  'v-sports-tennis',
]);

const DETAIL_ZOOM_THRESHOLD = 17.5;

// ─── Short Label for Pin ─────────────────────────────────────────────
function getShortLabel(venue: Venue): string {
  if (venue.id === 'v-gate-05') return 'Gate 5 Entrance';
  if (venue.id === 'v-admin-block-01') return 'Admin Block';
  if (venue.id === 'v-admis-room-01') return 'Admissions G-02';

  const stopWords = ['&', 'and', 'the', 'of', 'Dr.', 'Dr', 'K.', 'Sita', 'Ram', 'Jindal',
    'Sudha', 'Kris', 'Gopalakrishnan', 'Chanakya', 'University', 'By', 'Metro', 'Enterprises',
    'Campus', 'Block', 'Complex', 'Administrative'];
  const words = venue.name.split(' ').filter(w => !stopWords.includes(w));
  const label = words.slice(0, 2).join(' ');
  return label.length > 13 ? label.slice(0, 12) + '…' : label || venue.name.slice(0, 10);
}

// ─── Individual Pin Component ─────────────────────────────────────────
const VenuePin: React.FC<{
  venue: Venue;
  isSelected: boolean;
  isDetailPin: boolean;
  isCompact: boolean;  // compact = small circle icon at medium zoom
  onClick: () => void;
}> = React.memo(({ venue, isSelected, isDetailPin, isCompact, onClick }) => {
  const cfg = getCfg(venue.category);

  // ── Compact mode: small Google-Maps-style circle with icon ──────
  if (isCompact && !isSelected) {
    return (
      <div
        onClick={onClick}
        className="relative flex flex-col items-center cursor-pointer select-none"
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        {/* Circle icon */}
        <div
          className="flex items-center justify-center rounded-full border-2 border-white shadow-lg"
          style={{
            width: 32,
            height: 32,
            background: cfg.bg,
            boxShadow: `0 2px 8px ${cfg.glow}`,
          }}
        >
          {renderVenueIcon(venue)}
        </div>
      </div>
    );
  }

  const pinW = isSelected ? 44 : isDetailPin ? 32 : 38;
  const pinH = isSelected ? 58 : isDetailPin ? 42 : 50;

  return (
    <div
      onClick={onClick}
      className="relative flex flex-col items-center cursor-pointer select-none"
      style={{
        transform: isCompact ? 'translate(-50%, -50%)' : 'translate(-50%, -100%)',
        transformOrigin: 'bottom center',
        filter: isSelected
          ? `drop-shadow(0 6px 18px ${cfg.glow}) drop-shadow(0 0 8px ${cfg.ring}88)`
          : `drop-shadow(0 2px 6px ${cfg.glow})`,
        transition: 'filter 0.2s, transform 0.15s',
      }}
    >
      {/* ── Callout bubble — positioned absolutely above pin without altering pin tip anchor ── */}
      {isSelected && (
        <div
          className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 rounded-xl text-center leading-tight px-2.5 py-1.5 whitespace-nowrap z-20"
          style={{
            background: 'rgba(2,6,23,0.96)',
            border: `1.5px solid ${cfg.ring}`,
            backdropFilter: 'blur(16px)',
            boxShadow: `0 4px 20px ${cfg.glow}`,
            maxWidth: 170,
          }}
        >
          <p className="text-[10px] font-black text-white leading-snug truncate">{venue.name}</p>
          {(venue.floorName || venue.roomNumber) && (
            <p className="text-[8px] font-semibold mt-0.5 truncate" style={{ color: cfg.ring }}>
              {venue.roomNumber ? `${venue.roomNumber}` : venue.floorName}
            </p>
          )}
        </div>
      )}

      {/* ── Pin body ── */}
      <div
        style={{
          transform: isSelected ? 'scale(1.2)' : 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <svg
          viewBox="0 0 48 62"
          width={pinW}
          height={pinH}
          style={{ overflow: 'visible', display: 'block' }}
        >
          <defs>
            <radialGradient id={`g-${venue.id}`} cx="38%" cy="28%" r="70%">
              <stop offset="0%" stopColor={cfg.ring} />
              <stop offset="100%" stopColor={cfg.bg} />
            </radialGradient>
            <filter id={`sh-${venue.id}`} x="-40%" y="-20%" width="180%" height="180%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor={cfg.bg} floodOpacity="0.55" />
            </filter>
          </defs>

          {/* Teardrop Pin */}
          <path
            d="M24 2C14.06 2 6 10.06 6 20C6 33.25 24 58 24 58C24 58 42 33.25 42 20C42 10.06 33.94 2 24 2Z"
            fill={`url(#g-${venue.id})`}
            filter={`url(#sh-${venue.id})`}
            stroke={isSelected ? '#ffffff' : cfg.ring}
            strokeWidth={isSelected ? 2 : 1.2}
            strokeOpacity={isSelected ? 1 : 0.55}
          />

          {/* Inner white circle */}
          <circle cx="24" cy="20" r="11" fill="white" fillOpacity="0.95" />
          {/* Gloss */}
          <ellipse cx="20" cy="15" rx="4.5" ry="3" fill="white" fillOpacity="0.3" />

          {/* Crisp Lucide Vector Icon */}
          <foreignObject x="12" y="9" width="24" height="22">
            <div style={{
              width: '100%', height: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              {renderVenueIcon(venue)}
            </div>
          </foreignObject>
        </svg>
      </div>

      {/* ── Label chip — positioned absolutely below pin so SVG tip is the exact bottom anchor point ── */}
      {!isDetailPin && (
        <div
          className="absolute top-full mt-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-lg whitespace-nowrap z-10"
          style={{
            background: isSelected ? cfg.bg : 'rgba(2,6,23,0.88)',
            color: isSelected ? '#fff' : cfg.ring,
            border: `1px solid ${isSelected ? cfg.ring : 'rgba(148,163,184,0.3)'}`,
            backdropFilter: 'blur(6px)',
            fontSize: '8px',
            fontWeight: 800,
            maxWidth: 100,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            letterSpacing: '0.02em',
          }}
        >
          {getShortLabel(venue)}
        </div>
      )}
    </div>
  );
});

VenuePin.displayName = 'VenuePin';

// ─── Main Live Overlay ────────────────────────────────────────────────
const LiveMapOverlay: React.FC = () => {
  const map = useMap();
  const { setSelectedBuildingId, setCenter } = useMapStore();
  const { selectedVenue, setSelectedVenue, activeRoute, setSheetSnapPoint } = useNavigationStore();
  const [zoom, setZoom] = useState<number>(15);

  useEffect(() => {
    if (!map) return;
    const listener = map.addListener('zoom_changed', () => {
      setZoom(map.getZoom() ?? 15);
    });
    setZoom(map.getZoom() ?? 15);
    return () => {
      // @ts-ignore google.maps.MapsEventListener
      listener.remove();
    };
  }, [map]);

  const handleVenuePinClick = useCallback((venue: Venue) => {
    setSelectedVenue(venue);
    setCenter(venue.coordinate);
    if (venue.buildingId) setSelectedBuildingId(venue.buildingId);
    setSheetSnapPoint(0.5);
  }, [setSelectedVenue, setCenter, setSelectedBuildingId, setSheetSnapPoint]);

  if (!map) return null;

  // ── Visibility tier based on zoom ────────────────────────────────
  if (zoom < MIN_SHOW_ZOOM) {
    // Zoomed too far out — render nothing except the route polyline
    return (
      <>
        {activeRoute?.polyline && activeRoute.polyline.length > 1 && (
          <>
            <GoogleMapPolyline path={activeRoute.polyline} strokeColor="#FFFFFF" strokeWeight={10} strokeOpacity={0.6} />
            <GoogleMapPolyline path={activeRoute.polyline} strokeColor="#1A73E8" strokeWeight={6} strokeOpacity={0.95} />
            <GoogleMapPolyline path={activeRoute.polyline} strokeColor="#93C5FD" strokeWeight={2.5} strokeOpacity={0.7} />
          </>
        )}
      </>
    );
  }

  const isCompactZoom  = zoom >= MIN_SHOW_ZOOM && zoom < ALL_VENUES_ZOOM;  // 15.5–17
  const showDetailPins = zoom >= DETAIL_ZOOM_THRESHOLD;                    // 17.5+

  // Filter which venues to show
  const visibleVenues = mockVenues.filter(v => {
    if (isCompactZoom) {
      // Medium zoom: only priority venues (no detail sub-rooms)
      return PRIORITY_VENUE_IDS.has(v.id) || (v.priority ?? 0) >= 7;
    }
    if (!showDetailPins) {
      // High zoom but below detail threshold: show all except sub-rooms
      return !DETAIL_VENUE_IDS.has(v.id);
    }
    return true; // Detail zoom: show everything
  });

  return (
    <>
      {/* ── Route Polyline ── */}
      {activeRoute?.polyline && activeRoute.polyline.length > 1 && (
        <>
          <GoogleMapPolyline path={activeRoute.polyline} strokeColor="#FFFFFF" strokeWeight={10} strokeOpacity={0.6} />
          <GoogleMapPolyline path={activeRoute.polyline} strokeColor="#1A73E8" strokeWeight={6} strokeOpacity={0.95} />
          <GoogleMapPolyline path={activeRoute.polyline} strokeColor="#93C5FD" strokeWeight={2.5} strokeOpacity={0.7} />
        </>
      )}

      {/* ── Venue Pins ── */}
      {visibleVenues.map((venue) => {
        const isSelected = selectedVenue?.id === venue.id ||
          (activeRoute?.destinationBuildingId === venue.buildingId && activeRoute?.destinationBuildingId !== undefined);
        const isDetailPin = DETAIL_VENUE_IDS.has(venue.id);
        const isCompact   = isCompactZoom && !isSelected;

        return (
          <AdvancedMarker
            key={venue.id}
            position={{ lat: venue.coordinate.lat, lng: venue.coordinate.lng }}
            title={venue.name}
            zIndex={isSelected ? 100 : isDetailPin ? 5 : 20}
            onClick={() => handleVenuePinClick(venue)}
          >
            <VenuePin
              venue={venue}
              isSelected={!!isSelected}
              isDetailPin={isDetailPin}
              isCompact={isCompact}
              onClick={() => handleVenuePinClick(venue)}
            />
          </AdvancedMarker>
        );
      })}
    </>
  );
};

export const CampusPolygonOverlay: React.FC<CampusPolygonOverlayProps> = ({ isLiveMap = false }) => {
  if (isLiveMap) return <LiveMapOverlay />;
  return null;
};
