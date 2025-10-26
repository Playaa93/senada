// Analytics API methods

import { apiClient } from './client';
import {
  type DashboardData,
  type SalesVelocity,
  type Prediction,
  type CreatePredictionInput,
  type UpdatePredictionInput,
  type CategorySummary,
} from './types';

export const analyticsApi = {
  /**
   * Get dashboard overview data
   */
  async getDashboard(): Promise<DashboardData> {
    return apiClient.get<DashboardData>('/api/analytics/dashboard');
  },

  /**
   * Get sales velocity data for all products
   */
  async getSalesVelocity(): Promise<SalesVelocity[]> {
    return apiClient.get<SalesVelocity[]>('/api/analytics/velocity');
  },

  /**
   * Get sales velocity for a specific product
   */
  async getProductVelocity(productId: number): Promise<SalesVelocity> {
    return apiClient.get<SalesVelocity>(`/api/analytics/velocity/${productId}`);
  },

  /**
   * Get all predictions
   */
  async getPredictions(): Promise<Prediction[]> {
    return apiClient.get<Prediction[]>('/api/predictions');
  },

  /**
   * Get pending predictions
   */
  async getPendingPredictions(): Promise<Prediction[]> {
    const predictions = await this.getPredictions();
    return predictions.filter(p => p.status === 'PENDING');
  },

  /**
   * Get predictions by status
   */
  async getPredictionsByStatus(
    status: 'PENDING' | 'ORDERED' | 'IGNORED'
  ): Promise<Prediction[]> {
    const predictions = await this.getPredictions();
    return predictions.filter(p => p.status === status);
  },

  /**
   * Get a single prediction by ID
   */
  async getPrediction(id: number): Promise<Prediction> {
    return apiClient.get<Prediction>(`/api/predictions/${id}`);
  },

  /**
   * Create a new prediction
   */
  async createPrediction(data: CreatePredictionInput): Promise<Prediction> {
    return apiClient.post<Prediction>('/api/predictions', data);
  },

  /**
   * Update a prediction
   */
  async updatePrediction(id: number, data: UpdatePredictionInput): Promise<Prediction> {
    return apiClient.put<Prediction>(`/api/predictions/${id}`, data);
  },

  /**
   * Update prediction status
   */
  async updatePredictionStatus(
    id: number,
    status: 'PENDING' | 'ORDERED' | 'IGNORED'
  ): Promise<Prediction> {
    return this.updatePrediction(id, { status });
  },

  /**
   * Mark prediction as ordered
   */
  async markAsOrdered(id: number): Promise<Prediction> {
    return this.updatePredictionStatus(id, 'ORDERED');
  },

  /**
   * Mark prediction as ignored
   */
  async markAsIgnored(id: number): Promise<Prediction> {
    return this.updatePredictionStatus(id, 'IGNORED');
  },

  /**
   * Delete a prediction
   */
  async deletePrediction(id: number): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(
      `/api/predictions/${id}`
    );
  },

  /**
   * Get predictions for a specific product
   */
  async getProductPredictions(productId: number): Promise<Prediction[]> {
    const predictions = await this.getPredictions();
    return predictions.filter(p => p.product_id === productId);
  },

  /**
   * Get category performance summary
   */
  async getCategorySummary(): Promise<CategorySummary[]> {
    const dashboard = await this.getDashboard();
    return dashboard.topCategories || [];
  },

  /**
   * Generate prediction for a product based on velocity
   */
  async generatePrediction(productId: number): Promise<Prediction> {
    return apiClient.post<Prediction>('/api/analytics/generate-prediction', {
      product_id: productId,
    });
  },

  /**
   * Get products requiring immediate attention
   */
  async getUrgentRestockItems(): Promise<{
    critical: SalesVelocity[];
    warning: SalesVelocity[];
  }> {
    const velocities = await this.getSalesVelocity();

    return {
      critical: velocities.filter(v =>
        v.days_until_stockout !== null && v.days_until_stockout <= 7
      ),
      warning: velocities.filter(v =>
        v.days_until_stockout !== null &&
        v.days_until_stockout > 7 &&
        v.days_until_stockout <= 14
      ),
    };
  },

  /**
   * Get trending products (increasing demand)
   */
  async getTrendingProducts(): Promise<SalesVelocity[]> {
    const velocities = await this.getSalesVelocity();
    return velocities.filter(v => v.trend === 'INCREASING');
  },

  /**
   * Get declining products (decreasing demand)
   */
  async getDecliningProducts(): Promise<SalesVelocity[]> {
    const velocities = await this.getSalesVelocity();
    return velocities.filter(v => v.trend === 'DECREASING');
  },

  /**
   * Calculate restock recommendations
   */
  async getRestockRecommendations(): Promise<{
    product_id: number;
    product_name: string;
    current_quantity: number;
    recommended_quantity: number;
    urgency: 'critical' | 'high' | 'medium' | 'low';
    days_until_stockout: number | null;
  }[]> {
    return apiClient.get('/api/analytics/restock-recommendations');
  },

  /**
   * Get inventory health score
   */
  async getInventoryHealth(): Promise<{
    score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    issues: string[];
    recommendations: string[];
  }> {
    return apiClient.get('/api/analytics/inventory-health');
  },

  /**
   * Batch generate predictions for low stock items
   */
  async batchGeneratePredictions(): Promise<Prediction[]> {
    return apiClient.post<Prediction[]>('/api/analytics/batch-predictions');
  },
};

export default analyticsApi;
