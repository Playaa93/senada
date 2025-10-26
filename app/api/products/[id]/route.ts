import { NextRequest, NextResponse } from 'next/server';

const WORKER_URL = process.env['WORKER_URL'] || 'http://localhost:8787';

/**
 * GET /api/products/:id - Get single product
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workerUrl = new URL(`/api/products/${id}`, WORKER_URL);
    const response = await fetch(workerUrl.toString());

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to fetch product' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products/:id - Update product
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const workerUrl = new URL(`/api/products/${id}`, WORKER_URL);
    const response = await fetch(workerUrl.toString(), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to update product' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/:id - Delete product
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workerUrl = new URL(`/api/products/${id}`, WORKER_URL);
    const response = await fetch(workerUrl.toString(), {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to delete product' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
