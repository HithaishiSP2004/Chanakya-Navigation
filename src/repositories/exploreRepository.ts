import { ExploreCard } from '@/types/venue';

export const mockExploreCards: ExploreCard[] = [
  {
    id: 'coll-first-time',
    title: 'First Time Visitor Campus Tour',
    subtitle: 'Admin Block → Library → Food Court → Hostels',
    category: 'COLLECTIONS',
    collectionId: 'first-time-visitor',
    badgeText: 'Curated Tour',
    iconName: 'Compass',
    heroImage: '/images/placeholders/building.svg',
    description: 'Essential orientation walkthrough for prospective students, parents, and campus guests.',
    venueIds: ['v-admin-block-01', 'v-admis-room-01', 'v-lib-01', 'v-food-01'],
  },
  {
    id: 'coll-admissions-tour',
    title: 'Admissions & Joining Clearance Trail',
    subtitle: 'Main Gate → Admin Block (G-02 Counter)',
    category: 'COLLECTIONS',
    collectionId: 'admissions-tour',
    badgeText: 'Admissions Trail',
    iconName: 'FileCheck',
    heroImage: '/images/placeholders/building.svg',
    description: 'Step-by-step route for KCET physical reporting, document verification, and fee clearance.',
    venueId: 'v-admis-room-01',
    venueIds: ['v-admis-room-01', 'v-admin-block-01'],
    officialWebLink: 'https://chanakyauniversity.edu.in/admissions/'
  },
  {
    id: 'coll-sports-tour',
    title: 'Sports & Athletics Complex Trail',
    subtitle: 'Indoor Badminton → Gym → Cricket Field → Basketball',
    category: 'COLLECTIONS',
    collectionId: 'sports-tour',
    badgeText: 'Sports Tour',
    iconName: 'Building2',
    heroImage: '/images/placeholders/building.svg',
    description: 'Complete guide to wooden badminton courts, squash court, fitness center, synthetic basketball court, and cricket oval.',
    venueIds: ['v-sports-01', 'v-sports-04', 'v-sports-02', 'v-sports-03'],
  },
  {
    id: 'exp-about',
    title: 'About Chanakya University',
    subtitle: 'Global Campus, Devanahalli',
    category: 'ALL',
    iconName: 'Building2',
    heroImage: '/images/placeholders/building.svg',
    description: 'A world-class 116-acre sustainable net-zero university built near Bengaluru International Airport.',
    officialWebLink: 'https://chanakyauniversity.edu.in/about-us/'
  },
  {
    id: 'exp-schools',
    title: 'Academic Schools & Faculties',
    subtitle: '6 Multidisciplinary Schools',
    category: 'SCHOOLS',
    iconName: 'GraduationCap',
    heroImage: '/images/placeholders/building.svg',
    description: 'Explore programs across Engineering, Arts & Humanities, Management, Natural Sciences, Law, and Biosciences.',
    officialWebLink: 'https://chanakyauniversity.edu.in/schools/'
  },
  {
    id: 'exp-admissions',
    title: 'Admissions & Scholarships Office',
    subtitle: 'Dr. Sita Ram Jindal Admin Block G-02',
    category: 'FACILITIES',
    iconName: 'FileCheck',
    heroImage: '/images/placeholders/building.svg',
    description: 'Information for undergraduate, postgraduate, and doctoral admissions, KCET submissions, and fee clearances.',
    venueId: 'v-admis-room-01',
    officialWebLink: 'https://chanakyauniversity.edu.in/admissions/'
  },
  {
    id: 'exp-dining',
    title: 'Dining & Cafeterias',
    subtitle: 'Sri OP Jindal Food Court & Airtel Cafe',
    category: 'DINING',
    iconName: 'Utensils',
    heroImage: '/images/placeholders/building.svg',
    description: 'Daily vegetarian meal plans, fast casual cafeterias, hot beverages, and social meeting hubs.',
    venueId: 'v-food-01',
    officialWebLink: 'https://chanakyauniversity.edu.in/dining/'
  },
  {
    id: 'exp-hostels',
    title: 'Student Housing & Guest House',
    subtitle: 'Vidya Devi Jindal Hostel',
    category: 'HOSTELS',
    iconName: 'Home',
    heroImage: '/images/placeholders/building.svg',
    description: '24/7 secured student residences, visiting parent accommodations at Suman Nirmal Minda Guest House.',
    venueId: 'v-hostel-01',
    officialWebLink: 'https://chanakyauniversity.edu.in/hostels/'
  },
  {
    id: 'exp-emergency',
    title: 'Campus Emergency & Security',
    subtitle: '24/7 Medical & Security Desks',
    category: 'EMERGENCY',
    iconName: 'ShieldAlert',
    heroImage: '/images/placeholders/building.svg',
    description: 'Direct contact details for security posts, first aid medical room, and emergency helpline.',
    venueId: 'v-clinic-01',
    officialWebLink: 'https://chanakyauniversity.edu.in/contact-us/'
  }
];

export class ExploreRepository {
  static async getCardsByCategory(category: string): Promise<ExploreCard[]> {
    if (category === 'ALL') return mockExploreCards;
    return mockExploreCards.filter((c) => c.category === category);
  }
}
