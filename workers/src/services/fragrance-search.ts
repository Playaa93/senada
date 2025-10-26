/**
 * Fragrance Search Service
 * Hybrid search: D1 database first, Fragella API fallback
 */

import { drizzle } from 'drizzle-orm/d1';
import { like, or } from 'drizzle-orm';
import { fragrances, type Fragrance } from '../db/schema';

interface FragellaAPIResponse {
  fragrances: Array<{
    id: string;
    name: string;
    brand: string;
    gender: string;
    year?: number;
    imageUrl?: string;
    notes?: {
      top?: string[];
      middle?: string[];
      base?: string[];
    };
    accords?: string[];
    rating?: number;
  }>;
}

export class FragranceSearchService {
  constructor(
    private db: D1Database,
    private fragellaApiKey?: string
  ) {}

  /**
   * Search fragrances in local D1 database
   * Supports bidirectional search: by name, brand, or combined
   */
  async searchLocal(query: string, limit = 10): Promise<Fragrance[]> {
    const drizzleDb = drizzle(this.db);

    // Split query into words for better matching
    const words = query.toLowerCase().trim().split(/\s+/);

    // Create search patterns for each word
    const searchPatterns = words.map(word => `%${word}%`);

    // Build conditions: each word can match in name OR brand
    const conditions = searchPatterns.flatMap(pattern => [
      like(fragrances.name, pattern),
      like(fragrances.brand, pattern)
    ]);

    const results = await drizzleDb
      .select()
      .from(fragrances)
      .where(or(...conditions))
      .limit(limit)
      .all();

    return results;
  }

  /**
   * Search fragrances via Fragella API
   */
  async searchAPI(query: string, limit = 10): Promise<Fragrance[]> {
    if (!this.fragellaApiKey) {
      console.log('⚠️  Fragella API key not configured, skipping API search');
      return [];
    }

    try {
      const response = await fetch(
        `https://api.fragella.com/v1/search?q=${encodeURIComponent(query)}&limit=${limit}`,
        {
          headers: {
            'x-api-key': this.fragellaApiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error(`Fragella API error: ${response.status}`);
        return [];
      }

      const data: FragellaAPIResponse = await response.json();

      // Transform API response to our schema
      return data.fragrances.map((f) => ({
        id: 0, // Will be assigned by DB
        fragrancaId: f.id,
        name: f.name,
        brand: f.brand,
        gender: f.gender,
        year: f.year || null,
        perfumer: null,
        topNotes: f.notes?.top?.join(', ') || null,
        middleNotes: f.notes?.middle?.join(', ') || null,
        baseNotes: f.notes?.base?.join(', ') || null,
        mainAccords: f.accords?.join(', ') || null,
        description: null,
        rating: f.rating || null,
        votes: null,
        imageUrl: f.imageUrl || null,
        sillage: null,
        longevity: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    } catch (error) {
      console.error('Fragella API search error:', error);
      return [];
    }
  }

  /**
   * Cache API results in D1 for future searches
   */
  async cacheAPIResults(results: Fragrance[]): Promise<void> {
    if (results.length === 0) return;

    const drizzleDb = drizzle(this.db);

    // Insert only fragrances that don't exist yet
    for (const fragrance of results) {
      try {
        await drizzleDb
          .insert(fragrances)
          .values({
            fragrancaId: fragrance.fragrancaId,
            name: fragrance.name,
            brand: fragrance.brand,
            gender: fragrance.gender,
            year: fragrance.year,
            perfumer: fragrance.perfumer,
            topNotes: fragrance.topNotes,
            middleNotes: fragrance.middleNotes,
            baseNotes: fragrance.baseNotes,
            mainAccords: fragrance.mainAccords,
            description: fragrance.description,
            rating: fragrance.rating,
            votes: fragrance.votes,
            imageUrl: fragrance.imageUrl,
            sillage: fragrance.sillage,
            longevity: fragrance.longevity,
          })
          .run();
      } catch (error) {
        // Ignore duplicates (unique constraint on fragrancaId)
        console.log(`Skipping duplicate: ${fragrance.name}`);
      }
    }
  }

  /**
   * Hybrid search: D1 first, API fallback, cache results
   */
  async search(query: string, limit = 10): Promise<Fragrance[]> {
    // 1. Search local database first
    const localResults = await this.searchLocal(query, limit);

    if (localResults.length >= 3) {
      // Enough local results, return them
      return localResults;
    }

    // 2. Supplement with API results if needed
    const apiResults = await this.searchAPI(query, limit - localResults.length);

    // 3. Cache API results for future searches
    if (apiResults.length > 0) {
      await this.cacheAPIResults(apiResults);
    }

    // 4. Combine and return
    return [...localResults, ...apiResults].slice(0, limit);
  }
}
