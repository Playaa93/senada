// React Query hooks for Stock API

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockApi } from '../stock';
import {
  type CreateStockMovementInput,
  type StockMovementFilters,
} from '../types';

// Query keys
export const stockKeys = {
  all: ['stock'] as const,
  movements: () => [...stockKeys.all, 'movements'] as const,
  movement: (filters?: StockMovementFilters) => [...stockKeys.movements(), filters] as const,
  productMovements: (productId: number) =>
    [...stockKeys.movements(), 'product', productId] as const,
  lowStock: () => [...stockKeys.all, 'low-stock'] as const,
  summary: () => [...stockKeys.all, 'summary'] as const,
  alerts: () => [...stockKeys.all, 'alerts'] as const,
};

/**
 * Get all stock movements with optional filters
 */
export function useStockMovements(filters?: StockMovementFilters) {
  return useQuery({
    queryKey: stockKeys.movement(filters),
    queryFn: () => stockApi.getStockMovements(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Get stock movements for a specific product
 */
export function useProductMovements(productId: number, enabled = true) {
  return useQuery({
    queryKey: stockKeys.productMovements(productId),
    queryFn: () => stockApi.getProductMovements(productId),
    enabled,
    staleTime: 30000,
  });
}

/**
 * Get low stock products
 */
export function useLowStock() {
  return useQuery({
    queryKey: stockKeys.lowStock(),
    queryFn: () => stockApi.getLowStock(),
    staleTime: 30000,
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Get stock summary
 */
export function useStockSummary() {
  return useQuery({
    queryKey: stockKeys.summary(),
    queryFn: () => stockApi.getStockSummary(),
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

/**
 * Get stock alerts
 */
export function useStockAlerts() {
  return useQuery({
    queryKey: stockKeys.alerts(),
    queryFn: () => stockApi.getStockAlerts(),
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

/**
 * Create a new stock movement
 */
export function useCreateStockMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStockMovementInput) =>
      stockApi.createStockMovement(data),
    onSuccess: (_) => {
      // Invalidate all stock-related queries
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
      // Also invalidate product queries since quantity changed
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

/**
 * Record stock IN movement
 */
export function useRecordStockIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      quantity,
      notes,
    }: {
      productId: number;
      quantity: number;
      notes?: string;
    }) => stockApi.recordStockIn(productId, quantity, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

/**
 * Record stock OUT movement
 */
export function useRecordStockOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      quantity,
      notes,
    }: {
      productId: number;
      quantity: number;
      notes?: string;
    }) => stockApi.recordStockOut(productId, quantity, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

/**
 * Record stock adjustment
 */
export function useRecordAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      quantity,
      notes,
    }: {
      productId: number;
      quantity: number;
      notes?: string;
    }) => stockApi.recordAdjustment(productId, quantity, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

/**
 * Batch create stock movements
 */
export function useBatchCreateMovements() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (movements: CreateStockMovementInput[]) =>
      stockApi.batchCreateMovements(movements),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

/**
 * Get recent stock movements (last N days)
 */
export function useRecentMovements(days: number = 7) {
  return useQuery({
    queryKey: [...stockKeys.movements(), 'recent', days] as const,
    queryFn: () => stockApi.getRecentMovements(days),
    staleTime: 30000,
  });
}

/**
 * Get stock movements by type
 */
export function useMovementsByType(movementType: 'IN' | 'OUT' | 'ADJUSTMENT') {
  return useQuery({
    queryKey: stockKeys.movement({ movement_type: movementType }),
    queryFn: () => stockApi.getMovementsByType(movementType),
    staleTime: 30000,
  });
}

/**
 * Get stock turnover rate for a product
 */
export function useStockTurnover(productId: number, days: number = 30, enabled = true) {
  return useQuery({
    queryKey: [...stockKeys.all, 'turnover', productId, days] as const,
    queryFn: () => stockApi.getStockTurnover(productId, days),
    enabled,
    staleTime: 300000, // 5 minutes
  });
}
