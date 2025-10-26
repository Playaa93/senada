import { Hono } from 'hono';
import { eq, sql, desc } from 'drizzle-orm';
import { suppliers, products } from '../db/schema';
import type { DbClient, Env } from '../db/client';

const app = new Hono<{ Bindings: Env; Variables: { db: DbClient } }>();

/**
 * GET /api/suppliers - List all suppliers
 */
app.get('/', async (c) => {
  try {
    const db = c.get('db');
    const { active } = c.req.query();

    let query = db.select().from(suppliers).orderBy(desc(suppliers.createdAt));

    if (active === 'true') {
      query = query.where(eq(suppliers.isActive, true));
    }

    const result = await query;
    return c.json({ data: result, count: result.length });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return c.json({ error: 'Failed to fetch suppliers' }, 500);
  }
});

/**
 * GET /api/suppliers/:id - Get single supplier with products
 */
app.get('/:id', async (c) => {
  try {
    const db = c.get('db');
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json({ error: 'Invalid supplier ID' }, 400);
    }

    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));

    if (!supplier) {
      return c.json({ error: 'Supplier not found' }, 404);
    }

    // Get products from this supplier
    const supplierProducts = await db
      .select()
      .from(products)
      .where(eq(products.supplierId, id));

    return c.json({
      data: {
        ...supplier,
        products: supplierProducts,
        productCount: supplierProducts.length,
      },
    });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    return c.json({ error: 'Failed to fetch supplier' }, 500);
  }
});

/**
 * POST /api/suppliers - Create new supplier
 */
app.post('/', async (c) => {
  try {
    const db = c.get('db');
    const body = await c.req.json();

    // Validation
    if (!body.name) {
      return c.json({ error: 'Missing required field: name' }, 400);
    }

    if (body.email && !body.email.includes('@')) {
      return c.json({ error: 'Invalid email format' }, 400);
    }

    const [newSupplier] = await db
      .insert(suppliers)
      .values({
        name: body.name,
        contactName: body.contactName || null,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
        paymentTerms: body.paymentTerms || null,
        leadTimeDays: body.leadTimeDays || 7,
        notes: body.notes || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
      })
      .returning();

    return c.json(
      { data: newSupplier, message: 'Supplier created successfully' },
      201
    );
  } catch (error) {
    console.error('Error creating supplier:', error);
    return c.json({ error: 'Failed to create supplier' }, 500);
  }
});

/**
 * PUT /api/suppliers/:id - Update supplier
 */
app.put('/:id', async (c) => {
  try {
    const db = c.get('db');
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();

    if (isNaN(id)) {
      return c.json({ error: 'Invalid supplier ID' }, 400);
    }

    // Check if supplier exists
    const [existing] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    if (!existing) {
      return c.json({ error: 'Supplier not found' }, 404);
    }

    // Validation
    if (body.email && !body.email.includes('@')) {
      return c.json({ error: 'Invalid email format' }, 400);
    }

    const [updated] = await db
      .update(suppliers)
      .set({
        ...body,
        updatedAt: sql`(unixepoch())`,
      })
      .where(eq(suppliers.id, id))
      .returning();

    return c.json({ data: updated, message: 'Supplier updated successfully' });
  } catch (error) {
    console.error('Error updating supplier:', error);
    return c.json({ error: 'Failed to update supplier' }, 500);
  }
});

/**
 * DELETE /api/suppliers/:id - Delete supplier
 */
app.delete('/:id', async (c) => {
  try {
    const db = c.get('db');
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json({ error: 'Invalid supplier ID' }, 400);
    }

    // Check if supplier has products
    const supplierProducts = await db
      .select()
      .from(products)
      .where(eq(products.supplierId, id));

    if (supplierProducts.length > 0) {
      return c.json(
        {
          error: 'Cannot delete supplier with associated products',
          productCount: supplierProducts.length,
        },
        409
      );
    }

    const [deleted] = await db
      .delete(suppliers)
      .where(eq(suppliers.id, id))
      .returning();

    if (!deleted) {
      return c.json({ error: 'Supplier not found' }, 404);
    }

    return c.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return c.json({ error: 'Failed to delete supplier' }, 500);
  }
});

/**
 * PATCH /api/suppliers/:id/toggle - Toggle supplier active status
 */
app.patch('/:id/toggle', async (c) => {
  try {
    const db = c.get('db');
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json({ error: 'Invalid supplier ID' }, 400);
    }

    const [existing] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    if (!existing) {
      return c.json({ error: 'Supplier not found' }, 404);
    }

    const [updated] = await db
      .update(suppliers)
      .set({
        isActive: !existing.isActive,
        updatedAt: sql`(unixepoch())`,
      })
      .where(eq(suppliers.id, id))
      .returning();

    return c.json({
      data: updated,
      message: `Supplier ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    console.error('Error toggling supplier status:', error);
    return c.json({ error: 'Failed to toggle supplier status' }, 500);
  }
});

export default app;
