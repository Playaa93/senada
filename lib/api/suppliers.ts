// Suppliers API methods

import { apiClient } from './client';
import {
  type Supplier,
  type CreateSupplierInput,
  type UpdateSupplierInput,
  type Product,
} from './types';

export const suppliersApi = {
  /**
   * Get all suppliers
   */
  async getSuppliers(): Promise<Supplier[]> {
    return apiClient.get<Supplier[]>('/api/suppliers');
  },

  /**
   * Get active suppliers only
   */
  async getActiveSuppliers(): Promise<Supplier[]> {
    const suppliers = await this.getSuppliers();
    return suppliers.filter(s => s.is_active);
  },

  /**
   * Get inactive suppliers only
   */
  async getInactiveSuppliers(): Promise<Supplier[]> {
    const suppliers = await this.getSuppliers();
    return suppliers.filter(s => !s.is_active);
  },

  /**
   * Get a single supplier by ID
   */
  async getSupplier(id: number): Promise<Supplier> {
    return apiClient.get<Supplier>(`/api/suppliers/${id}`);
  },

  /**
   * Create a new supplier
   */
  async createSupplier(data: CreateSupplierInput): Promise<Supplier> {
    return apiClient.post<Supplier>('/api/suppliers', data);
  },

  /**
   * Update an existing supplier
   */
  async updateSupplier(id: number, data: UpdateSupplierInput): Promise<Supplier> {
    return apiClient.put<Supplier>(`/api/suppliers/${id}`, data);
  },

  /**
   * Delete a supplier
   */
  async deleteSupplier(id: number): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/api/suppliers/${id}`);
  },

  /**
   * Toggle supplier active status
   */
  async toggleSupplierStatus(id: number): Promise<Supplier> {
    const supplier = await this.getSupplier(id);
    return this.updateSupplier(id, { is_active: !supplier.is_active });
  },

  /**
   * Activate a supplier
   */
  async activateSupplier(id: number): Promise<Supplier> {
    return this.updateSupplier(id, { is_active: true });
  },

  /**
   * Deactivate a supplier
   */
  async deactivateSupplier(id: number): Promise<Supplier> {
    return this.updateSupplier(id, { is_active: false });
  },

  /**
   * Get products from a specific supplier
   */
  async getSupplierProducts(supplierId: number): Promise<Product[]> {
    return apiClient.get<Product[]>(`/api/suppliers/${supplierId}/products`);
  },

  /**
   * Search suppliers by name
   */
  async searchSuppliers(query: string): Promise<Supplier[]> {
    const suppliers = await this.getSuppliers();
    const lowerQuery = query.toLowerCase();

    return suppliers.filter(s =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.contact_person?.toLowerCase().includes(lowerQuery) ||
      s.email?.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * Get supplier statistics
   */
  async getSupplierStats(id: number): Promise<{
    totalProducts: number;
    activeProducts: number;
    totalInventoryValue: number;
    lowStockProducts: number;
  }> {
    const products = await this.getSupplierProducts(id);

    return {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.quantity > 0).length,
      totalInventoryValue: products.reduce(
        (sum, p) => sum + (p.quantity * p.unit_price),
        0
      ),
      lowStockProducts: products.filter(p => p.quantity <= p.min_quantity).length,
    };
  },

  /**
   * Validate supplier email uniqueness
   */
  async isEmailUnique(email: string, excludeId?: number): Promise<boolean> {
    const suppliers = await this.getSuppliers();
    return !suppliers.some(s =>
      s.email?.toLowerCase() === email.toLowerCase() && s.id !== excludeId
    );
  },

  /**
   * Get suppliers with products needing restock
   */
  async getSuppliersWithLowStock(): Promise<Supplier[]> {
    const suppliers = await this.getSuppliers();
    const suppliersWithLowStock: Supplier[] = [];

    for (const supplier of suppliers) {
      const products = await this.getSupplierProducts(supplier.id);
      const hasLowStock = products.some(p => p.quantity <= p.min_quantity);

      if (hasLowStock) {
        suppliersWithLowStock.push(supplier);
      }
    }

    return suppliersWithLowStock;
  },

  /**
   * Bulk create suppliers
   */
  async bulkCreateSuppliers(suppliers: CreateSupplierInput[]): Promise<Supplier[]> {
    return apiClient.post<Supplier[]>('/api/suppliers/bulk', { suppliers });
  },

  /**
   * Export suppliers data
   */
  async exportSuppliers(): Promise<Supplier[]> {
    return this.getSuppliers();
  },
};

export default suppliersApi;
