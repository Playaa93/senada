import { NextRequest, NextResponse } from 'next/server';

const WORKER_URL = process.env['WORKER_URL'] || 'http://localhost:8787';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Forward request to Cloudflare Worker
    const workerUrl = new URL(`/api/fragrances/${id}`, WORKER_URL);
    const response = await fetch(workerUrl.toString());

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      return NextResponse.json(
        { success: false, error: errorData.error || 'Fragrance not found' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Fragrance fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
