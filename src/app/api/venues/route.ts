import { NextResponse } from 'next/server';
import { mockVenues } from '@/repositories/venueRepository';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const query = searchParams.get('q');

  const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8000/api/v1/venues/';

  try {
    const url = new URL(backendUrl);
    if (category) url.searchParams.set('category', category);
    if (query) url.searchParams.set('q', query);

    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.warn('Backend API unavailable. Falling back to local cached Venues repository.');
  }

  // Fallback to local venues filtering
  let filtered = mockVenues;
  if (category && category !== 'ALL') {
    filtered = filtered.filter((v) => v.category === category);
  }
  if (query) {
    const qLower = query.toLowerCase();
    filtered = filtered.filter(
      (v) =>
        v.name.toLowerCase().includes(qLower) ||
        v.buildingName.toLowerCase().includes(qLower) ||
        v.code.toLowerCase().includes(qLower)
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Local Cached Venues Fallback',
    data: filtered,
  });
}
