import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/directions
 * Server-side proxy to Google Maps Directions API (walking mode).
 * Keeps the API key server-side so it is never exposed to the client browser.
 *
 * Query params:
 *   originLat, originLng — user GPS coordinates
 *   destLat, destLng     — destination coordinate
 *
 * Returns:
 *   { ok: true, polyline: Point2D[], distanceMeters: number, durationSeconds: number, steps: TurnStep[] }
 *   { ok: false, error: string } — on failure (client should fall back to internal Dijkstra)
 */

interface GoogleDirectionsStep {
  html_instructions: string;
  distance: { value: number };
  duration: { value: number };
  start_location: { lat: number; lng: number };
  end_location: { lat: number; lng: number };
  polyline: { points: string };
  maneuver?: string;
}

interface GoogleDirectionsLeg {
  distance: { value: number };
  duration: { value: number };
  steps: GoogleDirectionsStep[];
}

interface GoogleDirectionsRoute {
  legs: GoogleDirectionsLeg[];
  overview_polyline: { points: string };
}

interface GoogleDirectionsResponse {
  status: string;
  routes: GoogleDirectionsRoute[];
}

/** Decode Google Maps encoded polyline to lat/lng array */
function decodePolyline(encoded: string): { lat: number; lng: number }[] {
  const points: { lat: number; lng: number }[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}

/** Strip HTML tags from Google's html_instructions */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const originLat = searchParams.get('originLat');
  const originLng = searchParams.get('originLng');
  const destLat = searchParams.get('destLat');
  const destLng = searchParams.get('destLng');

  if (!originLat || !originLng || !destLat || !destLng) {
    return NextResponse.json({ ok: false, error: 'Missing coordinates' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'API key not configured' }, { status: 500 });
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
    url.searchParams.set('origin', `${originLat},${originLng}`);
    url.searchParams.set('destination', `${destLat},${destLng}`);
    url.searchParams.set('mode', 'walking');
    url.searchParams.set('key', apiKey);
    url.searchParams.set('units', 'metric');

    const res = await fetch(url.toString(), { next: { revalidate: 0 } });
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: 'Directions API request failed' }, { status: 502 });
    }

    const data: GoogleDirectionsResponse = await res.json();

    if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
      return NextResponse.json({ ok: false, error: `Directions API: ${data.status}` }, { status: 404 });
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    // Decode the detailed overview polyline for smooth path rendering
    const polyline = decodePolyline(route.overview_polyline.points);

    // Map Google steps to simplified turn instructions
    const steps = leg.steps.map((step, i) => ({
      stepIndex: i,
      text: stripHtml(step.html_instructions),
      distanceMeters: step.distance.value,
      durationSeconds: step.duration.value,
      location: { lat: step.start_location.lat, lng: step.start_location.lng },
      maneuver: step.maneuver || 'straight',
    }));

    return NextResponse.json({
      ok: true,
      polyline,
      distanceMeters: leg.distance.value,
      durationSeconds: leg.duration.value,
      steps,
    });
  } catch (err) {
    console.error('[Directions API] Error:', err);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
