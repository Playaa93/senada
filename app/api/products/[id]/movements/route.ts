import { NextRequest, NextResponse } from 'next/server';

const WORKER_URL = process.env['WORKER_URL'] || 'http://localhost:8787';

/**
 * POST /api/products/:id/movements - Create stock movement
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const workerUrl = new URL(`/api/products/${id}/movements`, WORKER_URL);
    const response = await fetch(workerUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to record stock movement' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error recording stock movement:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
