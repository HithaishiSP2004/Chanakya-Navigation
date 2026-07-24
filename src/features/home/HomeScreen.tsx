'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  MapPin, 
  Users, 
  GraduationCap, 
  Home, 
  BookOpen, 
  Utensils, 
  Car, 
  HeartPulse, 
  ShieldAlert,
  Sparkles,
  Mic,
  QrCode,
  Bot,
  RotateCcw,
  X,
  Bookmark,
  ChevronRight
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { LiveSearchHeader } from '@/features/search/LiveSearchHeader';
import { PlaceDetailSheet } from '@/features/search/PlaceDetailSheet';
import { RoutePreviewSheet } from '@/features/guidance/RoutePreviewSheet';
import { VoiceSearchModal } from '@/components/ui/VoiceSearchModal';
import { DestinationCard } from '@/components/ui/DestinationCard';
import { CampusAssistantModal } from '@/components/ui/CampusAssistantModal';
import { QRScannerModal } from '@/components/ui/QRScannerModal';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useGPSStore } from '@/stores/useGPSStore';
import { useMapStore } from '@/stores/useMapStore';
import { useFavoritesStore } from '@/stores/useFavoritesStore';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { NavigationRepository } from '@/repositories/navigationRepository';
import { GISEngine } from '@/utils/gisEngine';
import { mockVenues } from '@/repositories/venueRepository';

export interface IntentItem {
  id: string;
  venueId?: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  colorClass: string;
}

const intentItems: IntentItem[] = [
  {
    id: 'intent-admissions',
    venueId: 'v-admin-block-01',
    title: 'Admissions',
    subtitle: 'Admin Block · Room G-02',
    icon: <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
    colorClass: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40',
  },
  {
    id: 'intent-visit',
    venueId: 'v-admin-block-01',
    title: 'Campus Visit',
    subtitle: 'Admin Block Promenade',
    icon: <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
    colorClass: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/40',
  },
  {
    id: 'intent-faculty',
    venueId: 'v-acad-02',
    title: 'Faculty & Labs',
    subtitle: 'Academic Block 2',
    icon: <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
    colorClass: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/40',
  },
  {
    id: 'intent-student',
    venueId: 'v-admin-block-01',
    title: 'Auditorium',
    subtitle: 'Dr. Kasturirangan Hall',
    icon: <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
    colorClass: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/40',
  },
  {
    id: 'intent-hostel',
    venueId: 'v-hostel-01',
    title: 'Hostels & Housing',
    subtitle: 'Vidya Devi Jindal Block',
    icon: <Home className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
    colorClass: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40',
  },
  {
    id: 'intent-library',
    venueId: 'v-admin-block-01',
    title: 'Central Library',
    subtitle: 'Admin Block East Wing',
    icon: <BookOpen className="w-6 h-6 text-teal-600 dark:text-teal-400" />,
    colorClass: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/40',
  },
  {
    id: 'intent-food',
    venueId: 'v-food-01',
    title: 'Food & Cafes',
    subtitle: 'Chanakya Food Court',
    icon: <Utensils className="w-6 h-6 text-orange-600 dark:text-orange-400" />,
    colorClass: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/40',
  },
  {
    id: 'intent-sports',
    venueId: 'v-sports-complex',
    title: 'Sports Complex',
    subtitle: 'Indoor Badminton & Gym',
    icon: <Car className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />,
    colorClass: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800/40',
  },
  {
    id: 'intent-medical',
    venueId: 'v-clinic-01',
    title: 'Health Centre',
    subtitle: 'First Aid & Clinic',
    icon: <HeartPulse className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
    colorClass: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/40',
  },
  {
    id: 'intent-emergency',
    venueId: 'v-clinic-01',
    title: 'Emergency Response',
    subtitle: 'Security Desk & Clinic',
    icon: <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />,
    colorClass: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/40',
  },
];



export const HomeScreen: React.FC = () => {
  const { mode, selectedVenue, setSelectedVenue, setActiveRoute, setMode, setSheetSnapPoint } = useNavigationStore();
  const { setCenter, setSelectedBuildingId } = useMapStore();
  const { userLocation } = useGPSStore();
  const { favoriteIds, hydrate } = useFavoritesStore();
  const { lastUnfinishedVenue, history, clearUnfinishedVenue } = useJourneyStore();

  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [radiusFilter, setRadiusFilter] = useState<number>(250); // meters

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleIntentClick = (item: IntentItem) => {
    if (item.venueId) {
      const venue = mockVenues.find((v) => v.id === item.venueId);
      if (venue) {
        setSelectedVenue(venue);
        setCenter(venue.coordinate);
        setSelectedBuildingId(venue.buildingId || venue.id);
        setSheetSnapPoint(0.92);
      }
    }
  };

  const handleResumeNavigation = async () => {
    if (!lastUnfinishedVenue) return;
    const origin = userLocation || { lat: 13.2219, lng: 77.7539 };
    const route = await NavigationRepository.calculateRouteAsync(origin, lastUnfinishedVenue.id);
    if (route) {
      setSelectedVenue(lastUnfinishedVenue);
      setActiveRoute(route);
      setMode('PREVIEW');
      setSheetSnapPoint(0.5);
    }
  };

  if (mode === 'PREVIEW') {
    return <RoutePreviewSheet />;
  }

  if (selectedVenue) {
    return <PlaceDetailSheet />;
  }

  const popularVenues = mockVenues.filter((v) => (v.priority || 0) >= 8);
  const favoriteVenues = mockVenues.filter((v) => favoriteIds.includes(v.id));
  // Only run radius filter if we have a real GPS location (null = no location yet)
  const nearbyVenues = userLocation
    ? GISEngine.getVenuesInRadius(userLocation, radiusFilter, mockVenues)
    : [];

  return (
    <div className="flex flex-col gap-4 pt-1 pb-6">
      <VoiceSearchModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSelectQuery={() => {
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

      {/* 1. Primary Live Search Header at top for zero scrolling */}
      <LiveSearchHeader />

      {/* 2. Ask Campus AI Assistant & Quick QR Trigger Bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="flex-1 flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md hover:shadow-lg active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-white/20 backdrop-blur-md shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold leading-none">Ask Campus AI Assistant</h4>
              <p className="text-[10px] text-emerald-100 mt-0.5">&ldquo;Where to pay fees?&rdquo; • &ldquo;Show food court&rdquo;</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-200 shrink-0" />
        </button>

        <button
          onClick={() => setIsQROpen(true)}
          aria-label="Scan Poster QR Code"
          title="Scan Poster QR"
          className="p-3 rounded-2xl bg-slate-800 border border-slate-700/80 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shrink-0 active:scale-95 shadow-md"
        >
          <QrCode className="w-5 h-5" />
        </button>
      </div>

      {/* 3. Resume Unfinished Journey Card if present */}
      {lastUnfinishedVenue && (
        <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-white flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-amber-400 uppercase">Resume Journey</span>
              <h4 className="text-xs font-bold text-slate-100 truncate max-w-[180px]">{lastUnfinishedVenue.name}</h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleResumeNavigation}
              className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md transition-all active:scale-95"
            >
              Resume
            </button>
            <button
              onClick={clearUnfinishedVenue}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions Row — replaces non-functional role tabs */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setSheetSnapPoint(0.92)}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-600/90 hover:bg-emerald-500 active:scale-95 transition-all text-white shadow-md"
        >
          <div className="p-1.5 rounded-xl bg-white/20">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold leading-none">Find a Place</div>
            <div className="text-[10px] text-emerald-100 mt-0.5">Search campus</div>
          </div>
        </button>
        <button
          onClick={() => setIsQROpen(true)}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all text-white border border-slate-700 shadow-md"
        >
          <div className="p-1.5 rounded-xl bg-slate-700">
            <QrCode className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold leading-none">Scan QR</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Poster / sign</div>
          </div>
        </button>
      </div>

      {/* Pinned Favorites Quick Access Carousel */}
      {favoriteVenues.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-rose-500" />
              Pinned Favorites
            </h4>
            <span className="text-[10px] text-slate-400">{favoriteVenues.length} saved</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {favoriteVenues.map((v) => (
              <div
                key={v.id}
                onClick={() => {
                  setSelectedVenue(v);
                  setSheetSnapPoint(0.92);
                }}
                className="px-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0 cursor-pointer hover:border-emerald-500 transition-all shadow-sm"
              >
                <div className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-500">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{v.name}</h5>
                  <p className="text-[9px] text-slate-400">{v.buildingName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Discovery Walking Radius Filter */}
      <div className="flex items-center justify-between pt-1">
        <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Smart Nearby Discovery
        </h3>
        <div className="flex items-center gap-1">
          {[100, 250, 500].map((r) => (
            <button
              key={r}
              onClick={() => setRadiusFilter(r)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-all ${
                radiusFilter === r
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              {r}m
            </button>
          ))}
        </div>
      </div>

      {/* Popular Destinations Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {nearbyVenues.slice(0, 4).map((venue) => (
          <DestinationCard
            key={venue.id}
            venue={venue}
            distanceMeters={venue.category === 'ADMISSION' ? 120 : 260}
            walkingTimeMinutes={venue.category === 'ADMISSION' ? 2 : 3}
          />
        ))}
      </div>

      {/* Quick Intent Grid Header */}
      <div className="mt-2">
        <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Quick Category Shortcuts
        </h3>
      </div>

      {/* Intent Grid Container */}
      <div className="grid grid-cols-2 gap-3">
        {intentItems.map((item) => (
          <GlassCard
            key={item.id}
            variant="interactive"
            onClick={() => handleIntentClick(item)}
            className={`p-3 flex flex-col justify-between border ${item.colorClass} min-h-[92px]`}
          >
            <div className="mb-1">{item.icon}</div>
            <div>
              <h4 className="text-xs font-bold leading-tight text-slate-900 dark:text-slate-100">
                {item.title}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {item.subtitle}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
