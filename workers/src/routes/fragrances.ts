/**
 * Fragrances API Routes
 * Search endpoint for perfume database
 */

import { Hono } from 'hono';
import { FragranceSearchService } from '../services/fragrance-search';

const app = new Hono<{ Bindings: { DB: D1Database; FRAGELLA_API_KEY?: string } }>();

/**
 * GET /api/fragrances/search?q=chanel&limit=10
 * Search fragrances by name or brand
 */
app.get('/search', async (c) => {
  const query = c.req.query('q');
  const limit = parseInt(c.req.query('limit') || '10', 10);

  if (!query || query.trim().length < 2) {
    return c.json(
      { error: 'Query must be at least 2 characters' },
      400
    );
  }

  try {
    const searchService = new FragranceSearchService(
      c.env.DB,
      c.env.FRAGELLA_API_KEY
    );

    const results = await searchService.search(query.trim(), Math.min(limit, 50));

    return c.json({
      query,
      count: results.length,
      fragrances: results.map((f) => ({
        id: f.id,
        name: f.name,
        brand: f.brand,
        gender: f.gender,
        year: f.year,
        perfumer: f.perfumer,
        notes: {
          top: f.topNotes?.split(',').map((n) => n.trim()),
          middle: f.middleNotes?.split(',').map((n) => n.trim()),
          base: f.baseNotes?.split(',').map((n) => n.trim()),
        },
        accords: f.mainAccords?.split(',').map((a) => a.trim()),
        description: f.description,
        rating: f.rating,
        imageUrl: f.imageUrl,
        sillage: f.sillage,
        longevity: f.longevity,
      })),
    });
  } catch (error) {
    console.error('Fragrance search error:', error);
    return c.json(
      { error: 'Search failed' },
      500
    );
  }
});

/**
 * GET /api/fragrances/:id
 * Get fragrance details by ID
 */
app.get('/:id', async (c) => {
  const id = parseInt(c.params.id, 10);

  if (isNaN(id)) {
    return c.json({ error: 'Invalid ID' }, 400);
  }

  try {
    const { drizzle } = await import('drizzle-orm/d1');
    const { fragrances } = await import('../db/schema');
    const { eq } = await import('drizzle-orm');

    const db = drizzle(c.env.DB);
    const result = await db
      .select()
      .from(fragrances)
      .where(eq(fragrances.id, id))
      .get();

    if (!result) {
      return c.json({ error: 'Fragrance not found' }, 404);
    }

    return c.json({
      id: result.id,
      name: result.name,
      brand: result.brand,
      gender: result.gender,
      year: result.year,
      perfumer: result.perfumer,
      notes: {
        top: result.topNotes?.split(',').map((n) => n.trim()),
        middle: result.middleNotes?.split(',').map((n) => n.trim()),
        base: result.baseNotes?.split(',').map((n) => n.trim()),
      },
      accords: result.mainAccords?.split(',').map((a) => a.trim()),
      description: result.description,
      rating: result.rating,
      votes: result.votes,
      imageUrl: result.imageUrl,
      sillage: result.sillage,
      longevity: result.longevity,
    });
  } catch (error) {
    console.error('Fragrance fetch error:', error);
    return c.json({ error: 'Failed to fetch fragrance' }, 500);
  }
});

export default app;
