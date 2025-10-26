import { NextRequest, NextResponse } from 'next/server';

const WORKER_URL = process.env['WORKER_URL'] || 'http://localhost:8787';

/**
 * POST /api/products - Create a new product
 * Transforms fragrance form data to match database schema
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.sku) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, sku' },
        { status: 400 }
      );
    }

    // Transform form data to match database schema
    const productData = {
      sku: body.sku,
      name: body.name,
      description: body.description || null,
      // Use brand as category for perfume products
      category: body.brand || 'perfume',
      // Use same price for both buy and sell price initially
      buyPrice: parseFloat(body.price) || 0,
      sellPrice: parseFloat(body.price) || 0,
      // Map quantity to currentStock
      currentStock: parseInt(body.quantity, 10) || 0,
      minStock: 0,
      supplierId: null,
      imageUrl: null,
    };

    // Validate prices
    if (productData.buyPrice < 0 || productData.sellPrice < 0) {
      return NextResponse.json(
        { success: false, error: 'Price cannot be negative' },
        { status: 400 }
      );
    }

    // Call Worker API
    const workerUrl = new URL('/api/products', WORKER_URL);
    const response = await fetch(workerUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to create product' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/products - List all products with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const workerUrl = new URL('/api/products', WORKER_URL);

    // Forward query parameters
    searchParams.forEach((value, key) => {
      workerUrl.searchParams.set(key, value);
    });

    const response = await fetch(workerUrl.toString());

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to fetch products' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
