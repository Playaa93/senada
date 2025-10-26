// TypeScript types matching the Cloudflare Workers backend

// Product types
export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  category: string;
  quantity: number;
  min_quantity: number;
  unit_price: number;
  supplier_id: number | null;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
}

export interface CreateProductInput {
  name: string;
  sku: string;
  description?: string;
  category: string;
  quantity: number;
  min_quantity: number;
  unit_price: number;
  supplier_id?: number;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export interface ProductFilters {
  category?: string;
  supplier_id?: number;
  low_stock?: boolean;
  search?: string;
}

// Supplier types
export interface Supplier {
  id: number;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSupplierInput {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active?: boolean;
}

export interface UpdateSupplierInput extends Partial<CreateSupplierInput> {}

// Stock Movement types
export interface StockMovement {
  id: number;
  product_id: number;
  movement_type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  notes: string | null;
  created_at: string;
  product?: Product;
}

export interface CreateStockMovementInput {
  product_id: number;
  movement_type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  notes?: string;
}

export interface StockMovementFilters {
  product_id?: number;
  movement_type?: 'IN' | 'OUT' | 'ADJUSTMENT';
  start_date?: string;
  end_date?: string;
}

// Prediction types
export interface Prediction {
  id: number;
  product_id: number;
  predicted_quantity: number;
  confidence_score: number;
  prediction_date: string;
  suggested_order_date: string | null;
  status: 'PENDING' | 'ORDERED' | 'IGNORED';
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface CreatePredictionInput {
  product_id: number;
  predicted_quantity: number;
  confidence_score: number;
  prediction_date: string;
  suggested_order_date?: string;
  status?: 'PENDING' | 'ORDERED' | 'IGNORED';
}

export interface UpdatePredictionInput extends Partial<CreatePredictionInput> {}

// Analytics types
export interface DashboardData {
  totalProducts: number;
  lowStockItems: number;
  totalValue: number;
  recentMovements: StockMovement[];
  topCategories: CategorySummary[];
  stockAlerts: Product[];
}

export interface CategorySummary {
  category: string;
  count: number;
  totalValue: number;
}

export interface SalesVelocity {
  product_id: number;
  product_name: string;
  daily_velocity: number;
  weekly_velocity: number;
  monthly_velocity: number;
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  days_until_stockout: number | null;
}

export interface StockSummary {
  total_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_inventory_value: number;
  movements_last_30_days: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
