// Type definitions for Senada Perfume Inventory App

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  supplierId?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason?: string;
  date: Date;
  userId?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  leadTime: number; // in days
  createdAt: Date;
  updatedAt: Date;
}

export interface RestockPrediction {
  id: string;
  productId: string;
  productName: string;
  suggestedQty: number;
  predictedDate: Date;
  confidence: number; // 0-100
  status: 'PENDING' | 'ORDERED' | 'DISMISSED';
  createdAt: Date;
}

export interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  lowStockAlerts: number;
  revenueThisMonth: number;
}

export interface StockHistory {
  date: string;
  stock: number;
}
