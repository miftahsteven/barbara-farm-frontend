import { NextRequest, NextResponse } from 'next/server';

// Server-side proxy for public cattle data.
// This runs on the Next.js server which can always reach localhost:3001,
// solving the problem of mobile clients not being able to reach localhost.
// The backend GET /cattle/:id endpoint is public (no auth required).

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Robustly decode parameter (handles single/double encoding)
  let decodedId = id;
  try {
    decodedId = decodeURIComponent(id);
    if (decodedId.includes('%')) {
      decodedId = decodeURIComponent(decodedId);
    }
  } catch (e) {
    console.error('[Public Cattle Proxy] URL decode failed for ID:', id);
  }

  try {
    const response = await fetch(`${BACKEND_URL}/cattle/${encodeURIComponent(decodedId)}`, {
      cache: 'no-store',
    });

    if (response.status === 404) {
      return NextResponse.json(
        { error: 'not_found', message: 'Sapi tidak ditemukan.' },
        { status: 404 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: 'server_error', message: 'Gagal mengambil data sapi.' },
        { status: 502 }
      );
    }

    const data = await response.json();

    // Only return safe public fields — never expose financial or investor data.
    const latestWeight = Array.isArray(data.growthLogs) && data.growthLogs.length > 0
      ? data.growthLogs[0].weightKg
      : null;

    const publicData = {
      id: data.id,
      name: data.name,
      breed: data.breed,
      gender: data.gender,
      status: data.status,
      pen: data.pen,
      photoUrl: data.photoUrl,
      initialWeightKg: data.initialWeightKg,
      latestWeightKg: latestWeight,
      notes: data.notes,
      updatedAt: data.updatedAt,
      createdAt: data.createdAt,
    };

    return NextResponse.json(publicData);
  } catch (error: any) {
    console.error('[Public Cattle Proxy] Fetch failed:', error?.message);
    return NextResponse.json(
      { error: 'network_error', message: 'Tidak dapat menghubungi server.' },
      { status: 503 }
    );
  }
}

