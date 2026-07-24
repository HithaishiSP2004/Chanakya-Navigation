import { Point2D } from './spatial';

export type VenueCategory = 
  | 'ADMISSION' 
  | 'ACADEMIC' 
  | 'HOSTEL' 
  | 'LIBRARY' 
  | 'CAFETERIA' 
  | 'PARKING' 
  | 'MEDICAL' 
  | 'FACULTY' 
  | 'SPORTS' 
  | 'EMERGENCY'
  | 'SERVICES'
  | 'EVENTS';

export type VenueStatus = 'OPEN' | 'CLOSED' | 'BUSY' | 'UNDER_MAINTENANCE' | 'TEMPORARILY_CLOSED' | 'COMING_SOON';

export interface AccessibilityDetails {
  hasWheelchairRamp?: boolean;
  hasElevator?: boolean;
  hasAccessibleEntrance?: boolean;
  hasAccessibleToilet?: boolean;
  notes?: string;
}

/**
 * Sub-venue: a room, court, lab, or office INSIDE a parent building.
 * Sub-venues are shown inside the building's detail sheet — NOT rendered as map pins.
 * This prevents clustering of nearby venues that belong to the same building.
 */
export interface SubVenue {
  id: string;
  name: string;
  code?: string;
  roomNumber?: string;
  floor?: number;
  floorName?: string;
  description?: string;
  landmarkDescription?: string;
  openingHours?: string;
  phone?: string;
  email?: string;
  officialLink?: string;
}

export interface Venue {
  id: string;
  name: string;
  code: string;
  category: VenueCategory;
  subcategory?: string;
  parentCategory?: string;
  status?: VenueStatus;
  buildingName: string;
  buildingId?: string;
  parentVenueId?: string;
  entranceId?: string;
  floor: number;
  floorName?: string;
  roomNumber?: string;
  coordinate: Point2D;
  description: string;
  imageUrl: string;
  heroImage?: string;
  images?: string[];
  photos?: string[];
  galleryPhotos?: string[];
  entrancePhotos?: string[];
  roomPhotos?: string[];
  floorPhotos?: string[];
  entranceCoordinate: Point2D;
  isAccessible: boolean;
  wheelchairAccessible?: boolean;
  accessibilityDetails?: AccessibilityDetails;
  landmarkDescription?: string;
  keywords?: string[];
  synonyms?: string[];
  tags?: string[];
  collections?: string[];
  connectedVenueIds?: string[];
  estimatedVisitTime?: string;
  priority?: number;
  searchPopularityScore?: number;
  isOutdoor?: boolean;
  openingHours?: string;
  contact?: string;
  phone?: string;
  email?: string;
  officialLink?: string;
  website?: string;
  nearbyPlaces?: string[];
  /** Sub-venues inside this building (shown in detail sheet, NOT as separate map pins) */
  subVenues?: SubVenue[];
}

export interface ExploreCard {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  iconName: string;
  heroImage: string;
  description: string;
  venueId?: string;
  venueIds?: string[];
  collectionId?: string;
  badgeText?: string;
  officialWebLink?: string;
}
