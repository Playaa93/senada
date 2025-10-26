/**
 * Fragrances API Client
 */

import { apiClient } from './client';

export interface FragranceNote {
  top?: string[];
  middle?: string[];
  base?: string[];
}

export interface Fragrance {
  id: number;
  name: string;
  brand: string;
  gender?: string;
  year?: number;
  perfumer?: string;
  notes?: FragranceNote;
  accords?: string[];
  description?: string;
  rating?: number;
  votes?: number;
  imageUrl?: string;
  sillage?: string;
  longevity?: string;
}

export interface FragranceSearchResponse {
  query: string;
  count: number;
  fragrances: Fragrance[];
}

/**
 * Search fragrances by name or brand
 */
export async function searchFragrances(
  query: string,
  limit = 10
): Promise<FragranceSearchResponse> {
  const response = await apiClient.get<FragranceSearchResponse>('/api/fragrances/search', {
    params: { q: query, limit },
  });
  return response;
}

/**
 * Get fragrance details by ID
 */
export async function getFragranceById(id: number): Promise<Fragrance> {
  const response = await apiClient.get<Fragrance>(`/api/fragrances/${id}`);
  return response;
}
