import { Hono } from 'hono';
import { eq, like, and, sql } from 'drizzle-orm';
import { products, stockMovements } from '../db/schema';
import type { DbClient, Env } from '../db/client';

const app = new Hono<{ Bindings: Env; Variables: { db: DbClient } }>();

/**
 * GET /api/products - List all products with optional filters
 */
app.get('/', async (c) => {
  try {
    const db = c.get('db');
    const { category, search, lowStock } = c.req.query();

    let query = db.select().from(products);

    // Apply filters
    const conditions = [];
    if (category) {
      conditions.push(eq(products.category, category));
    }
    if (search) {
      conditions.push(
        sql`(${products.name} LIKE ${`%${search}%`} OR ${products.sku} LIKE ${`%${search}%`})`
      );
    }
    if (lowStock === 'true') {
      conditions.push(sql`${products.currentStock} <= ${products.minStock}`);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;
    return c.json({ data: result, count: result.length });
  } catch (error) {
    console.error('Error fetching products:', error);
    return c.json({ error: 'Failed to fetch products' }, 500);
  }
});

/**
 * GET /api/products/:id - Get single product with stock history
 */
app.get('/:id', async (c) => {
  try {
    const db = c.get('db');
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json({ error: 'Invalid product ID' }, 400);
    }

    const [product] = await db.select().from(products).where(eq(products.id, id));

    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    // Get recent stock movements
    const movements = await db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.productId, id))
      .orderBy(sql`${stockMovements.createdAt} DESC`)
      .limit(10);

    return c.json({ data: { ...product, recentMovements: movements } });
  } catch (error) {
    console.error('Error fetching product:', error);
    return c.json({ error: 'Failed to fetch product' }, 500);
  }
});

/**
 * POST /api/products - Create new product
 */
app.post('/', async (c) => {
  try {
    const db = c.get('db');
    const body = await c.req.json();

    // Validation
    if (!body.sku || !body.name || !body.category || body.buyPrice === undefined || body.sellPrice === undefined) {
      return c.json({ error: 'Missing required fields: sku, name, category, buyPrice, sellPrice' }, 400);
    }

    if (body.buyPrice < 0 || body.sellPrice < 0) {
      return c.json({ error: 'Prices cannot be negative' }, 400);
    }

    if (body.sellPrice < body.buyPrice) {
      return c.json({ error: 'Sell price should be greater than or equal to buy price' }, 400);
    }

    const [newProduct] = await db
      .insert(products)
      .values({
        sku: body.sku,
        name: body.name,
        description: body.description || null,
        category: body.category,
        buyPrice: body.buyPrice,
        sellPrice: body.sellPrice,
        currentStock: body.currentStock || 0,
        minStock: body.minStock || 0,
        supplierId: body.supplierId || null,
        imageUrl: body.imageUrl || null,
      })
      .returning();

    return c.json({ data: newProduct, message: 'Product created successfully' }, 201);
  } catch (error: any) {
    console.error('Error creating product:', error);
    if (error.message?.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'Product SKU already exists' }, 409);
    }
    return c.json({ error: 'Failed to create product' }, 500);
  }
});

/**
 * PUT /api/products/:id - Update product
 */
app.put('/:id', async (c) => {
  try {
    const db = c.get('db');
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();

    if (isNaN(id)) {
      return c.json({ error: 'Invalid product ID' }, 400);
    }

    // Check if product exists
    const [existing] = await db.select().from(products).where(eq(products.id, id));
    if (!existing) {
      return c.json({ error: 'Product not found' }, 404);
    }

    // Validation
    if (body.buyPrice !== undefined && body.buyPrice < 0) {
      return c.json({ error: 'Buy price cannot be negative' }, 400);
    }
    if (body.sellPrice !== undefined && body.sellPrice < 0) {
      return c.json({ error: 'Sell price cannot be negative' }, 400);
    }

    const [updated] = await db
      .update(products)
      .set({
        ...body,
        updatedAt: sql`(unixepoch())`,
      })
      .where(eq(products.id, id))
      .returning();

    return c.json({ data: updated, message: 'Product updated successfully' });
  } catch (error: any) {
    console.error('Error updating product:', error);
    if (error.message?.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'Product SKU already exists' }, 409);
    }
    return c.json({ error: 'Failed to update product' }, 500);
  }
});

/**
 * DELETE /api/products/:id - Delete product
 */
app.delete('/:id', async (c) => {
  try {
    const db = c.get('db');
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json({ error: 'Invalid product ID' }, 400);
    }

    const [deleted] = await db.delete(products).where(eq(products.id, id)).returning();

    if (!deleted) {
      return c.json({ error: 'Product not found' }, 404);
    }

    return c.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return c.json({ error: 'Failed to delete product' }, 500);
  }
});

/**
 * GET /api/products/categories - Get all unique categories
 */
app.get('/meta/categories', async (c) => {
  try {
    const db = c.get('db');
    const result = await db
      .selectDistinct({ category: products.category })
      .from(products);

    return c.json({ data: result.map((r) => r.category) });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

/**
 * POST /api/products/:id/movements - Create stock movement (IN or OUT)
 */
app.post('/:id/movements', async (c) => {
  try {
    const db = c.get('db');
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();

    if (isNaN(id)) {
      return c.json({ error: 'Invalid product ID' }, 400);
    }

    // Validate request body
    if (!body.type || !['IN', 'OUT'].includes(body.type)) {
      return c.json({ error: 'Movement type must be IN or OUT' }, 400);
    }

    if (!body.quantity || body.quantity <= 0) {
      return c.json({ error: 'Quantity must be a positive number' }, 400);
    }

    // Check if product exists
    const [product] = await db.select().from(products).where(eq(products.id, id));
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    // Calculate new stock
    const previousStock = product.currentStock;
    const newStock =
      body.type === 'IN'
        ? previousStock + body.quantity
        : previousStock - body.quantity;

    if (newStock < 0) {
      return c.json({ error: 'Insufficient stock for this operation' }, 400);
    }

    // Create movement record with lowercase type matching schema
    const [movement] = await db
      .insert(stockMovements)
      .values({
        productId: id,
        type: body.type.toLowerCase() as 'in' | 'out', // Convert to lowercase for schema
        quantity: body.quantity,
        previousStock: previousStock,
        newStock: newStock,
        reason: body.reason || null,
      })
      .returning();

    // Update product stock
    const [updatedProduct] = await db
      .update(products)
      .set({
        currentStock: newStock,
        updatedAt: sql`(unixepoch())`,
      })
      .where(eq(products.id, id))
      .returning();

    return c.json({
      data: {
        movement,
        product: updatedProduct,
      },
      message: `Stock ${body.type === 'IN' ? 'entry' : 'exit'} recorded successfully`,
    });
  } catch (error) {
    console.error('Error creating stock movement:', error);
    return c.json({ error: 'Failed to record stock movement' }, 500);
  }
});

export default app;
