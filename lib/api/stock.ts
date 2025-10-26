// Stock API methods

import { apiClient } from './client';
import {
  type StockMovement,
  type CreateStockMovementInput,
  type StockMovementFilters,
  type Product,
  type StockSummary,
} from './types';

export const stockApi = {
  /**
   * Get all stock movements with optional filters
   */
  async getStockMovements(filters?: StockMovementFilters): Promise<StockMovement[]> {
    return apiClient.get<StockMovement[]>('/api/stock/movements', {
      params: filters as Record<string, string | number | boolean>,
    });
  },

  /**
   * Get stock movements for a specific product
   */
  async getProductMovements(productId: number): Promise<StockMovement[]> {
    return this.getStockMovements({ product_id: productId });
  },

  /**
   * Create a new stock movement
   */
  async createStockMovement(data: CreateStockMovementInput): Promise<StockMovement> {
    return apiClient.post<StockMovement>('/api/stock/movements', data);
  },

  /**
   * Record stock IN movement
   */
  async recordStockIn(
    productId: number,
    quantity: number,
    notes?: string
  ): Promise<StockMovement> {
    return this.createStockMovement({
      product_id: productId,
      movement_type: 'IN',
      quantity,
      notes,
    });
  },

  /**
   * Record stock OUT movement
   */
  async recordStockOut(
    productId: number,
    quantity: number,
    notes?: string
  ): Promise<StockMovement> {
    return this.createStockMovement({
      product_id: productId,
      movement_type: 'OUT',
      quantity,
      notes,
    });
  },

  /**
   * Record stock adjustment
   */
  async recordAdjustment(
    productId: number,
    quantity: number,
    notes?: string
  ): Promise<StockMovement> {
    return this.createStockMovement({
      product_id: productId,
      movement_type: 'ADJUSTMENT',
      quantity,
      notes,
    });
  },

  /**
   * Get products with low stock
   */
  async getLowStock(): Promise<Product[]> {
    return apiClient.get<Product[]>('/api/stock/low-stock');
  },

  /**
   * Get stock summary/dashboard data
   */
  async getStockSummary(): Promise<StockSummary> {
    return apiClient.get<StockSummary>('/api/stock/summary');
  },

  /**
   * Get stock movements by type
   */
  async getMovementsByType(
    movementType: 'IN' | 'OUT' | 'ADJUSTMENT'
  ): Promise<StockMovement[]> {
    return this.getStockMovements({ movement_type: movementType });
  },

  /**
   * Get stock movements within date range
   */
  async getMovementsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<StockMovement[]> {
    return this.getStockMovements({
      start_date: startDate,
      end_date: endDate,
    });
  },

  /**
   * Get recent stock movements (last N days)
   */
  async getRecentMovements(days: number = 7): Promise<StockMovement[]> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]!;

    return this.getMovementsByDateRange(startDate, endDate!);
  },

  /**
   * Get total stock value
   */
  async getTotalStockValue(): Promise<number> {
    const summary = await this.getStockSummary();
    return summary.total_inventory_value;
  },

  /**
   * Batch create stock movements
   */
  async batchCreateMovements(
    movements: CreateStockMovementInput[]
  ): Promise<StockMovement[]> {
    return apiClient.post<StockMovement[]>('/api/stock/movements/batch', {
      movements,
    });
  },

  /**
   * Get stock alerts (out of stock + low stock)
   */
  async getStockAlerts(): Promise<{
    outOfStock: Product[];
    lowStock: Product[];
  }> {
    const lowStockItems = await this.getLowStock();

    return {
      outOfStock: lowStockItems.filter(p => p.quantity === 0),
      lowStock: lowStockItems.filter(p => p.quantity > 0),
    };
  },

  /**
   * Calculate stock turnover rate for a product
   */
  async getStockTurnover(productId: number, days: number = 30): Promise<number> {
    const movements = await this.getProductMovements(productId);
    const outMovements = movements.filter(m => m.movement_type === 'OUT');

    const totalOut = outMovements.reduce((sum, m) => sum + m.quantity, 0);
    return totalOut / days;
  },
};

export default stockApi;
