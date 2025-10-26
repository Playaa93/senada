// React Query hooks for Analytics API

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi } from '../analytics';
import {
  type CreatePredictionInput,
  type UpdatePredictionInput,
} from '../types';

// Query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: () => [...analyticsKeys.all, 'dashboard'] as const,
  velocity: () => [...analyticsKeys.all, 'velocity'] as const,
  productVelocity: (id: number) => [...analyticsKeys.velocity(), id] as const,
  predictions: () => [...analyticsKeys.all, 'predictions'] as const,
  prediction: (id: number) => [...analyticsKeys.predictions(), id] as const,
  predictionsByStatus: (status: string) =>
    [...analyticsKeys.predictions(), 'status', status] as const,
  categories: () => [...analyticsKeys.all, 'categories'] as const,
  urgent: () => [...analyticsKeys.all, 'urgent'] as const,
  trending: () => [...analyticsKeys.all, 'trending'] as const,
  declining: () => [...analyticsKeys.all, 'declining'] as const,
  recommendations: () => [...analyticsKeys.all, 'recommendations'] as const,
  health: () => [...analyticsKeys.all, 'health'] as const,
};

/**
 * Get dashboard overview data
 */
export function useDashboard() {
  return useQuery({
    queryKey: analyticsKeys.dashboard(),
    queryFn: () => analyticsApi.getDashboard(),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Get sales velocity data for all products
 */
export function useSalesVelocity() {
  return useQuery({
    queryKey: analyticsKeys.velocity(),
    queryFn: () => analyticsApi.getSalesVelocity(),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Get sales velocity for a specific product
 */
export function useProductVelocity(productId: number, enabled = true) {
  return useQuery({
    queryKey: analyticsKeys.productVelocity(productId),
    queryFn: () => analyticsApi.getProductVelocity(productId),
    enabled,
    staleTime: 60000,
  });
}

/**
 * Get all predictions
 */
export function usePredictions() {
  return useQuery({
    queryKey: analyticsKeys.predictions(),
    queryFn: () => analyticsApi.getPredictions(),
    staleTime: 60000,
  });
}

/**
 * Get pending predictions
 */
export function usePendingPredictions() {
  return useQuery({
    queryKey: analyticsKeys.predictionsByStatus('PENDING'),
    queryFn: () => analyticsApi.getPendingPredictions(),
    staleTime: 60000,
  });
}

/**
 * Get predictions by status
 */
export function usePredictionsByStatus(
  status: 'PENDING' | 'ORDERED' | 'IGNORED'
) {
  return useQuery({
    queryKey: analyticsKeys.predictionsByStatus(status),
    queryFn: () => analyticsApi.getPredictionsByStatus(status),
    staleTime: 60000,
  });
}

/**
 * Get a single prediction
 */
export function usePrediction(id: number, enabled = true) {
  return useQuery({
    queryKey: analyticsKeys.prediction(id),
    queryFn: () => analyticsApi.getPrediction(id),
    enabled,
    staleTime: 60000,
  });
}

/**
 * Create a new prediction
 */
export function useCreatePrediction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePredictionInput) =>
      analyticsApi.createPrediction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.predictions() });
    },
  });
}

/**
 * Update a prediction
 */
export function useUpdatePrediction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePredictionInput }) =>
      analyticsApi.updatePrediction(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.prediction(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.predictions() });
    },
  });
}

/**
 * Update prediction status
 */
export function useUpdatePredictionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: 'PENDING' | 'ORDERED' | 'IGNORED';
    }) => analyticsApi.updatePredictionStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.prediction(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.predictions() });
    },
  });
}

/**
 * Delete a prediction
 */
export function useDeletePrediction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => analyticsApi.deletePrediction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.predictions() });
    },
  });
}

/**
 * Get category performance summary
 */
export function useCategorySummary() {
  return useQuery({
    queryKey: analyticsKeys.categories(),
    queryFn: () => analyticsApi.getCategorySummary(),
    staleTime: 60000,
  });
}

/**
 * Generate prediction for a product
 */
export function useGeneratePrediction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => analyticsApi.generatePrediction(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.predictions() });
    },
  });
}

/**
 * Get urgent restock items
 */
export function useUrgentRestockItems() {
  return useQuery({
    queryKey: analyticsKeys.urgent(),
    queryFn: () => analyticsApi.getUrgentRestockItems(),
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

/**
 * Get trending products (increasing demand)
 */
export function useTrendingProducts() {
  return useQuery({
    queryKey: analyticsKeys.trending(),
    queryFn: () => analyticsApi.getTrendingProducts(),
    staleTime: 60000,
  });
}

/**
 * Get declining products (decreasing demand)
 */
export function useDecliningProducts() {
  return useQuery({
    queryKey: analyticsKeys.declining(),
    queryFn: () => analyticsApi.getDecliningProducts(),
    staleTime: 60000,
  });
}

/**
 * Get restock recommendations
 */
export function useRestockRecommendations() {
  return useQuery({
    queryKey: analyticsKeys.recommendations(),
    queryFn: () => analyticsApi.getRestockRecommendations(),
    staleTime: 60000,
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

/**
 * Get inventory health score
 */
export function useInventoryHealth() {
  return useQuery({
    queryKey: analyticsKeys.health(),
    queryFn: () => analyticsApi.getInventoryHealth(),
    staleTime: 60000,
    refetchInterval: 300000,
  });
}

/**
 * Batch generate predictions for low stock items
 */
export function useBatchGeneratePredictions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => analyticsApi.batchGeneratePredictions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.predictions() });
    },
  });
}

/**
 * Mark prediction as ordered
 */
export function useMarkAsOrdered() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => analyticsApi.markAsOrdered(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.prediction(id) });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.predictions() });
    },
  });
}

/**
 * Mark prediction as ignored
 */
export function useMarkAsIgnored() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => analyticsApi.markAsIgnored(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.prediction(id) });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.predictions() });
    },
  });
}
