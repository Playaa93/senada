# API Client Quick Reference

## Installation

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

## Setup (One-time)

```tsx
// app/layout.tsx
import { QueryProvider } from '@/lib/providers/query-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

## Common Patterns

### Fetch Data
```tsx
import { useProducts } from '@/lib/api';

function Component() {
  const { data, isLoading, error } = useProducts();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{data?.map(p => <div key={p.id}>{p.name}</div>)}</div>;
}
```

### Create Record
```tsx
import { useCreateProduct } from '@/lib/api';

function Component() {
  const createProduct = useCreateProduct();

  const handleSubmit = async (formData) => {
    try {
      await createProduct.mutateAsync(formData);
      // Success!
    } catch (error) {
      // Handle error
    }
  };

  return <button onClick={handleSubmit}>Create</button>;
}
```

### Update Record
```tsx
import { useUpdateProduct } from '@/lib/api';

function Component({ productId }) {
  const updateProduct = useUpdateProduct();

  const handleUpdate = async (data) => {
    await updateProduct.mutateAsync({ id: productId, data });
  };

  return <button onClick={handleUpdate}>Update</button>;
}
```

### Delete Record
```tsx
import { useDeleteProduct } from '@/lib/api';

function Component({ productId }) {
  const deleteProduct = useDeleteProduct();

  const handleDelete = async () => {
    if (confirm('Are you sure?')) {
      await deleteProduct.mutateAsync(productId);
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

## Hook Categories

### Products
- `useProducts(filters?)` - List
- `useProduct(id)` - Single
- `useCategories()` - Categories
- `useLowStockProducts()` - Low stock
- `useCreateProduct()` - Create
- `useUpdateProduct()` - Update
- `useDeleteProduct()` - Delete

### Stock
- `useStockMovements(filters?)` - List
- `useLowStock()` - Low stock
- `useStockSummary()` - Dashboard
- `useStockAlerts()` - Alerts
- `useRecordStockIn()` - Add stock
- `useRecordStockOut()` - Remove stock
- `useRecordAdjustment()` - Adjust

### Suppliers
- `useSuppliers()` - List all
- `useActiveSuppliers()` - Active only
- `useSupplier(id)` - Single
- `useSupplierProducts(id)` - Products
- `useCreateSupplier()` - Create
- `useUpdateSupplier()` - Update
- `useToggleSupplierStatus()` - Toggle

### Analytics
- `useDashboard()` - Dashboard
- `useSalesVelocity()` - Velocity
- `usePredictions()` - Predictions
- `useRestockRecommendations()` - Recommendations
- `useInventoryHealth()` - Health
- `useCreatePrediction()` - Create
- `useUpdatePredictionStatus()` - Update status

## Filtering Examples

```tsx
// Filter products
useProducts({ category: 'Electronics' });
useProducts({ low_stock: true });
useProducts({ supplier_id: 5 });

// Filter stock movements
useStockMovements({ product_id: 10 });
useStockMovements({ movement_type: 'IN' });
useStockMovements({ start_date: '2024-01-01', end_date: '2024-01-31' });

// Filter predictions
usePredictionsByStatus('PENDING');
```

## Loading States

```tsx
const { data, isLoading, isFetching, isError, error } = useProducts();

// isLoading: Initial load
// isFetching: Refetching (background)
// isError: Request failed
// error: Error object
```

## Mutation States

```tsx
const createProduct = useCreateProduct();

// createProduct.isPending - Loading
// createProduct.isError - Failed
// createProduct.isSuccess - Succeeded
// createProduct.error - Error object
```

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8787
```

## TypeScript Types

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

## Common Tasks

### Record Stock In
```tsx
const recordStockIn = useRecordStockIn();

await recordStockIn.mutateAsync({
  productId: 1,
  quantity: 100,
  notes: 'Received shipment'
});
```

### Toggle Supplier Status
```tsx
const toggle = useToggleSupplierStatus();

await toggle.mutateAsync(supplierId);
```

### Mark Prediction as Ordered
```tsx
const markOrdered = useMarkAsOrdered();

await markOrdered.mutateAsync(predictionId);
```

### Search Products
```tsx
const { data } = useSearchProducts('laptop');
```

## Prefetching (Hover)

```tsx
const prefetch = usePrefetchProduct();

<div onMouseEnter={() => prefetch(productId)}>
  Product Card
</div>
```

## Error Handling

```tsx
import { ApiError } from '@/lib/api';

try {
  await createProduct.mutateAsync(data);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      // Validation error
    } else if (error.status === 401) {
      // Unauthorized
    }
  }
}
```

## Full Documentation

See `/lib/api/README.md` for complete documentation.
