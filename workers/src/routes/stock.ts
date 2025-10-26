import { Hono } from 'hono';
import { eq, and, sql, desc } from 'drizzle-orm';
import { products, stockMovements } from '../db/schema';
import type { DbClient, Env } from '../db/client';

const app = new Hono<{ Bindings: Env; Variables: { db: DbClient } }>();

/**
 * GET /api/stock/movements - Get all stock movements with filters
 */
app.get('/movements', async (c) => {
  try {
    const db = c.get('db');
    const { productId, type, limit = '50' } = c.req.query();

    let query = db
      .select({
        movement: stockMovements,
        product: {
          id: products.id,
          sku: products.sku,
          name: products.name,
        },
      })
      .from(stockMovements)
      .leftJoin(products, eq(stockMovements.productId, products.id))
      .orderBy(desc(stockMovements.createdAt));

    const conditions = [];
    if (productId) {
      conditions.push(eq(stockMovements.productId, parseInt(productId)));
    }
    if (type && ['in', 'out', 'adjustment'].includes(type)) {
      conditions.push(eq(stockMovements.type, type as 'in' | 'out' | 'adjustment'));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const limitNum = Math.min(parseInt(limit), 200);
    const result = await query.limit(limitNum);

    return c.json({ data: result, count: result.length });
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    return c.json({ error: 'Failed to fetch stock movements' }, 500);
  }
});

/**
 * POST /api/stock/movements - Create stock movement (adjust inventory)
 */
app.post('/movements', async (c) => {
  try {
    const db = c.get('db');
    const body = await c.req.json();

    // Validation
    if (!body.productId || !body.type || body.quantity === undefined) {
      return c.json(
        { error: 'Missing required fields: productId, type, quantity' },
        400
      );
    }

    if (!['in', 'out', 'adjustment'].includes(body.type)) {
      return c.json({ error: 'Type must be: in, out, or adjustment' }, 400);
    }

    if (body.quantity === 0) {
      return c.json({ error: 'Quantity cannot be zero' }, 400);
    }

    // Get current product stock
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, body.productId));

    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    const previousStock = product.currentStock;
    let newStock = previousStock;

    // Calculate new stock based on movement type
    switch (body.type) {
      case 'in':
        newStock = previousStock + Math.abs(body.quantity);
        break;
      case 'out':
        newStock = previousStock - Math.abs(body.quantity);
        if (newStock < 0) {
          return c.json(
            { error: 'Insufficient stock. Current stock: ' + previousStock },
            400
          );
        }
        break;
      case 'adjustment':
        newStock = body.quantity; // Direct set for adjustments
        break;
    }

    // Transaction: Update product stock and create movement record
    const [movement] = await db
      .insert(stockMovements)
      .values({
        productId: body.productId,
        type: body.type,
        quantity: Math.abs(body.quantity),
        previousStock,
        newStock,
        reason: body.reason || null,
        user: body.user || null,
        reference: body.reference || null,
        notes: body.notes || null,
      })
      .returning();

    await db
      .update(products)
      .set({
        currentStock: newStock,
        updatedAt: sql`(unixepoch())`,
      })
      .where(eq(products.id, body.productId));

    return c.json(
      {
        data: movement,
        message: 'Stock movement recorded successfully',
        previousStock,
        newStock,
      },
      201
    );
  } catch (error) {
    console.error('Error creating stock movement:', error);
    return c.json({ error: 'Failed to create stock movement' }, 500);
  }
});

/**
 * GET /api/stock/low - Get products with low stock
 */
app.get('/low', async (c) => {
  try {
    const db = c.get('db');

    const result = await db
      .select()
      .from(products)
      .where(sql`${products.currentStock} <= ${products.minStock}`);

    return c.json({ data: result, count: result.length });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return c.json({ error: 'Failed to fetch low stock products' }, 500);
  }
});

/**
 * GET /api/stock/summary - Get stock summary statistics
 */
app.get('/summary', async (c) => {
  try {
    const db = c.get('db');

    const [stats] = await db
      .select({
        totalProducts: sql<number>`count(*)`,
        totalStock: sql<number>`sum(${products.currentStock})`,
        lowStockCount: sql<number>`sum(case when ${products.currentStock} <= ${products.minStock} then 1 else 0 end)`,
        totalValue: sql<number>`sum(${products.currentStock} * ${products.buyPrice})`,
      })
      .from(products);

    const recentMovements = await db
      .select({
        type: stockMovements.type,
        count: sql<number>`count(*)`,
        totalQuantity: sql<number>`sum(${stockMovements.quantity})`,
      })
      .from(stockMovements)
      .where(sql`${stockMovements.createdAt} >= unixepoch('now', '-30 days')`)
      .groupBy(stockMovements.type);

    return c.json({
      data: {
        summary: stats,
        last30Days: recentMovements,
      },
    });
  } catch (error) {
    console.error('Error fetching stock summary:', error);
    return c.json({ error: 'Failed to fetch stock summary' }, 500);
  }
});

/**
 * POST /api/stock/bulk-adjust - Bulk stock adjustment
 */
app.post('/bulk-adjust', async (c) => {
  try {
    const db = c.get('db');
    const body = await c.req.json();

    if (!Array.isArray(body.adjustments) || body.adjustments.length === 0) {
      return c.json({ error: 'adjustments array is required' }, 400);
    }

    const results = [];
    const errors = [];

    for (const adjustment of body.adjustments) {
      try {
        const [product] = await db
          .select()
          .from(products)
          .where(eq(products.id, adjustment.productId));

        if (!product) {
          errors.push({
            productId: adjustment.productId,
            error: 'Product not found',
          });
          continue;
        }

        const previousStock = product.currentStock;
        const newStock = adjustment.newStock;

        const [movement] = await db
          .insert(stockMovements)
          .values({
            productId: adjustment.productId,
            type: 'adjustment',
            quantity: Math.abs(newStock - previousStock),
            previousStock,
            newStock,
            reason: adjustment.reason || 'Bulk adjustment',
            user: body.user || null,
            notes: adjustment.notes || null,
          })
          .returning();

        await db
          .update(products)
          .set({
            currentStock: newStock,
            updatedAt: sql`(unixepoch())`,
          })
          .where(eq(products.id, adjustment.productId));

        results.push(movement);
      } catch (error: any) {
        errors.push({
          productId: adjustment.productId,
          error: error.message,
        });
      }
    }

    return c.json({
      data: results,
      errors,
      message: `Processed ${results.length} adjustments, ${errors.length} errors`,
    });
  } catch (error) {
    console.error('Error in bulk adjustment:', error);
    return c.json({ error: 'Failed to process bulk adjustment' }, 500);
  }
});

export default app;
