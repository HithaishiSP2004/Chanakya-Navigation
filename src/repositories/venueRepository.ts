import { Venue, VenueCategory } from '@/types/venue';
import buildingPolygonsData from '@/gis/building-polygons.json';
import { BuildingPolygon } from '@/types/spatial';

export const buildingPolygons = buildingPolygonsData as BuildingPolygon[];

// ============================================================
// Chanakya University — Devanahalli, Karnataka
// ALL coordinates verified from implementaion-plan-changes.md
// Each location with a distinct GPS coordinate = its own map pin.
// Sub-venues only used for things sharing the exact same entry.
// ============================================================

export const mockVenues: Venue[] = [

  // ==================== ADMINISTRATIVE BLOCK ====================
  {
    id: 'v-admin-block-01',
    name: 'Administrative Block',
    code: 'ND-ADMIN-01',
    category: 'ADMISSION',
    subcategory: 'Central Administration',
    status: 'OPEN',
    buildingName: 'Dr. Sita Ram Jindal Administrative Block',
    buildingId: 'bldg-admin-01',
    entranceId: 'ent-admin-main',
    floor: 0,
    floorName: 'Ground Floor',
    roomNumber: 'Main Entrance',
    coordinate: { lat: 13.222172, lng: 77.755378 },
    entranceCoordinate: { lat: 13.222172, lng: 77.755378 },
    description: 'Main Administrative Complex — VC Office, Registrar, Visitor Reception. Houses the Admissions Office, Library, Auditorium, and Admin Cafeteria.',
    landmarkDescription: 'Grand pillared entrance facing the North Promenade.',
    imageUrl: '/images/venues/admin-block-entrance-0.jpg',
    heroImage: '/images/venues/admin-block-entrance-0.jpg',
    photos: [
      '/images/venues/admin-block-entrance-0.jpg',
      '/images/venues/admin-block-entrance-1.jpg'
    ],
    isAccessible: true,
    wheelchairAccessible: true,
    accessibilityDetails: { hasWheelchairRamp: true, hasElevator: true, hasAccessibleEntrance: true, hasAccessibleToilet: true },
    phone: '08031233100',
    email: 'info@chanakyauniversity.edu.in',
    officialLink: 'https://chanakyauniversity.edu.in/contact-us/',
    openingHours: '8:30 AM - 6:00 PM',
    tags: ['Administration', 'VC Office', 'Registrar', 'Reception'],
    keywords: ['admin', 'administration', 'vc office', 'registrar', 'principal', 'reception', 'visitor'],
    synonyms: ['admin block', 'administrative block', 'main block'],
    collections: ['first-time-visitor', 'admissions-tour'],
    connectedVenueIds: ['v-admis-room-01', 'v-lib-01', 'v-audi-01', 'v-admin-cafe-01'],
    priority: 10,
    searchPopularityScore: 98,
    estimatedVisitTime: '20-30 min',
  },

  // ==================== ADMISSIONS & FEE PAYMENT ====================
  {
    id: 'v-admis-room-01',
    name: 'Admissions & Fee Payment',
    code: 'ND-ADMIS-02',
    category: 'ADMISSION',
    subcategory: 'Admissions Office',
    status: 'OPEN',
    buildingName: 'Dr. Sita Ram Jindal Administrative Block',
    buildingId: 'bldg-admin-01',
    floor: 0,
    floorName: 'Ground Floor',
    roomNumber: 'Room G-02',
    coordinate: { lat: 13.222065, lng: 77.755373 },
    entranceCoordinate: { lat: 13.222065, lng: 77.755373 },
    description: 'KCET physical reporting counter, fee collection, document verification, course registration, and scholarship helpdesk — Room G-02, Ground Floor.',
    landmarkDescription: 'Enter main glass entrance, turn right — "Admissions" counter straight ahead.',
    imageUrl: '/images/venues/admissions-room-g02.jpg',
    heroImage: '/images/venues/admissions-room-g02.jpg',
    photos: [
      '/images/venues/admissions-room-g02.jpg',
      '/images/venues/admissions-entrance.jpg'
    ],
    isAccessible: true,
    phone: '08031233133',
    email: 'admissions@chanakyauniversity.edu.in',
    openingHours: '9:00 AM - 5:30 PM (Mon-Sat)',
    tags: ['Admissions', 'Fee Payment', 'KCET', 'Scholarship'],
    keywords: ['admissions', 'fee', 'payment', 'kcet', 'scholarship', 'joining', 'reporting', 'document', 'course registration', 'van fee'],
    synonyms: ['admission office', 'admissions counter', 'fee payment', 'admissions room', 'reporting office'],
    collections: ['admissions-tour', 'first-time-visitor'],
    connectedVenueIds: ['v-admin-block-01'],
    priority: 10,
    searchPopularityScore: 99,
    estimatedVisitTime: '15-45 min',
  },

  // ==================== MAIN GATE IN ====================
  {
    id: 'v-gate-in',
    name: 'Main Gate IN (Entry)',
    code: 'ND-GATE-IN',
    category: 'SERVICES',
    subcategory: 'Campus Security Entrance',
    status: 'OPEN',
    buildingName: 'Chanakya Main Security Gate Plaza',
    floor: 0,
    floorName: 'Ground Level Entrance',
    roomNumber: 'Gate IN',
    coordinate: { lat: 13.220265, lng: 77.754062 },
    entranceCoordinate: { lat: 13.220265, lng: 77.754062 },
    description: 'Primary campus entry gate for visitors, staff, students, and vehicles arriving at Chanakya University.',
    landmarkDescription: 'Main University Entry Arch on Chanakya University Main Road.',
    imageUrl: '/images/venues/gate5-entrance-0.jpg',
    heroImage: '/images/venues/gate5-entrance-0.jpg',
    photos: [
      '/images/venues/gate5-entrance-0.jpg',
      '/images/venues/gate5-entrance-1.jpg'
    ],
    isAccessible: true,
    openingHours: '24 Hours',
    tags: ['Gate', 'Entry', 'Security', 'Main Gate'],
    keywords: ['gate', 'gate in', 'entry', 'main gate', 'security', 'entrance', 'visitor pass'],
    synonyms: ['main gate in', 'entry gate', 'campus entrance', 'security gate'],
    connectedVenueIds: ['v-gate-05', 'v-admin-block-01'],
    priority: 10,
    searchPopularityScore: 99,
  },

  // ==================== MAIN GATE OUT ====================
  {
    id: 'v-gate-out',
    name: 'Main Gate OUT (Exit)',
    code: 'ND-GATE-OUT',
    category: 'SERVICES',
    subcategory: 'Campus Security Exit',
    status: 'OPEN',
    buildingName: 'Chanakya Main Security Gate Plaza',
    floor: 0,
    floorName: 'Ground Level Exit',
    roomNumber: 'Gate OUT',
    coordinate: { lat: 13.220195, lng: 77.754191 },
    entranceCoordinate: { lat: 13.220195, lng: 77.754191 },
    description: 'Main exit gate for vehicles and pedestrians exiting Chanakya University campus onto Main Road.',
    landmarkDescription: 'Main University Exit Lane leading to NH-648 main road.',
    imageUrl: '/images/venues/gate5-entrance-1.jpg',
    heroImage: '/images/venues/gate5-entrance-1.jpg',
    photos: [
      '/images/venues/gate5-entrance-1.jpg'
    ],
    isAccessible: true,
    openingHours: '24 Hours',
    tags: ['Gate', 'Exit', 'Security'],
    keywords: ['gate out', 'exit', 'out gate', 'exit lane', 'leaving campus'],
    synonyms: ['main gate out', 'exit gate', 'campus exit'],
    connectedVenueIds: ['v-gate-in'],
    priority: 8,
    searchPopularityScore: 90,
  },

  // ==================== GATE 5 PROMENADE ENTRANCE ====================
  {
    id: 'v-gate-05',
    name: 'Gate 5 Entrance',
    code: 'ND-GATE-05',
    category: 'SERVICES',
    subcategory: 'Promenade Security Checkpoint',
    status: 'OPEN',
    buildingName: 'Admin Promenade Plaza',
    floor: 0,
    floorName: 'Ground Level Entrance',
    roomNumber: 'Gate 5',
    coordinate: { lat: 13.221360, lng: 77.755170 },
    entranceCoordinate: { lat: 13.221360, lng: 77.755170 },
    description: 'Security entrance checkpoint leading into the Administrative Block promenade & central campus quadrangle.',
    landmarkDescription: 'Gate 5 entrance directly facing the central circular promenade.',
    imageUrl: '/images/venues/gate5-entrance-0.jpg',
    heroImage: '/images/venues/gate5-entrance-0.jpg',
    photos: [
      '/images/venues/gate5-entrance-0.jpg',
      '/images/venues/gate5-entrance-1.jpg'
    ],
    isAccessible: true,
    openingHours: '24 Hours',
    tags: ['Gate 5', 'Entrance', 'Promenade', 'Security'],
    keywords: ['gate 5', 'gate 5 entrance', 'promenade entrance', 'admin gate', 'security checkpoint'],
    synonyms: ['gate 5', 'gate 5 entrance', 'promenade gate'],
    connectedVenueIds: ['v-admin-block-01', 'v-admis-room-01'],
    priority: 10,
    searchPopularityScore: 96,
  },

  // ==================== ADMIN BLOCK CAFETERIA ====================
  {
    id: 'v-admin-cafe-01',
    name: 'Admin Block Cafeteria',
    code: 'ADMIN-CAFE',
    category: 'CAFETERIA',
    subcategory: 'Refreshment Desk',
    status: 'OPEN',
    buildingName: 'Dr. Sita Ram Jindal Administrative Block',
    buildingId: 'bldg-admin-01',
    floor: 0,
    floorName: 'Ground Floor — West Wing',
    roomNumber: 'West Wing',
    coordinate: { lat: 13.222416, lng: 77.755249 },
    entranceCoordinate: { lat: 13.222416, lng: 77.755249 },
    description: 'Refreshment desk inside the Admin Block — coffee, fresh juices, sandwiches, tea, and snacks for visitors and staff.',
    landmarkDescription: 'West wing of Admin Block ground floor. Follow the cafeteria signboards from the main foyer.',
    imageUrl: '/images/placeholders/building.svg',
    heroImage: '/images/placeholders/building.svg',
    photos: ['/images/placeholders/building.svg'],
    isAccessible: true,
    openingHours: '8:30 AM - 6:00 PM',
    tags: ['Cafeteria', 'Coffee', 'Snacks'],
    keywords: ['cafeteria', 'admin cafe', 'coffee', 'snacks', 'tea', 'juice', 'admin block cafe'],
    synonyms: ['admin cafeteria', 'admin block cafe', 'staff canteen'],
    connectedVenueIds: ['v-admin-block-01'],
    priority: 7,
    searchPopularityScore: 75,
  },

  // ==================== LIBRARY ====================
  {
    id: 'v-lib-01',
    name: 'Central University Library',
    code: 'ND-LIB-05',
    category: 'LIBRARY',
    subcategory: 'Knowledge Resource Center',
    status: 'OPEN',
    buildingName: 'Dr. Sita Ram Jindal Administrative Block',
    buildingId: 'bldg-admin-01',
    floor: 0,
    floorName: 'Ground Floor & 1st Floor — East Wing',
    roomNumber: 'East Wing',
    coordinate: { lat: 13.222032, lng: 77.755417 },
    entranceCoordinate: { lat: 13.222032, lng: 77.755417 },
    description: '50,000+ printed volumes, digital research catalog terminals, quiet study pods, periodicals, and research archives. Open late for students.',
    landmarkDescription: 'East wing of Admin Block — glass-panelled library doors with the "Library" signboard above.',
    imageUrl: '/images/placeholders/building.svg',
    heroImage: '/images/placeholders/building.svg',
    photos: ['/images/placeholders/building.svg'],
    isAccessible: true,
    openingHours: '8:00 AM - 10:00 PM',
    tags: ['Library', 'Books', 'Study', 'Research'],
    keywords: ['library', 'books', 'study', 'reading', 'research', 'journals', 'reference', 'knowledge', 'reading room'],
    synonyms: ['central library', 'knowledge hub', 'reading room', 'book room'],
    connectedVenueIds: ['v-admin-block-01'],
    priority: 9,
    searchPopularityScore: 88,
  },

  // ==================== AUDITORIUM ====================
  {
    id: 'v-audi-01',
    name: 'Dr. K. Kasturirangan Auditorium',
    code: 'ND-AUDI-07',
    category: 'EVENTS',
    subcategory: 'Auditorium',
    status: 'OPEN',
    buildingName: 'Dr. Sita Ram Jindal Administrative Block',
    buildingId: 'bldg-admin-01',
    floor: 0,
    floorName: 'Ground Floor — East Wing',
    roomNumber: 'Hall A (300 Seats)',
    coordinate: { lat: 13.222061, lng: 77.755369 },
    entranceCoordinate: { lat: 13.222061, lng: 77.755369 },
    description: '300-seat acoustics auditorium for conferences, cultural programs, guest lectures, and orientation sessions.',
    landmarkDescription: 'Double wooden doors on the east wing of Admin Block — "Auditorium" signboard above the entrance.',
    imageUrl: '/images/placeholders/building.svg',
    heroImage: '/images/placeholders/building.svg',
    photos: ['/images/placeholders/building.svg'],
    isAccessible: true,
    openingHours: '9:00 AM - 9:00 PM',
    tags: ['Auditorium', 'Events', 'Conference', 'Cultural'],
    keywords: ['auditorium', 'hall', 'conference', 'event', 'cultural', 'orientation', 'seminar', 'lecture hall'],
    synonyms: ['kasturirangan auditorium', 'main hall', 'conference hall', 'audi'],
    connectedVenueIds: ['v-admin-block-01'],
    priority: 8,
    searchPopularityScore: 80,
  },

  // ==================== ACADEMIC BLOCK 2 ====================
  {
    id: 'v-acad-02',
    name: 'Academic Block 2',
    code: 'AB-02',
    category: 'ACADEMIC',
    subcategory: 'Teaching & Research',
    status: 'OPEN',
    buildingName: 'Sudha & Kris Gopalakrishnan Academic Block',
    buildingId: 'bldg-acad-02',
    floor: 0,
    floorName: 'Ground Floor',
    coordinate: { lat: 13.223344, lng: 77.755987 },
    entranceCoordinate: { lat: 13.223344, lng: 77.755987 },
    description: 'Engineering & computer science labs, smart audio-visual lecture halls, faculty rooms, and HPC centre. Houses 6 Schools and 70+ classrooms.',
    landmarkDescription: 'Large academic building directly north-east of the Admin Block.',
    imageUrl: '/images/placeholders/building.svg',
    heroImage: '/images/placeholders/building.svg',
    photos: ['/images/placeholders/building.svg'],
    isAccessible: true,
    openingHours: '8:00 AM - 8:00 PM',
    tags: ['Academic', 'Labs', 'Classrooms', 'Faculty'],
    keywords: ['academic', 'labs', 'lecture', 'engineering', 'computer science', 'classrooms', 'faculty', 'school', 'mca', 'mba', 'btech', 'department'],
    synonyms: ['acad block', 'academic block 2', 'ab2', 'engineering block', 'lab block'],
    collections: ['first-time-visitor'],
    connectedVenueIds: ['v-admin-block-01', 'v-food-01'],
    priority: 9,
    searchPopularityScore: 90,
  },

  // ==================== FOOD COURT ====================
  {
    id: 'v-food-01',
    name: 'Food Court & Dining Plaza',
    code: 'ND-DIN-09',
    category: 'CAFETERIA',
    subcategory: 'Main Dining',
    status: 'OPEN',
    buildingName: 'Chanakya Dining Complex',
    buildingId: 'bldg-food-04',
    floor: 0,
    floorName: 'Ground Floor',
    coordinate: { lat: 13.224806, lng: 77.757239 },
    entranceCoordinate: { lat: 13.224806, lng: 77.757239 },
    description: 'Multi-cuisine vegetarian dining hall, fresh juice counter, bakery, and outdoor garden seating.',
    landmarkDescription: 'Standalone dining building near the sports complex. Largest eating area on campus.',
    imageUrl: '/images/placeholders/building.svg',
    heroImage: '/images/placeholders/building.svg',
    photos: ['/images/placeholders/building.svg'],
    isAccessible: true,
    openingHours: '7:30 AM - 9:30 PM',
    tags: ['Food', 'Dining', 'Cafeteria'],
    keywords: ['food', 'eat', 'lunch', 'dinner', 'breakfast', 'cafe', 'canteen', 'dining', 'snacks', 'juice', 'bakery', 'hungry', 'mess'],
    synonyms: ['food court', 'canteen', 'mess', 'dining hall', 'cafeteria'],
    collections: ['first-time-visitor'],
    connectedVenueIds: ['v-sports-complex', 'v-hostel-01'],
    priority: 9,
    searchPopularityScore: 95,
  },

  // ==================== INDOOR SPORTS COMPLEX ====================
  {
    id: 'v-sports-complex',
    name: 'Indoor Sports Complex',
    code: 'ND-SPORTS-01',
    category: 'SPORTS',
    subcategory: 'Indoor Sports',
    status: 'OPEN',
    buildingName: 'Chanakya Indoor Sports Complex',
    floor: 0,
    floorName: 'Ground Floor',
    coordinate: { lat: 13.224700, lng: 77.757200 },
    entranceCoordinate: { lat: 13.224684, lng: 77.757135 },
    description: 'Indoor Sports Complex with Badminton Courts, Gymnasium & Fitness Center, and Kabaddi Court.',
    landmarkDescription: 'Sports Complex building — directly north of the Food Court.',
    imageUrl: '/images/placeholders/building.svg',
    heroImage: '/images/placeholders/building.svg',
    photos: ['/images/placeholders/building.svg'],
    isAccessible: true,
    openingHours: '6:00 AM - 9:00 PM',
    tags: ['Sports', 'Fitness', 'Badminton', 'Gym', 'Kabaddi'],
    keywords: ['sports', 'badminton', 'gym', 'fitness', 'kabaddi', 'exercise', 'workout', 'indoor sports'],
    synonyms: ['sports complex', 'gymnasium', 'sports hall', 'indoor courts', 'indoor sports'],
    collections: ['first-time-visitor'],
    connectedVenueIds: ['v-food-01', 'v-hostel-01'],
    priority: 7,
    searchPopularityScore: 82,
    subVenues: [
      {
        id: 'v-sports-badminton-indoor',
        name: 'Indoor Badminton Court',
        code: 'ND-SPORTS-BDM',
        roomNumber: 'Court 1-3',
        floor: 0,
        floorName: 'Ground Floor',
        description: 'Wooden floor indoor badminton courts with equipment rental desk.',
        openingHours: '6:00 AM - 8:30 PM',
      },
      {
        id: 'v-sports-gym',
        name: 'Campus Gymnasium & Fitness Center',
        code: 'ND-SPORTS-GYM',
        roomNumber: 'Gym Wing',
        floor: 0,
        floorName: 'Ground Floor — Gym Wing',
        description: 'Cardiovascular workout area, free weights, resistance machines, and certified trainers.',
        openingHours: '6:00 AM - 9:00 PM',
      },
      {
        id: 'v-sports-kabaddi',
        name: 'Indoor Kabaddi Court',
        code: 'ND-SPORTS-KBD',
        roomNumber: 'East Wing',
        floor: 0,
        floorName: 'Ground Floor — East Wing',
        description: 'Synthetic mat indoor Kabaddi arena with spectator seating.',
        openingHours: '6:00 AM - 8:30 PM',
      },
    ],
  },

  // ==================== CRICKET STADIUM ====================
  {
    id: 'v-sports-cricket',
    name: 'Cricket Stadium',
    code: 'ND-SPORTS-CRK',
    category: 'SPORTS',
    subcategory: 'Outdoor Sports',
    status: 'OPEN',
    buildingName: 'Outdoor Athletic Grounds',
    floor: 0,
    floorName: 'Outdoor — No Floor',
    coordinate: { lat: 13.228536, lng: 77.757782 },
    entranceCoordinate: { lat: 13.228536, lng: 77.757782 },
    description: 'Full-size turf cricket pitch with 400m synthetic running track.',
    landmarkDescription: 'North-East outdoor sports grounds — large open cricket field.',
    imageUrl: '/images/placeholders/building.svg',
    heroImage: '/images/placeholders/building.svg',
    photos: ['/images/placeholders/building.svg'],
    isAccessible: true,
    openingHours: '6:00 AM - 7:00 PM',
    tags: ['Cricket', 'Athletics', 'Track'],
    keywords: ['cricket', 'athletics', 'track', 'running', 'field', 'ground', 'pitch'],
    synonyms: ['cricket ground', 'cricket pitch', 'athletics track'],
    connectedVenueIds: ['v-sports-basketball', 'v-sports-tennis', 'v-sports-badminton-out'],
    priority: 6,
    searchPopularityScore: 70,
  },

  // ==================== BASKETBALL COURT (OUTDOOR) ====================
  {
    id: 'v-sports-basketball',
    name: 'Basketball Court',
    code: 'ND-SPORTS-BBL',
    category: 'SPORTS',
    subcategory: 'Outdoor Sports',
    status: 'OPEN',
    buildingName: 'Outdoor Athletic Grounds',
    floor: 0,
    floorName: 'Outdoor — No Floor',
    coordinate: { lat: 13.228817, lng: 77.758178 },
    entranceCoordinate: { lat: 13.228817, lng: 77.758178 },
    description: 'Outdoor basketball court with floodlights for evening play.',
    landmarkDescription: 'Outdoor courts area — north-east of campus near the cricket grounds.',
    imageUrl: '/images/placeholders/building.svg',
    heroImage: '/images/placeholders/building.svg',
    photos: ['/images/placeholders/building.svg'],
    isAccessible: true,
    openingHours: '6:00 AM - 7:00 PM',
    tags: ['Basketball', 'Outdoor Sports'],
    keywords: ['basketball', 'basketball court', 'outdoor court', 'hoop', 'ball'],
    synonyms: ['basketball court', 'basketball ground'],
    connectedVenueIds: ['v-sports-cricket', 'v-sports-tennis'],
    priority: 5,
    searchPopularityScore: 65,
  },

  // ==================== OUTDOOR BADMINTON ====================
  {
    id: 'v-sports-badminton-out',
    name: 'Outdoor Badminton Courts',
    code: 'ND-SPORTS-BDM-OUT',
    category: 'SPORTS',
    subcategory: 'Outdoor Sports',
    status: 'OPEN',
    buildingName: 'Outdoor Athletic Grounds',
    floor: 0,
    floorName: 'Outdoor — No Floor',
    coordinate: { lat: 13.228712, lng: 77.758609 },
    entranceCoordinate: { lat: 13.228712, lng: 77.758609 },
    description: 'Outdoor badminton courts — bring your own rackets and shuttlecock.',
    landmarkDescription: 'Outdoor courts area — near tennis courts.',
    imageUrl: '/images/placeholders/building.svg',
    heroImage: '/images/placeholders/building.svg',
    photos: ['/images/placeholders/building.svg'],
    isAccessible: true,
    openingHours: '6:00 AM - 7:00 PM',
    tags: ['Badminton', 'Outdoor Sports'],
    keywords: ['badminton outdoor', 'badminton court', 'outdoor badminton', 'shuttlecock'],
    synonyms: ['outdoor badminton', 'badminton courts'],
    connectedVenueIds: ['v-sports-cricket', 'v-sports-tennis'],
    priority: 5,
    searchPopularityScore: 60,
  },

  // ==================== TENNIS COURT ====================
  {
    id: 'v-sports-tennis',
    name: 'Tennis Court',
    code: 'ND-SPORTS-TNS',
    category: 'SPORTS',
    subcategory: 'Outdoor Sports',
    status: 'OPEN',
    buildingName: 'Outdoor Athletic Grounds',
    floor: 0,
    floorName: 'Outdoor — No Floor',
    coordinate: { lat: 13.228465, lng: 77.758441 },
    entranceCoordinate: { lat: 13.228465, lng: 77.758441 },
    description: 'Hard-surface tennis courts with net and proper line markings.',
    landmarkDescription: 'Outdoor courts area — between basketball and outdoor badminton.',
    imageUrl: '/images/placeholders/building.svg',
    heroImage: '/images/placeholders/building.svg',
    photos: ['/images/placeholders/building.svg'],
    isAccessible: true,
    openingHours: '6:00 AM - 7:00 PM',
    tags: ['Tennis', 'Outdoor Sports'],
    keywords: ['tennis', 'tennis court', 'outdoor', 'racket'],
    synonyms: ['tennis court', 'tennis ground'],
    connectedVenueIds: ['v-sports-cricket', 'v-sports-basketball'],
    priority: 5,
    searchPopularityScore: 62,
  },

  // ==================== STUDENT HOSTELS ====================
  {
    id: 'v-hostel-01',
    name: 'Student Hostels',
    code: 'ND-HOST-01',
    category: 'HOSTEL',
    subcategory: 'Student Residential',
    status: 'OPEN',
    buildingName: 'Smt. Vidya Devi Jindal Hostel Block',
    buildingId: 'bldg-hostel-03',
    floor: 0,
    floorName: 'Ground Floor',
    coordinate: { lat: 13.224615, lng: 77.758824 },
    entranceCoordinate: { lat: 13.224615, lng: 77.758824 },
    description: 'Separate Girls & Boys Hostel Blocks — biometric entry, warden office, study lounges, and visitor reception.',
    landmarkDescription: 'East Residential Quadrangle — follow signs from the Food Court.',
    imageUrl: '/images/placeholders/building.svg',
    heroImage: '/images/placeholders/building.svg',
    photos: ['/images/placeholders/building.svg'],
    isAccessible: true,
    openingHours: '24 Hours (Residents) · Visitors: 9 AM – 7 PM',
    tags: ['Hostel', 'Residential', 'Housing'],
    keywords: ['hostel', 'residence', 'accommodation', 'dormitory', 'stay', 'room', 'housing', 'boys hostel', 'girls hostel', 'warden'],
    synonyms: ['hostel', 'dorm', 'residential block', 'girls hostel', 'boys hostel'],
    connectedVenueIds: ['v-clinic-01', 'v-shop-01', 'v-food-01'],
    priority: 8,
    searchPopularityScore: 88,
  },

  // ==================== HEALTH CLINIC ====================
  {
    id: 'v-clinic-01',
    name: 'Health Clinic',
    code: 'ND-MED-01',
    category: 'MEDICAL',
    subcategory: 'Medical Services',
    status: 'OPEN',
    buildingName: 'Campus Health Clinic',
    floor: 0,
    floorName: 'Ground Floor',
    coordinate: { lat: 13.224583, lng: 77.759046 },
    entranceCoordinate: { lat: 13.224583, lng: 77.759046 },
    description: '24/7 resident medical doctor, emergency first aid, ambulance, basic diagnostics, and pharmacy.',
    landmarkDescription: 'Next to the Student Hostels — look for the green medical cross sign.',
    imageUrl: '/images/placeholders/building.svg',
    heroImage: '/images/placeholders/building.svg',
    photos: ['/images/placeholders/building.svg'],
    isAccessible: true,
    phone: '08031233999',
    openingHours: '24 Hours — Emergency Service',
    tags: ['Medical', 'Emergency', 'Healthcare'],
    keywords: ['doctor', 'medical', 'clinic', 'health', 'first aid', 'pharmacy', 'ambulance', 'nurse', 'emergency', 'sick', 'hospital'],
    synonyms: ['health center', 'medical room', 'sick bay', 'infirmary', 'dispensary', 'small hospital'],
    connectedVenueIds: ['v-hostel-01'],
    priority: 9,
    searchPopularityScore: 86,
  },

  // ==================== MINI MART ====================
  {
    id: 'v-shop-01',
    name: 'Mini Mart by Metro Enterprises',
    code: 'ND-SHOP-01',
    category: 'CAFETERIA',
    subcategory: 'Campus Store',
    status: 'OPEN',
    buildingName: 'Campus Residential Complex',
    floor: 0,
    floorName: 'Ground Floor',
    roomNumber: 'Shop 01',
    coordinate: { lat: 13.224535, lng: 77.759150 },
    entranceCoordinate: { lat: 13.224535, lng: 77.759150 },
    description: 'Daily essential groceries, snacks, stationery, printing, photocopying, and personal care supplies.',
    landmarkDescription: 'Near the Hostel entrance plaza — yellow signboard "Mini Mart by Metro".',
    imageUrl: '/images/placeholders/building.svg',
    heroImage: '/images/placeholders/building.svg',
    photos: ['/images/placeholders/building.svg'],
    isAccessible: true,
    openingHours: '8:00 AM - 9:30 PM',
    tags: ['Shopping', 'Convenience', 'Printing'],
    keywords: ['shop', 'store', 'groceries', 'stationery', 'printing', 'snacks', 'essentials', 'mart', 'photostat', 'xerox', 'metro', 'copy'],
    synonyms: ['mini mart', 'campus store', 'xerox', 'printing shop', 'metro enterprises'],
    connectedVenueIds: ['v-hostel-01', 'v-clinic-01'],
    priority: 6,
    searchPopularityScore: 72,
  },
];

/** Helper — find a venue by any of its sub-venue IDs */
export function findVenueBySubId(subId: string): Venue | undefined {
  for (const v of mockVenues) {
    if (v.id === subId) return v;
    if (v.subVenues?.some((s) => s.id === subId)) return v;
  }
  return undefined;
}

export class VenueRepository {
  static async getAllVenues(): Promise<Venue[]> {
    try {
      const res = await fetch('/api/venues');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) return json.data;
      }
    } catch {
      console.warn('API fetch failed. Using local mockVenues cache.');
    }
    return mockVenues;
  }

  static async getVenueById(id: string): Promise<Venue | undefined> {
    const venues = await this.getAllVenues();
    return venues.find((v) => v.id === id);
  }

  static async getVenuesByCategory(category: VenueCategory): Promise<Venue[]> {
    try {
      const res = await fetch(`/api/venues?category=${category}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) return json.data;
      }
    } catch {
      console.warn('API category fetch failed. Filtering local cache.');
    }
    return mockVenues.filter((v) => v.category === category);
  }

  static async getBuildingPolygons(): Promise<BuildingPolygon[]> {
    try {
      const res = await fetch('/api/buildings');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) return json.data;
      }
    } catch {
      console.warn('API buildings fetch failed. Using local buildingPolygons.');
    }
    return buildingPolygons;
  }
}
