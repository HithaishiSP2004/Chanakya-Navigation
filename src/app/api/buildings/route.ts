import { NextResponse } from 'next/server';
import buildingPolygonsData from '@/gis/building-polygons.json';

export async function GET() {
  const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8000/api/v1/buildings/';

  try {
    const res = await fetch(backendUrl, { next: { revalidate: 300 } });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.warn('Backend API unavailable. Falling back to local cached GIS JSON.');
  }

  // Graceful fallback to cached local GIS JSON
  return NextResponse.json({
    success: true,
    message: 'Local Cached GIS Fallback',
    data: buildingPolygonsData,
  });
}
