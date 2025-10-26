// Products API methods

import { apiClient } from './client';
import {
  type Product,
  type CreateProductInput,
  type UpdateProductInput,
  type ProductFilters,
} from './types';

export const productsApi = {
  /**
   * Get all products with optional filters
   */
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    return apiClient.get<Product[]>('/api/products', {
      params: filters as Record<string, string | number | boolean>,
    });
  },

  /**
   * Get a single product by ID
   */
  async getProduct(id: number): Promise<Product> {
    return apiClient.get<Product>(`/api/products/${id}`);
  },

  /**
   * Create a new product
   */
  async createProduct(data: CreateProductInput): Promise<Product> {
    return apiClient.post<Product>('/api/products', data);
  },

  /**
   * Update an existing product
   */
  async updateProduct(id: number, data: UpdateProductInput): Promise<Product> {
    return apiClient.put<Product>(`/api/products/${id}`, data);
  },

  /**
   * Delete a product
   */
  async deleteProduct(id: number): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/api/products/${id}`);
  },

  /**
   * Get all unique product categories
   */
  async getCategories(): Promise<string[]> {
    const products = await this.getProducts();
    const categories = new Set(products.map(p => p.category));
    return Array.from(categories).sort();
  },

  /**
   * Get products with low stock
   */
  async getLowStockProducts(): Promise<Product[]> {
    return this.getProducts({ low_stock: true });
  },

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.getProducts({ category });
  },

  /**
   * Get products by supplier
   */
  async getProductsBySupplier(supplierId: number): Promise<Product[]> {
    return this.getProducts({ supplier_id: supplierId });
  },

  /**
   * Search products by name or SKU
   */
  async searchProducts(query: string): Promise<Product[]> {
    return this.getProducts({ search: query });
  },

  /**
   * Bulk update product quantities
   */
  async bulkUpdateQuantities(
    updates: { id: number; quantity: number }[]
  ): Promise<Product[]> {
    return apiClient.post<Product[]>('/api/products/bulk-update', { updates });
  },

  /**
   * Get product stock value
   */
  async getProductValue(id: number): Promise<number> {
    const product = await this.getProduct(id);
    return product.quantity * product.unit_price;
  },

  /**
   * Check if product needs restock
   */
  async needsRestock(id: number): Promise<boolean> {
    const product = await this.getProduct(id);
    return product.quantity <= product.min_quantity;
  },
};

export default productsApi;
