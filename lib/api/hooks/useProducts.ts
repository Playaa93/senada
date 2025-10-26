// React Query hooks for Products API

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../products';
import {
  type CreateProductInput,
  type UpdateProductInput,
  type ProductFilters,
} from '../types';

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
  categories: () => [...productKeys.all, 'categories'] as const,
  lowStock: () => [...productKeys.all, 'low-stock'] as const,
};

/**
 * Get all products with optional filters
 */
export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productsApi.getProducts(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Get a single product by ID
 */
export function useProduct(id: number, enabled = true) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getProduct(id),
    enabled,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Get all product categories
 */
export function useCategories() {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: () => productsApi.getCategories(),
    staleTime: 300000, // 5 minutes
  });
}

/**
 * Get low stock products
 */
export function useLowStockProducts() {
  return useQuery({
    queryKey: productKeys.lowStock(),
    queryFn: () => productsApi.getLowStockProducts(),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Create a new product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductInput) => productsApi.createProduct(data),
    onSuccess: () => {
      // Invalidate and refetch all product queries
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

/**
 * Update an existing product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductInput }) =>
      productsApi.updateProduct(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific product and all lists
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

/**
 * Delete a product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productsApi.deleteProduct(id),
    onSuccess: () => {
      // Invalidate all product queries
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

/**
 * Search products
 */
export function useSearchProducts(query: string, enabled = true) {
  return useQuery({
    queryKey: [...productKeys.lists(), 'search', query] as const,
    queryFn: () => productsApi.searchProducts(query),
    enabled: enabled && query.length >= 2,
    staleTime: 30000,
  });
}

/**
 * Get products by category
 */
export function useProductsByCategory(category: string, enabled = true) {
  return useQuery({
    queryKey: productKeys.list({ category }),
    queryFn: () => productsApi.getProductsByCategory(category),
    enabled,
    staleTime: 60000,
  });
}

/**
 * Get products by supplier
 */
export function useProductsBySupplier(supplierId: number, enabled = true) {
  return useQuery({
    queryKey: productKeys.list({ supplier_id: supplierId }),
    queryFn: () => productsApi.getProductsBySupplier(supplierId),
    enabled,
    staleTime: 60000,
  });
}

/**
 * Bulk update product quantities
 */
export function useBulkUpdateQuantities() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: { id: number; quantity: number }[]) =>
      productsApi.bulkUpdateQuantities(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

/**
 * Prefetch a product (useful for hover states)
 */
export function usePrefetchProduct() {
  const queryClient = useQueryClient();

  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: productKeys.detail(id),
      queryFn: () => productsApi.getProduct(id),
      staleTime: 60000,
    });
  };
}
