# API Client Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐     │
│  │              React Components / Pages                 │     │
│  │                                                       │     │
│  │  - Products Page    - Dashboard                      │     │
│  │  - Stock Page       - Suppliers Page                 │     │
│  │  - Analytics Page   - Reports                        │     │
│  └───────────────────┬───────────────────────────────────┘     │
│                      │                                         │
│                      ▼                                         │
│  ┌───────────────────────────────────────────────────────┐     │
│  │           React Query Hooks (lib/api/hooks)          │     │
│  │                                                       │     │
│  │  useProducts     useStock     useSuppliers           │     │
│  │  useAnalytics    useDashboard  usePredictions        │     │
│  │                                                       │     │
│  │  - Automatic caching                                  │     │
│  │  - Loading states                                     │     │
│  │  - Error handling                                     │     │
│  │  - Auto-refetch                                       │     │
│  │  - Cache invalidation                                 │     │
│  └───────────────────┬───────────────────────────────────┘     │
│                      │                                         │
│                      ▼                                         │
│  ┌───────────────────────────────────────────────────────┐     │
│  │              API Modules (lib/api)                    │     │
│  │                                                       │     │
│  │  productsApi     stockApi      suppliersApi          │     │
│  │  analyticsApi                                         │     │
│  │                                                       │     │
│  │  - Business logic                                     │     │
│  │  - Data transformation                                │     │
│  │  - Helper methods                                     │     │
│  └───────────────────┬───────────────────────────────────┘     │
│                      │                                         │
│                      ▼                                         │
│  ┌───────────────────────────────────────────────────────┐     │
│  │            Base API Client (client.ts)                │     │
│  │                                                       │     │
│  │  - HTTP methods (GET, POST, PUT, DELETE)             │     │
│  │  - Error handling                                     │     │
│  │  - Retry logic (3 attempts, exponential backoff)     │     │
│  │  - Request/Response interceptors                     │     │
│  │  - Token management                                   │     │
│  │  - URL building                                       │     │
│  └───────────────────┬───────────────────────────────────┘     │
│                      │                                         │
└──────────────────────┼─────────────────────────────────────────┘
                       │
                       ▼  HTTP/HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                  Cloudflare Workers Backend                     │
│                                                                 │
│  /api/products      /api/stock        /api/suppliers           │
│  /api/analytics     /api/predictions                           │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐     │
│  │                    Cloudflare D1                      │     │
│  │                  (SQLite Database)                    │     │
│  └───────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Query (GET) Flow
```
Component
   │
   └─> useProducts()
          │
          └─> TanStack Query
                 │
                 ├─> Check cache (if fresh, return)
                 │
                 └─> productsApi.getProducts()
                        │
                        └─> apiClient.get('/api/products')
                               │
                               ├─> Apply request interceptors
                               ├─> Add auth token
                               ├─> Build URL with params
                               │
                               └─> fetch() → Cloudflare Workers
                                      │
                                      └─> Response
                                            │
                                            ├─> Apply response interceptors
                                            ├─> Handle errors
                                            ├─> Parse JSON
                                            │
                                            └─> Return data
                                                   │
                                                   └─> Cache in React Query
                                                          │
                                                          └─> Update component
```

### Mutation (POST/PUT/DELETE) Flow
```
Component
   │
   └─> createProduct.mutateAsync(data)
          │
          └─> TanStack Query
                 │
                 └─> productsApi.createProduct(data)
                        │
                        └─> apiClient.post('/api/products', data)
                               │
                               ├─> Apply request interceptors
                               ├─> Add auth token
                               ├─> Stringify body
                               │
                               └─> fetch() → Cloudflare Workers
                                      │
                                      └─> Response
                                            │
                                            ├─> Handle errors (retry if needed)
                                            ├─> Parse JSON
                                            │
                                            └─> Success
                                                   │
                                                   ├─> Invalidate cache
                                                   ├─> Refetch related queries
                                                   │
                                                   └─> Update component
```

## File Structure

```
lib/
├── api/
│   ├── client.ts              # Base HTTP client
│   ├── types.ts              # TypeScript types
│   ├── products.ts           # Products API
│   ├── stock.ts              # Stock API
│   ├── suppliers.ts          # Suppliers API
│   ├── analytics.ts          # Analytics API
│   ├── index.ts              # Main exports
│   ├── README.md             # Documentation
│   │
│   └── hooks/
│       ├── useProducts.ts    # Products hooks
│       ├── useStock.ts       # Stock hooks
│       ├── useSuppliers.ts   # Suppliers hooks
│       ├── useAnalytics.ts   # Analytics hooks
│       └── index.ts          # Hooks exports
│
└── providers/
    └── query-provider.tsx    # TanStack Query setup
```

## Key Components

### 1. Base Client (client.ts)
```typescript
┌─────────────────────────────────┐
│     ApiClient Class             │
├─────────────────────────────────┤
│ - baseURL                       │
│ - headers                       │
│ - token                         │
│ - interceptors                  │
├─────────────────────────────────┤
│ Methods:                        │
│ - get(path, config)             │
│ - post(path, data, config)      │
│ - put(path, data, config)       │
│ - delete(path, config)          │
│ - setToken(token)               │
│ - addRequestInterceptor()       │
│ - addResponseInterceptor()      │
└─────────────────────────────────┘
```

### 2. API Modules
```typescript
┌─────────────────────────────────┐
│     Products API                │
├─────────────────────────────────┤
│ - getProducts(filters?)         │
│ - getProduct(id)                │
│ - createProduct(data)           │
│ - updateProduct(id, data)       │
│ - deleteProduct(id)             │
│ - getCategories()               │
│ - searchProducts(query)         │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│     Stock API                   │
├─────────────────────────────────┤
│ - getStockMovements(filters?)   │
│ - recordStockIn(...)            │
│ - recordStockOut(...)           │
│ - getLowStock()                 │
│ - getStockSummary()             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│     Suppliers API               │
├─────────────────────────────────┤
│ - getSuppliers()                │
│ - getSupplier(id)               │
│ - createSupplier(data)          │
│ - toggleSupplierStatus(id)      │
│ - getSupplierProducts(id)       │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│     Analytics API               │
├─────────────────────────────────┤
│ - getDashboard()                │
│ - getSalesVelocity()            │
│ - getPredictions()              │
│ - updatePredictionStatus(...)   │
│ - getRestockRecommendations()   │
└─────────────────────────────────┘
```

### 3. React Query Hooks
```typescript
┌─────────────────────────────────┐
│     Query Hooks                 │
├─────────────────────────────────┤
│ useProducts                     │
│ useProduct                      │
│ useCategories                   │
│ useLowStockProducts            │
│                                 │
│ Returns:                        │
│ - data                          │
│ - isLoading                     │
│ - isError                       │
│ - error                         │
│ - refetch()                     │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│     Mutation Hooks              │
├─────────────────────────────────┤
│ useCreateProduct                │
│ useUpdateProduct                │
│ useDeleteProduct                │
│                                 │
│ Returns:                        │
│ - mutate()                      │
│ - mutateAsync()                 │
│ - isPending                     │
│ - isError                       │
│ - isSuccess                     │
│ - reset()                       │
└─────────────────────────────────┘
```

## Cache Strategy

```
┌─────────────────────────────────────────────────────────┐
│              React Query Cache                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ['products']                    (All products)         │
│    ├─ ['products', 'list']       (List queries)        │
│    │   ├─ filters: {category}    (Filtered)            │
│    │   └─ filters: {low_stock}   (Low stock)           │
│    │                                                    │
│    ├─ ['products', 'detail', id] (Single product)      │
│    └─ ['products', 'categories'] (Categories)          │
│                                                         │
│  ['stock']                       (Stock data)           │
│    ├─ ['stock', 'movements']     (All movements)       │
│    ├─ ['stock', 'low-stock']     (Low stock items)     │
│    └─ ['stock', 'summary']       (Dashboard summary)   │
│                                                         │
│  ['suppliers']                   (Suppliers data)       │
│    ├─ ['suppliers', 'list']      (All suppliers)       │
│    └─ ['suppliers', 'detail', id] (Single supplier)    │
│                                                         │
│  ['analytics']                   (Analytics data)       │
│    ├─ ['analytics', 'dashboard'] (Dashboard)           │
│    ├─ ['analytics', 'velocity']  (Sales velocity)      │
│    └─ ['analytics', 'predictions'] (Predictions)       │
│                                                         │
└─────────────────────────────────────────────────────────┘

Cache Timings:
- Stale Time: 30s - 5min (depends on volatility)
- Cache Time: 5 minutes
- Auto-refetch: Window focus, Reconnect, Mount
```

## Error Handling

```
Error Occurs
   │
   ├─> Network Error (timeout, no connection)
   │      │
   │      └─> Retry (3 attempts, exponential backoff)
   │             │
   │             ├─> Success → Return data
   │             └─> All failed → Throw ApiError
   │
   ├─> HTTP 4xx (Client Error)
   │      │
   │      ├─> 400 Bad Request → Validation error
   │      ├─> 401 Unauthorized → Auth error
   │      ├─> 404 Not Found → Resource error
   │      └─> 429 Rate Limit → Retry
   │
   └─> HTTP 5xx (Server Error)
          │
          └─> Retry (3 attempts)
                 │
                 ├─> Success → Return data
                 └─> Failed → Throw ApiError
```

## Authentication Flow

```
┌──────────────────────────────────────────────────────┐
│  User Login                                          │
│     │                                                │
│     └─> Receive JWT token                           │
│            │                                         │
│            └─> apiClient.setToken(token)            │
│                   │                                  │
│                   ├─> Store in localStorage         │
│                   └─> Add to all requests           │
│                                                      │
│  Subsequent Requests                                 │
│     │                                                │
│     └─> Request Interceptor                         │
│            │                                         │
│            └─> Add "Authorization: Bearer {token}"  │
│                                                      │
│  User Logout                                         │
│     │                                                │
│     └─> apiClient.clearToken()                      │
│            │                                         │
│            └─> Remove from localStorage             │
└──────────────────────────────────────────────────────┘
```

## Performance Optimizations

1. **Request Deduplication**: Same requests merged
2. **Caching**: Reduce unnecessary network calls
3. **Prefetching**: Load data before needed
4. **Optimistic Updates**: Instant UI feedback
5. **Background Refetching**: Keep data fresh
6. **Lazy Loading**: Load data on demand
7. **Retry Logic**: Handle temporary failures
8. **Garbage Collection**: Clean old cache

## Type Safety

```typescript
Component (TypeScript)
   │
   ├─> Hook return type (inferred)
   │      └─> Product[]
   │
   ├─> Mutation input type (validated)
   │      └─> CreateProductInput
   │
   └─> API response type (guaranteed)
          └─> ApiResponse<Product>
```

## Best Practices Applied

✅ Separation of Concerns (API logic separate from UI)
✅ Type Safety (100% TypeScript coverage)
✅ Error Handling (Comprehensive error management)
✅ Caching Strategy (Optimized stale/cache times)
✅ Loading States (Built-in with React Query)
✅ Retry Logic (Automatic with backoff)
✅ Token Management (Secure localStorage)
✅ Code Reusability (Shared API client)
✅ Developer Experience (DevTools, types, docs)
✅ Performance (Caching, deduplication, prefetching)
