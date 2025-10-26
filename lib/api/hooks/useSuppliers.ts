// React Query hooks for Suppliers API

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersApi } from '../suppliers';
import {
  type Supplier,
  type CreateSupplierInput,
  type UpdateSupplierInput,
} from '../types';

// Query keys
export const supplierKeys = {
  all: ['suppliers'] as const,
  lists: () => [...supplierKeys.all, 'list'] as const,
  list: (filter?: 'active' | 'inactive') =>
    [...supplierKeys.lists(), filter] as const,
  details: () => [...supplierKeys.all, 'detail'] as const,
  detail: (id: number) => [...supplierKeys.details(), id] as const,
  products: (id: number) => [...supplierKeys.detail(id), 'products'] as const,
  stats: (id: number) => [...supplierKeys.detail(id), 'stats'] as const,
};

/**
 * Get all suppliers
 */
export function useSuppliers() {
  return useQuery({
    queryKey: supplierKeys.list(),
    queryFn: () => suppliersApi.getSuppliers(),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Get active suppliers only
 */
export function useActiveSuppliers() {
  return useQuery({
    queryKey: supplierKeys.list('active'),
    queryFn: () => suppliersApi.getActiveSuppliers(),
    staleTime: 60000,
  });
}

/**
 * Get inactive suppliers only
 */
export function useInactiveSuppliers() {
  return useQuery({
    queryKey: supplierKeys.list('inactive'),
    queryFn: () => suppliersApi.getInactiveSuppliers(),
    staleTime: 60000,
  });
}

/**
 * Get a single supplier by ID
 */
export function useSupplier(id: number, enabled = true) {
  return useQuery({
    queryKey: supplierKeys.detail(id),
    queryFn: () => suppliersApi.getSupplier(id),
    enabled,
    staleTime: 60000,
  });
}

/**
 * Get products from a supplier
 */
export function useSupplierProducts(supplierId: number, enabled = true) {
  return useQuery({
    queryKey: supplierKeys.products(supplierId),
    queryFn: () => suppliersApi.getSupplierProducts(supplierId),
    enabled,
    staleTime: 60000,
  });
}

/**
 * Get supplier statistics
 */
export function useSupplierStats(supplierId: number, enabled = true) {
  return useQuery({
    queryKey: supplierKeys.stats(supplierId),
    queryFn: () => suppliersApi.getSupplierStats(supplierId),
    enabled,
    staleTime: 60000,
  });
}

/**
 * Create a new supplier
 */
export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierInput) => suppliersApi.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
    },
  });
}

/**
 * Update an existing supplier
 */
export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSupplierInput }) =>
      suppliersApi.updateSupplier(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
}

/**
 * Delete a supplier
 */
export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => suppliersApi.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

/**
 * Toggle supplier active status
 */
export function useToggleSupplierStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => suppliersApi.toggleSupplierStatus(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
}

/**
 * Activate a supplier
 */
export function useActivateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => suppliersApi.activateSupplier(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
}

/**
 * Deactivate a supplier
 */
export function useDeactivateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => suppliersApi.deactivateSupplier(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
}

/**
 * Search suppliers
 */
export function useSearchSuppliers(query: string, enabled = true) {
  return useQuery({
    queryKey: [...supplierKeys.lists(), 'search', query] as const,
    queryFn: () => suppliersApi.searchSuppliers(query),
    enabled: enabled && query.length >= 2,
    staleTime: 30000,
  });
}

/**
 * Get suppliers with low stock products
 */
export function useSuppliersWithLowStock() {
  return useQuery({
    queryKey: [...supplierKeys.all, 'low-stock'] as const,
    queryFn: () => suppliersApi.getSuppliersWithLowStock(),
    staleTime: 60000,
    refetchInterval: 120000, // Refetch every 2 minutes
  });
}

/**
 * Bulk create suppliers
 */
export function useBulkCreateSuppliers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (suppliers: CreateSupplierInput[]) =>
      suppliersApi.bulkCreateSuppliers(suppliers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
    },
  });
}

/**
 * Prefetch a supplier (useful for hover states)
 */
export function usePrefetchSupplier() {
  const queryClient = useQueryClient();

  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: supplierKeys.detail(id),
      queryFn: () => suppliersApi.getSupplier(id),
      staleTime: 60000,
    });
  };
}
