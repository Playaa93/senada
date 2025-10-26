# API Client Layer Documentation

Type-safe API client layer for connecting the Next.js frontend with the Cloudflare Workers backend.

## Features

- **Type-Safe**: Full TypeScript support with backend schema types
- **Error Handling**: Comprehensive error handling with custom ApiError class
- **Automatic Retries**: Configurable retry logic with exponential backoff
- **Request/Response Interceptors**: Middleware support for auth, logging, etc.
- **Token Management**: Built-in authentication token handling
- **React Query Integration**: Optimized hooks with caching and refetching
- **Loading States**: Built-in loading, error, and success states
- **Optimistic Updates**: Automatic cache invalidation on mutations

## Directory Structure

```
lib/api/
├── client.ts              # Base API client
├── types.ts              # TypeScript types from backend
├── products.ts           # Products API methods
├── stock.ts              # Stock API methods
├── suppliers.ts          # Suppliers API methods
├── analytics.ts          # Analytics API methods
├── hooks/
│   ├── useProducts.ts    # Products React Query hooks
│   ├── useStock.ts       # Stock React Query hooks
│   ├── useSuppliers.ts   # Suppliers React Query hooks
│   └── useAnalytics.ts   # Analytics React Query hooks
└── index.ts              # Main exports
```

## Installation

1. Install dependencies:
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

2. Configure environment:
```bash
cp .env.example .env.local
```

3. Update `NEXT_PUBLIC_API_URL` in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8787
```

## Setup

### 1. Wrap your app with QueryProvider

```tsx
// app/layout.tsx
import { QueryProvider } from '@/lib/providers/query-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
```

## Usage

### Products API

```tsx
'use client';

import { useProducts, useCreateProduct, useUpdateProduct } from '@/lib/api';

function ProductsPage() {
  // Fetch products
  const { data: products, isLoading, error } = useProducts();

  // Create product mutation
  const createProduct = useCreateProduct();

  // Update product mutation
  const updateProduct = useUpdateProduct();

  const handleCreate = async () => {
    await createProduct.mutateAsync({
      name: 'New Product',
      sku: 'SKU-001',
      category: 'Electronics',
      quantity: 100,
      min_quantity: 10,
      unit_price: 29.99,
    });
  };

  const handleUpdate = async (id: number) => {
    await updateProduct.mutateAsync({
      id,
      data: { quantity: 150 },
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {products?.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### Stock API

```tsx
import { useStockMovements, useRecordStockIn } from '@/lib/api';

function StockPage() {
  const { data: movements } = useStockMovements();
  const recordStockIn = useRecordStockIn();

  const handleStockIn = async (productId: number) => {
    await recordStockIn.mutateAsync({
      productId,
      quantity: 50,
      notes: 'Received shipment',
    });
  };

  return <div>{/* UI */}</div>;
}
```

### Suppliers API

```tsx
import { useSuppliers, useCreateSupplier } from '@/lib/api';

function SuppliersPage() {
  const { data: suppliers } = useSuppliers();
  const createSupplier = useCreateSupplier();

  const handleCreate = async () => {
    await createSupplier.mutateAsync({
      name: 'New Supplier',
      email: 'supplier@example.com',
      phone: '123-456-7890',
      is_active: true,
    });
  };

  return <div>{/* UI */}</div>;
}
```

### Analytics API

```tsx
import {
  useDashboard,
  useSalesVelocity,
  usePredictions
} from '@/lib/api';

function DashboardPage() {
  const { data: dashboard } = useDashboard();
  const { data: velocity } = useSalesVelocity();
  const { data: predictions } = usePredictions();

  return (
    <div>
      <h1>Total Products: {dashboard?.totalProducts}</h1>
      <h2>Low Stock: {dashboard?.lowStockItems}</h2>
      {/* More dashboard UI */}
    </div>
  );
}
```

## Advanced Usage

### Filtering and Search

```tsx
// Filter products by category
const { data } = useProducts({ category: 'Electronics' });

// Get low stock products
const { data } = useProducts({ low_stock: true });

// Search products
const { data } = useSearchProducts('laptop');

// Filter stock movements by date
const { data } = useStockMovements({
  start_date: '2024-01-01',
  end_date: '2024-01-31',
});
```

### Optimistic Updates

```tsx
const updateProduct = useUpdateProduct();

// Optimistic update with manual cache manipulation
const handleUpdate = async (id: number, newData: UpdateProductInput) => {
  await updateProduct.mutateAsync(
    { id, data: newData },
    {
      onMutate: async (variables) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: productKeys.detail(id) });

        // Snapshot previous value
        const previous = queryClient.getQueryData(productKeys.detail(id));

        // Optimistically update cache
        queryClient.setQueryData(productKeys.detail(id), (old: Product) => ({
          ...old,
          ...newData,
        }));

        return { previous };
      },
      onError: (err, variables, context) => {
        // Rollback on error
        queryClient.setQueryData(productKeys.detail(id), context?.previous);
      },
    }
  );
};
```

### Prefetching

```tsx
import { usePrefetchProduct } from '@/lib/api';

function ProductCard({ id }: { id: number }) {
  const prefetchProduct = usePrefetchProduct();

  return (
    <div onMouseEnter={() => prefetchProduct(id)}>
      {/* Card content */}
    </div>
  );
}
```

### Custom Interceptors

```tsx
import { apiClient } from '@/lib/api';

// Add request interceptor for logging
apiClient.addRequestInterceptor((config) => {
  console.log('Request:', config);
  return config;
});

// Add response interceptor for custom error handling
apiClient.addResponseInterceptor((response) => {
  if (!response.ok) {
    console.error('Response error:', response.status);
  }
  return response;
});
```

### Token Management

```tsx
import { apiClient } from '@/lib/api';

// Set authentication token
apiClient.setToken('your-jwt-token');

// Clear token (logout)
apiClient.clearToken();

// Get current token
const token = apiClient.getToken();
```

## API Methods Reference

### Products API (`productsApi`)

- `getProducts(filters?)` - Get all products
- `getProduct(id)` - Get single product
- `createProduct(data)` - Create product
- `updateProduct(id, data)` - Update product
- `deleteProduct(id)` - Delete product
- `getCategories()` - Get categories
- `getLowStockProducts()` - Get low stock items
- `searchProducts(query)` - Search products

### Stock API (`stockApi`)

- `getStockMovements(filters?)` - Get movements
- `createStockMovement(data)` - Create movement
- `recordStockIn(productId, quantity, notes?)` - Record stock in
- `recordStockOut(productId, quantity, notes?)` - Record stock out
- `recordAdjustment(productId, quantity, notes?)` - Adjust stock
- `getLowStock()` - Get low stock products
- `getStockSummary()` - Get summary

### Suppliers API (`suppliersApi`)

- `getSuppliers()` - Get all suppliers
- `getSupplier(id)` - Get single supplier
- `createSupplier(data)` - Create supplier
- `updateSupplier(id, data)` - Update supplier
- `deleteSupplier(id)` - Delete supplier
- `toggleSupplierStatus(id)` - Toggle active status
- `getSupplierProducts(supplierId)` - Get supplier's products

### Analytics API (`analyticsApi`)

- `getDashboard()` - Get dashboard data
- `getSalesVelocity()` - Get velocity data
- `getPredictions()` - Get predictions
- `createPrediction(data)` - Create prediction
- `updatePredictionStatus(id, status)` - Update status
- `getRestockRecommendations()` - Get recommendations

## Error Handling

```tsx
import { ApiError } from '@/lib/api';

function Component() {
  const { data, error } = useProducts();

  if (error) {
    if (error instanceof ApiError) {
      console.log('API Error:', error.status, error.message);
    }
  }

  // Mutation error handling
  const createProduct = useCreateProduct();

  const handleCreate = async () => {
    try {
      await createProduct.mutateAsync(data);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400) {
          console.log('Validation error');
        } else if (error.status === 401) {
          console.log('Unauthorized');
        }
      }
    }
  };
}
```

## React Query DevTools

DevTools are automatically enabled in development mode. Access them via the floating button in the bottom-right corner.

## Best Practices

1. **Use hooks for data fetching** instead of direct API calls
2. **Enable/disable queries** conditionally to avoid unnecessary requests
3. **Use optimistic updates** for better UX
4. **Prefetch data** on hover for instant navigation
5. **Handle errors gracefully** with proper UI feedback
6. **Set appropriate staleTime** based on data volatility
7. **Use query keys consistently** for cache management

## Performance Optimization

- Queries cache for 1 minute by default
- Automatic refetch on window focus
- Retry logic with exponential backoff
- Request deduplication
- Garbage collection after 5 minutes
- DevTools for cache inspection

## TypeScript Support

All API methods and hooks are fully typed with TypeScript. Import types from the main API module:

```tsx
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  Supplier,
  StockMovement,
  Prediction
} from '@/lib/api';
```

## License

MIT
