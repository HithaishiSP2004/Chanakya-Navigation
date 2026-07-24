import { Venue } from '@/types/venue';
import synonymsData from '@/gis/synonyms.json';

const synonymMap: Record<string, string> = synonymsData;
const RECENT_SEARCHES_KEY = 'chanakya_recent_searches_v1';

export class SmartSearchEngine {
  /**
   * Filter and Rank Venues based on search query, category, and relevance score
   */
  public static search(
    query: string,
    category = 'ALL',
    venues: Venue[] = []
  ): Venue[] {
    const trimmed = query.trim().toLowerCase();

    if (!trimmed && category === 'ALL') {
      return [...venues].sort((a, b) => (b.priority || 0) - (a.priority || 0));
    }

    const matched: Array<{ venue: Venue; score: number }> = [];

    venues.forEach((venue) => {
      // Category filter check
      if (category !== 'ALL' && venue.category !== category) {
        return;
      }

      if (!trimmed) {
        matched.push({ venue, score: (venue.priority || 0) * 10 });
        return;
      }

      let score = 0;
      const nameLower = venue.name.toLowerCase();
      const codeLower = venue.code.toLowerCase();
      const bldgLower = venue.buildingName.toLowerCase();
      const descLower = venue.description.toLowerCase();
      const roomLower = (venue.roomNumber || '').toLowerCase();

      // Tier 1: Exact / Prefix Name & Room Code Match (Highest score)
      if (nameLower === trimmed) score += 100;
      else if (nameLower.startsWith(trimmed)) score += 80;
      else if (nameLower.includes(trimmed)) score += 60;

      if (roomLower && roomLower.includes(trimmed)) score += 75;
      if (codeLower && codeLower.includes(trimmed)) score += 70;

      // Tier 2: Building Name match
      if (bldgLower.includes(trimmed)) score += 50;

      // Tier 3: Synonym Lookup
      const synonymBldgId = synonymMap[trimmed];
      if (synonymBldgId && (venue.id.includes(synonymBldgId) || venue.buildingId === synonymBldgId)) {
        score += 65;
      }
      if (venue.synonyms?.some((syn) => syn.toLowerCase().includes(trimmed))) {
        score += 55;
      }

      // Tier 4: Keywords & Tags
      if (venue.keywords?.some((kw) => kw.toLowerCase().includes(trimmed))) {
        score += 45;
      }
      if (venue.tags?.some((tg) => tg.toLowerCase().includes(trimmed))) {
        score += 40;
      }

      // Tier 5: Description match
      if (descLower.includes(trimmed)) score += 20;

      // Boost by popularity / priority
      if (score > 0) {
        score += (venue.priority || 0) * 2;
        score += (venue.searchPopularityScore || 0);
        matched.push({ venue, score });
      }
    });

    matched.sort((a, b) => b.score - a.score);
    return matched.map((item) => item.venue);
  }

  /**
   * Manage Recent Searches in localStorage
   */
  public static getRecentSearches(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public static addRecentSearch(query: string): void {
    if (typeof window === 'undefined' || !query.trim()) return;
    try {
      const current = this.getRecentSearches();
      const filtered = [query.trim(), ...current.filter((q) => q.toLowerCase() !== query.trim().toLowerCase())];
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered.slice(0, 5)));
    } catch (e) {
      console.warn('Failed to save recent search', e);
    }
  }

  public static clearRecentSearches(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  }
}
