import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { customers } from '../db/schema';
import { eq, desc, sql } from 'drizzle-orm';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

/**
 * GET /customers - List all customers with optional filtering
 */
app.get('/', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const { search, segment } = c.req.query();

    let query = db.select().from(customers).orderBy(desc(customers.createdAt));

    // Note: D1 doesn't support .where() chaining perfectly, so we'll filter in memory for now
    let allCustomers = await query;

    if (search) {
      const searchLower = search.toLowerCase();
      allCustomers = allCustomers.filter(
        (customer) =>
          customer.firstName.toLowerCase().includes(searchLower) ||
          customer.lastName.toLowerCase().includes(searchLower) ||
          customer.email.toLowerCase().includes(searchLower)
      );
    }

    if (segment && segment !== 'all') {
      allCustomers = allCustomers.filter((customer) => customer.segment === segment);
    }

    return c.json({ data: allCustomers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return c.json({ error: 'Failed to fetch customers' }, 500);
  }
});

/**
 * GET /customers/:id - Get a single customer by ID
 */
app.get('/:id', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json({ error: 'Invalid customer ID' }, 400);
    }

    const [customer] = await db.select().from(customers).where(eq(customers.id, id));

    if (!customer) {
      return c.json({ error: 'Customer not found' }, 404);
    }

    return c.json({ data: customer });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return c.json({ error: 'Failed to fetch customer' }, 500);
  }
});

/**
 * POST /customers - Create a new customer
 */
app.post('/', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const body = await c.req.json();

    // Validation
    if (!body.firstName || !body.lastName || !body.email) {
      return c.json(
        { error: 'First name, last name, and email are required' },
        400
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return c.json({ error: 'Invalid email format' }, 400);
    }

    // Check if email already exists
    const existingCustomer = await db
      .select()
      .from(customers)
      .where(eq(customers.email, body.email));

    if (existingCustomer.length > 0) {
      return c.json({ error: 'A customer with this email already exists' }, 409);
    }

    // Create customer
    const [newCustomer] = await db
      .insert(customers)
      .values({
        firstName: body.firstName.trim(),
        lastName: body.lastName.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone?.trim() || null,
        city: body.city?.trim() || null,
        notes: body.notes?.trim() || null,
        segment: 'Occasionnel', // Default segment for new customers
        totalSpent: 0,
        ordersCount: 0,
      })
      .returning();

    return c.json(
      {
        data: newCustomer,
        message: 'Customer created successfully',
      },
      201
    );
  } catch (error) {
    console.error('Error creating customer:', error);
    return c.json({ error: 'Failed to create customer' }, 500);
  }
});

/**
 * PUT /customers/:id - Update a customer
 */
app.put('/:id', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();

    if (isNaN(id)) {
      return c.json({ error: 'Invalid customer ID' }, 400);
    }

    // Check if customer exists
    const [existingCustomer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id));

    if (!existingCustomer) {
      return c.json({ error: 'Customer not found' }, 404);
    }

    // Validation
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return c.json({ error: 'Invalid email format' }, 400);
      }

      // Check if email is already used by another customer
      const emailCheck = await db
        .select()
        .from(customers)
        .where(eq(customers.email, body.email));

      if (emailCheck.length > 0 && emailCheck[0].id !== id) {
        return c.json({ error: 'This email is already used by another customer' }, 409);
      }
    }

    // Update customer
    const [updatedCustomer] = await db
      .update(customers)
      .set({
        firstName: body.firstName?.trim() || existingCustomer.firstName,
        lastName: body.lastName?.trim() || existingCustomer.lastName,
        email: body.email?.trim().toLowerCase() || existingCustomer.email,
        phone: body.phone?.trim() || existingCustomer.phone,
        city: body.city?.trim() || existingCustomer.city,
        notes: body.notes?.trim() || existingCustomer.notes,
        segment: body.segment || existingCustomer.segment,
        updatedAt: sql`(unixepoch())`,
      })
      .where(eq(customers.id, id))
      .returning();

    return c.json({
      data: updatedCustomer,
      message: 'Customer updated successfully',
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    return c.json({ error: 'Failed to update customer' }, 500);
  }
});

/**
 * DELETE /customers/:id - Delete a customer
 */
app.delete('/:id', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json({ error: 'Invalid customer ID' }, 400);
    }

    // Check if customer exists
    const [existingCustomer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id));

    if (!existingCustomer) {
      return c.json({ error: 'Customer not found' }, 404);
    }

    await db.delete(customers).where(eq(customers.id, id));

    return c.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return c.json({ error: 'Failed to delete customer' }, 500);
  }
});

/**
 * GET /customers/stats/overview - Get customer statistics
 */
app.get('/stats/overview', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const allCustomers = await db.select().from(customers);

    const totalCustomers = allCustomers.length;
    const totalRevenue = allCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
    const totalOrders = allCustomers.reduce((sum, c) => sum + c.ordersCount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Active customers (ordered in last 30 days)
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
    const activeCustomers = allCustomers.filter(
      (c) => c.lastOrderDate && c.lastOrderDate >= thirtyDaysAgo
    ).length;

    // Segment breakdown
    const vipCustomers = allCustomers.filter((c) => c.segment === 'VIP');
    const regularCustomers = allCustomers.filter((c) => c.segment === 'Régulier');
    const occasionalCustomers = allCustomers.filter((c) => c.segment === 'Occasionnel');

    return c.json({
      data: {
        totalCustomers,
        activeCustomers,
        totalRevenue,
        averageOrderValue,
        segments: {
          vip: {
            count: vipCustomers.length,
            revenue: vipCustomers.reduce((sum, c) => sum + c.totalSpent, 0),
          },
          regular: {
            count: regularCustomers.length,
            revenue: regularCustomers.reduce((sum, c) => sum + c.totalSpent, 0),
          },
          occasional: {
            count: occasionalCustomers.length,
            revenue: occasionalCustomers.reduce((sum, c) => sum + c.totalSpent, 0),
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    return c.json({ error: 'Failed to fetch customer statistics' }, 500);
  }
});

export default app;
