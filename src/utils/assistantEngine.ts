import { Venue } from '@/types/venue';
import { Point2D } from '@/types/spatial';
import { mockVenues } from '@/repositories/venueRepository';

export type AssistantIntent =
  | 'ADMISSIONS'
  | 'FEE_PAYMENT'
  | 'FOOD'
  | 'LIBRARY'
  | 'SPORTS'
  | 'MEDICAL'
  | 'HOSTEL'
  | 'ACADEMIC'
  | 'SHOP'
  | 'GENERAL_NAV';

export interface AssistantAnswer {
  intent: AssistantIntent;
  title: string;
  responseMessage: string;
  recommendedVenues: Venue[];
  distanceNote?: string;
  tip?: string;
}

// Haversine distance in metres
function distanceTo(from: Point2D, to: Point2D): number {
  const R = 6371e3;
  const φ1 = (from.lat * Math.PI) / 180;
  const φ2 = (to.lat * Math.PI) / 180;
  const Δφ = ((to.lat - from.lat) * Math.PI) / 180;
  const Δλ = ((to.lng - from.lng) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Build a distance note string if userLocation is known */
function buildDistanceNote(venue: Venue, userLocation: Point2D | null): string | undefined {
  if (!userLocation) return undefined;
  const d = Math.round(distanceTo(userLocation, venue.coordinate));
  const mins = Math.max(1, Math.ceil(d / 80)); // ~80m/min walking pace
  if (d < 15) return `You are right here.`;
  return `~${d}m away · about ${mins} min walk from your location`;
}

/** Levenshtein-based fuzzy match — returns true if similarity is good enough */
function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t.includes(q) || q.includes(t)) return true;

  // Allow up to 2 character errors for words 5+ chars long
  if (q.length < 4) return false;
  let errors = 0;
  const shorter = q.length <= t.length ? q : t;
  const longer = q.length > t.length ? q : t;
  for (let i = 0; i < shorter.length; i++) {
    if (shorter[i] !== longer[i]) errors++;
    if (errors > 2) return false;
  }
  if (Math.abs(q.length - t.length) + errors > 2) return false;
  return true;
}

/** Check if query matches any keyword/synonym/name in venue */
function venueMatchesQuery(venue: Venue, q: string): boolean {
  const fields = [
    venue.name,
    venue.buildingName,
    ...(venue.keywords || []),
    ...(venue.synonyms || []),
    ...(venue.tags || []),
    venue.description,
  ];
  return fields.some((f) => fuzzyMatch(q, f));
}

export class AssistantEngine {
  /**
   * Parse a natural language query and return a focused, accurate answer.
   * Supports distance-awareness when userLocation is provided.
   */
  public static processQuery(query: string, userLocation: Point2D | null = null): AssistantAnswer {
    const q = query.trim().toLowerCase();

    if (!q) {
      return {
        intent: 'GENERAL_NAV',
        title: 'Chanakya Campus Guide',
        responseMessage: 'Ask me where to go — I will find the exact room and give you directions.',
        recommendedVenues: mockVenues.slice(0, 3),
        tip: 'Try "Where is Admissions?" or "Take me to the food court"',
      };
    }

    // ── ADMISSIONS / FEE / KCET / REGISTRATION ──
    if (
      q.match(/admission|admis|enroll|enrol|kcet|reporting|join|counsell?ing|fee|pay|scholarship|register/)
    ) {
      const venue = mockVenues.find((v) => v.id === 'v-admin-block-01')!;
      return {
        intent: 'ADMISSIONS',
        title: 'Admissions & Fee Payment',
        responseMessage:
          'The Admissions Office and Fee Payment Counter are on the Ground Floor (Room G-02) of the Dr. Sita Ram Jindal Administrative Block. KCET physical reporting is done at the same counter.',
        recommendedVenues: [venue],
        distanceNote: buildDistanceNote(venue, userLocation),
        tip: 'Open Mon–Sat, 9:00 AM – 5:30 PM · Keep your documents ready',
      };
    }

    // ── FOOD / CAFETERIA / DINING / MESS ──
    if (q.match(/food|eat|lunch|dinner|breakfast|cafe|canteen|mess|dining|hungry|drink|juice|snack|bakery|tiffin/)) {
      const venue = mockVenues.find((v) => v.id === 'v-food-01')!;
      return {
        intent: 'FOOD',
        title: 'Food Court & Dining Plaza',
        responseMessage:
          'The main Food Court serves breakfast, lunch, dinner, fresh juices, and snacks. It is open from 7:30 AM to 9:30 PM daily.',
        recommendedVenues: [venue],
        distanceNote: buildDistanceNote(venue, userLocation),
        tip: 'Peak dining hours: 12:30 – 2:00 PM. Mini Mart near Hostels is open till 9:30 PM for snacks.',
      };
    }

    // ── LIBRARY / STUDY / BOOKS / RESEARCH ──
    if (q.match(/librar|book|study|read|research|journal|periodical|reference|knowledge|reading room/)) {
      const venue = mockVenues.find((v) => v.id === 'v-lib-01')!;
      return {
        intent: 'LIBRARY',
        title: 'Central Library',
        responseMessage:
          'The Central University Library is on the east wing of the Admin Block (Ground & 1st Floor). It has 50,000+ volumes, digital terminals, quiet study pods, and research archives.',
        recommendedVenues: [venue],
        distanceNote: buildDistanceNote(venue, userLocation),
        tip: 'Library closes at 10:00 PM on weekdays. Silence zones on the 1st Floor.',
      };
    }

    // ── SPORTS / GYM / BADMINTON / CRICKET / FITNESS ──
    if (q.match(/sport|gym|fitness|badminton|cricket|basketball|tennis|kabaddi|exercise|workout|track|ground/)) {
      const indoor = mockVenues.find((v) => v.id === 'v-sports-complex')!;
      const cricket = mockVenues.find((v) => v.id === 'v-sports-cricket')!;
      const basketball = mockVenues.find((v) => v.id === 'v-sports-basketball')!;
      const tennis = mockVenues.find((v) => v.id === 'v-sports-tennis')!;
      const venues = [indoor, cricket, basketball, tennis].filter(Boolean);
      return {
        intent: 'SPORTS',
        title: 'Sports Facilities',
        responseMessage:
          'Indoor: Badminton Courts, Gymnasium & Kabaddi (Sports Complex). Outdoor: Cricket Stadium, Basketball Court, Tennis Court, and Badminton Courts (North-East Grounds).',
        recommendedVenues: venues.slice(0, 3),
        distanceNote: buildDistanceNote(indoor, userLocation),
        tip: 'Indoor complex opens at 6:00 AM. Outdoor grounds open till 7:00 PM.',
      };
    }

    // ── MEDICAL / DOCTOR / CLINIC / EMERGENCY / SICK ──
    if (q.match(/doctor|medical|clinic|health|first aid|emergency|sick|nurse|pharmacy|ambulance|infirmary|dispens/)) {
      const venue = mockVenues.find((v) => v.id === 'v-clinic-01')!;
      return {
        intent: 'MEDICAL',
        title: 'Campus Health Clinic',
        responseMessage:
          '24/7 Health Clinic with resident doctor, emergency first aid, and pharmacy is located next to the Student Hostels. For emergencies, call 08031233999.',
        recommendedVenues: [venue],
        distanceNote: buildDistanceNote(venue, userLocation),
        tip: '⚠️ Emergency? Call Security: 08031233100',
      };
    }

    // ── HOSTEL / ACCOMMODATION / ROOM / DORM ──
    if (q.match(/hostel|accommodation|dorm|dormitor|room|stay|residential|warden|boys|girls/)) {
      const venue = mockVenues.find((v) => v.id === 'v-hostel-01')!;
      return {
        intent: 'HOSTEL',
        title: 'Student Hostels',
        responseMessage:
          'Girls and Boys Hostel Blocks are in the eastern residential complex with warden office, study lounges, and biometric entry. Mini Mart and Clinic are adjacent.',
        recommendedVenues: [venue],
        distanceNote: buildDistanceNote(venue, userLocation),
        tip: 'Warden office: Ground Floor, open 8 AM – 10 PM. Visitor hours: 9 AM – 7 PM.',
      };
    }

    // ── ACADEMIC / CLASSROOM / LAB / LECTURE / ENGINEERING ──
    if (q.match(/class|lecture|hall|lab|department|faculty|professor|engineering|computer|mba|mca|b\.?tech|school of/)) {
      const venue = mockVenues.find((v) => v.id === 'v-acad-02')!;
      return {
        intent: 'ACADEMIC',
        title: 'Academic Block',
        responseMessage:
          'Academic Block 2 houses engineering labs, computer science labs, audio-visual lecture halls, and faculty rooms. All schools and departments operate from this block.',
        recommendedVenues: [venue],
        distanceNote: buildDistanceNote(venue, userLocation),
        tip: 'Academic block opens at 8:00 AM. Class schedules are posted on the ground floor notice board.',
      };
    }

    // ── AUDITORIUM / HALL / CONFERENCE ──
    if (q.match(/auditorium|audi|hall|conference|seminar|event|orientation|cultural|kasturirangan/)) {
      const venue = mockVenues.find((v) => v.id === 'v-audi-01')!;
      return {
        intent: 'GENERAL_NAV',
        title: 'Auditorium',
        responseMessage:
          'The Dr. K. Kasturirangan Auditorium (300 seats) is in the east wing of the Admin Block — Ground Floor, Hall A.',
        recommendedVenues: [venue],
        distanceNote: buildDistanceNote(venue, userLocation),
        tip: 'Double wooden doors on the east wing. Check notice boards for event schedules.',
      };
    }

    // ── SHOP / STORE / STATIONERY / PRINTING / XEROX ──
    if (q.match(/shop|store|mart|grocery|stationery|print|xerox|photocopy|essentials|supply|buy|metro/)) {
      const venue = mockVenues.find((v) => v.id === 'v-shop-01')!;
      return {
        intent: 'SHOP',
        title: 'Mini Mart by Metro Enterprises',
        responseMessage:
          'Mini Mart by Metro Enterprises near the Hostels sells groceries, stationery, daily essentials, and offers printing & photocopying services.',
        recommendedVenues: [venue],
        distanceNote: buildDistanceNote(venue, userLocation),
        tip: 'Open daily 8:00 AM – 9:30 PM.',
      };
    }

    // ── FUZZY SEARCH FALLBACK ──
    const matched = mockVenues.filter((v) => venueMatchesQuery(v, q));

    if (matched.length > 0) {
      // Sort by distance if location known
      const sorted = userLocation
        ? [...matched].sort((a, b) => distanceTo(userLocation, a.coordinate) - distanceTo(userLocation, b.coordinate))
        : matched;

      const top = sorted[0];
      return {
        intent: 'GENERAL_NAV',
        title: `Found: ${top.name}`,
        responseMessage: `${top.name} is in ${top.buildingName}${top.floorName ? `, ${top.floorName}` : ''}.`,
        recommendedVenues: sorted.slice(0, 3),
        distanceNote: buildDistanceNote(top, userLocation),
      };
    }

    // Nothing found
    return {
      intent: 'GENERAL_NAV',
      title: 'Not Found',
      responseMessage: `No campus location matched "${query}". Try searching for "Admissions", "Food Court", "Library", "Sports", "Hostel", or "Clinic".`,
      recommendedVenues: mockVenues.slice(0, 3),
    };
  }
}
