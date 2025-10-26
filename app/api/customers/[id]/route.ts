import { NextRequest, NextResponse } from 'next/server';

const WORKER_URL = process.env['WORKER_URL'] || 'http://localhost:8787';

/**
 * GET /api/customers/[id] - Get a single customer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workerUrl = new URL(`/api/customers/${id}`, WORKER_URL);
    const response = await fetch(workerUrl.toString());

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch customer' }));
      return NextResponse.json(
        { success: false, error: errorData.error || 'Client introuvable' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/customers/[id] - Update a customer
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const workerUrl = new URL(`/api/customers/${id}`, WORKER_URL);
    const response = await fetch(workerUrl.toString(), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to update customer' }));
      return NextResponse.json(
        { success: false, error: errorData.error || 'Échec de la mise à jour du client' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/customers/[id] - Delete a customer
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workerUrl = new URL(`/api/customers/${id}`, WORKER_URL);
    const response = await fetch(workerUrl.toString(), {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to delete customer' }));
      return NextResponse.json(
        { success: false, error: errorData.error || 'Échec de la suppression du client' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: 'Client supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
