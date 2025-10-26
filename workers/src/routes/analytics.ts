import { Hono } from 'hono';
import { eq, sql, desc, and, gte } from 'drizzle-orm';
import { products, stockMovements, restockPredictions, suppliers } from '../db/schema';
import type { DbClient, Env } from '../db/client';

const app = new Hono<{ Bindings: Env; Variables: { db: DbClient } }>();

/**
 * GET /api/analytics/dashboard - Get dashboard overview statistics
 */
app.get('/dashboard', async (c) => {
  try {
    const db = c.get('db');

    // Inventory overview
    const [inventoryStats] = await db
      .select({
        totalProducts: sql<number>`count(*)`,
        totalStock: sql<number>`sum(${products.currentStock})`,
        lowStockCount: sql<number>`sum(case when ${products.currentStock} <= ${products.minStock} then 1 else 0 end)`,
        inventoryValue: sql<number>`sum(${products.currentStock} * ${products.buyPrice})`,
        potentialRevenue: sql<number>`sum(${products.currentStock} * ${products.sellPrice})`,
      })
      .from(products);

    // Stock movements last 30 days
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
    const recentMovements = await db
      .select({
        type: stockMovements.type,
        count: sql<number>`count(*)`,
        totalQuantity: sql<number>`sum(${stockMovements.quantity})`,
      })
      .from(stockMovements)
      .where(gte(stockMovements.createdAt, sql`${thirtyDaysAgo}`))
      .groupBy(stockMovements.type);

    // Top products by stock value
    const topProducts = await db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        currentStock: products.currentStock,
        value: sql<number>`${products.currentStock} * ${products.buyPrice}`,
      })
      .from(products)
      .orderBy(sql`${products.currentStock} * ${products.buyPrice} DESC`)
      .limit(10);

    // Category breakdown
    const categoryStats = await db
      .select({
        category: products.category,
        count: sql<number>`count(*)`,
        totalStock: sql<number>`sum(${products.currentStock})`,
        value: sql<number>`sum(${products.currentStock} * ${products.buyPrice})`,
      })
      .from(products)
      .groupBy(products.category);

    return c.json({
      data: {
        inventory: inventoryStats,
        movements: recentMovements,
        topProducts,
        categories: categoryStats,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return c.json({ error: 'Failed to fetch dashboard analytics' }, 500);
  }
});

/**
 * GET /api/analytics/sales-velocity - Calculate sales velocity for products
 */
app.get('/sales-velocity', async (c) => {
  try {
    const db = c.get('db');
    const { days = '30' } = c.req.query();

    const daysNum = parseInt(days);
    const startTimestamp = Math.floor(Date.now() / 1000) - daysNum * 24 * 60 * 60;

    // Get outbound movements (sales/usage)
    const velocity = await db
      .select({
        productId: stockMovements.productId,
        productName: products.name,
        sku: products.sku,
        totalOut: sql<number>`sum(${stockMovements.quantity})`,
        movementCount: sql<number>`count(*)`,
        avgPerDay: sql<number>`cast(sum(${stockMovements.quantity}) as real) / ${daysNum}`,
        currentStock: products.currentStock,
        daysUntilStockout: sql<number>`case when sum(${stockMovements.quantity}) > 0 then cast(${products.currentStock} * ${daysNum} as real) / sum(${stockMovements.quantity}) else null end`,
      })
      .from(stockMovements)
      .leftJoin(products, eq(stockMovements.productId, products.id))
      .where(
        and(
          eq(stockMovements.type, 'out'),
          gte(stockMovements.createdAt, sql`${startTimestamp}`)
        )
      )
      .groupBy(stockMovements.productId, products.name, products.sku, products.currentStock)
      .orderBy(sql`sum(${stockMovements.quantity}) DESC`);

    return c.json({
      data: velocity,
      period: { days: daysNum, startDate: new Date(startTimestamp * 1000).toISOString() },
    });
  } catch (error) {
    console.error('Error calculating sales velocity:', error);
    return c.json({ error: 'Failed to calculate sales velocity' }, 500);
  }
});

/**
 * GET /api/analytics/predictions - Get restock predictions
 */
app.get('/predictions', async (c) => {
  try {
    const db = c.get('db');
    const { status = 'pending' } = c.req.query();

    let query = db
      .select({
        prediction: restockPredictions,
        product: {
          id: products.id,
          sku: products.sku,
          name: products.name,
          currentStock: products.currentStock,
          minStock: products.minStock,
        },
      })
      .from(restockPredictions)
      .leftJoin(products, eq(restockPredictions.productId, products.id))
      .orderBy(desc(restockPredictions.predictedDate));

    if (status && ['pending', 'ordered', 'dismissed'].includes(status)) {
      query = query.where(eq(restockPredictions.status, status as any));
    }

    const result = await query;

    return c.json({ data: result, count: result.length });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return c.json({ error: 'Failed to fetch predictions' }, 500);
  }
});

/**
 * POST /api/analytics/predictions - Create restock prediction
 */
app.post('/predictions', async (c) => {
  try {
    const db = c.get('db');
    const body = await c.req.json();

    if (!body.productId || !body.predictedDate || !body.suggestedQuantity || body.confidenceScore === undefined) {
      return c.json(
        { error: 'Missing required fields: productId, predictedDate, suggestedQuantity, confidenceScore' },
        400
      );
    }

    if (body.confidenceScore < 0 || body.confidenceScore > 1) {
      return c.json({ error: 'Confidence score must be between 0 and 1' }, 400);
    }

    const [prediction] = await db
      .insert(restockPredictions)
      .values({
        productId: body.productId,
        predictedDate: new Date(body.predictedDate),
        suggestedQuantity: body.suggestedQuantity,
        confidenceScore: body.confidenceScore,
        basedOn: body.basedOn ? JSON.stringify(body.basedOn) : null,
        status: 'pending',
      })
      .returning();

    return c.json(
      { data: prediction, message: 'Prediction created successfully' },
      201
    );
  } catch (error) {
    console.error('Error creating prediction:', error);
    return c.json({ error: 'Failed to create prediction' }, 500);
  }
});

/**
 * PATCH /api/analytics/predictions/:id - Update prediction status
 */
app.patch('/predictions/:id', async (c) => {
  try {
    const db = c.get('db');
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();

    if (isNaN(id)) {
      return c.json({ error: 'Invalid prediction ID' }, 400);
    }

    if (!body.status || !['pending', 'ordered', 'dismissed'].includes(body.status)) {
      return c.json({ error: 'Status must be: pending, ordered, or dismissed' }, 400);
    }

    const [updated] = await db
      .update(restockPredictions)
      .set({ status: body.status })
      .where(eq(restockPredictions.id, id))
      .returning();

    if (!updated) {
      return c.json({ error: 'Prediction not found' }, 404);
    }

    return c.json({ data: updated, message: 'Prediction status updated' });
  } catch (error) {
    console.error('Error updating prediction:', error);
    return c.json({ error: 'Failed to update prediction' }, 500);
  }
});

/**
 * GET /api/analytics/profit-margins - Calculate profit margins
 */
app.get('/profit-margins', async (c) => {
  try {
    const db = c.get('db');

    const margins = await db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        category: products.category,
        buyPrice: products.buyPrice,
        sellPrice: products.sellPrice,
        margin: sql<number>`${products.sellPrice} - ${products.buyPrice}`,
        marginPercent: sql<number>`cast((${products.sellPrice} - ${products.buyPrice}) as real) / ${products.buyPrice} * 100`,
        potentialProfit: sql<number>`${products.currentStock} * (${products.sellPrice} - ${products.buyPrice})`,
        currentStock: products.currentStock,
      })
      .from(products)
      .orderBy(sql`(${products.sellPrice} - ${products.buyPrice}) / ${products.buyPrice} DESC`);

    const [summary] = await db
      .select({
        avgMarginPercent: sql<number>`avg(cast((${products.sellPrice} - ${products.buyPrice}) as real) / ${products.buyPrice} * 100)`,
        totalPotentialProfit: sql<number>`sum(${products.currentStock} * (${products.sellPrice} - ${products.buyPrice}))`,
      })
      .from(products);

    return c.json({
      data: margins,
      summary,
    });
  } catch (error) {
    console.error('Error calculating profit margins:', error);
    return c.json({ error: 'Failed to calculate profit margins' }, 500);
  }
});

/**
 * GET /api/analytics/supplier-performance - Analyze supplier performance
 */
app.get('/supplier-performance', async (c) => {
  try {
    const db = c.get('db');

    const performance = await db
      .select({
        supplierId: suppliers.id,
        supplierName: suppliers.name,
        leadTimeDays: suppliers.leadTimeDays,
        productCount: sql<number>`count(${products.id})`,
        totalStock: sql<number>`sum(${products.currentStock})`,
        totalValue: sql<number>`sum(${products.currentStock} * ${products.buyPrice})`,
        lowStockCount: sql<number>`sum(case when ${products.currentStock} <= ${products.minStock} then 1 else 0 end)`,
      })
      .from(suppliers)
      .leftJoin(products, eq(products.supplierId, suppliers.id))
      .groupBy(suppliers.id, suppliers.name, suppliers.leadTimeDays)
      .orderBy(sql`sum(${products.currentStock} * ${products.buyPrice}) DESC`);

    return c.json({ data: performance });
  } catch (error) {
    console.error('Error analyzing supplier performance:', error);
    return c.json({ error: 'Failed to analyze supplier performance' }, 500);
  }
});

export default app;
