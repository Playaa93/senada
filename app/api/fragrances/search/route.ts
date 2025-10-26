import { NextRequest, NextResponse } from 'next/server';

const WORKER_URL = process.env['WORKER_URL'] || 'http://localhost:8787';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = searchParams.get('limit') || '10';

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    // Forward request to Cloudflare Worker
    const workerUrl = new URL('/api/fragrances/search', WORKER_URL);
    workerUrl.searchParams.set('q', query);
    workerUrl.searchParams.set('limit', limit);

    const response = await fetch(workerUrl.toString());

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      return NextResponse.json(
        { success: false, error: errorData.error || 'Search failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Fragrance search error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
