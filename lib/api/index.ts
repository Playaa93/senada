// Main API exports

// API clients
export { apiClient, ApiClient } from './client';
export { default as productsApi } from './products';
export { default as stockApi } from './stock';
export { default as suppliersApi } from './suppliers';
export { default as analyticsApi } from './analytics';

// Types
export * from './types';

// React Query hooks
export * from './hooks/useProducts';
export * from './hooks/useStock';
export * from './hooks/useSuppliers';
export * from './hooks/useAnalytics';
