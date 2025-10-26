# Senada - API Documentation

## Overview

The Senada API is a RESTful API built with Hono.js and deployed on Cloudflare Workers. It provides endpoints for managing perfume inventory with full CRUD operations, type-safe request/response handling, and offline-first support.

**Base URL**: `https://senada.{your-subdomain}.workers.dev`
**API Version**: v1
**Protocol**: HTTPS only
**Response Format**: JSON

---

## API Conventions

### HTTP Methods

| Method | Purpose | Idempotent |
|--------|---------|------------|
| GET | Retrieve resources | ✅ Yes |
| POST | Create new resources | ❌ No |
| PUT | Update/replace resources | ✅ Yes |
| PATCH | Partially update resources | ❌ No |
| DELETE | Remove resources | ✅ Yes |

### Response Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE with no body |
| 400 | Bad Request | Invalid input data |
| 404 | Not Found | Resource doesn't exist |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Database unavailable |

### Standard Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-10-26T10:30:00.000Z",
    "requestId": "req_abc123"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "price",
        "message": "Price must be positive"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-10-26T10:30:00.000Z",
    "requestId": "req_abc123"
  }
}
```

---

## Authentication

**Current Version**: No authentication required (v1)

**Future Implementation** (v2):
```http
Authorization: Bearer {jwt_token}
```

When authentication is added:
- JWT tokens with 24-hour expiration
- Refresh token rotation
- API key support for integrations

---

## Rate Limiting

**Limits** (Cloudflare Workers):
- **Anonymous**: 100 requests/minute per IP
- **Future Authenticated**: 1000 requests/minute per user

**Headers**:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1635264000
```

**Rate Limit Exceeded Response**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

---

## Endpoints

### 1. Health Check

**Check API Status**

```http
GET /api/health
```

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "timestamp": "2025-10-26T10:30:00.000Z",
    "database": {
      "connected": true,
      "latency": 12
    }
  }
}
```

**Usage**:
```typescript
const response = await fetch('/api/health');
const { data } = await response.json();
console.log(data.status); // "healthy"
```

---

### 2. List Perfumes

**Get all perfumes with optional filtering and pagination**

```http
GET /api/perfumes
```

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (1-indexed) |
| `limit` | number | 50 | Items per page (1-100) |
| `sort` | string | created_at | Sort field: `name`, `brand`, `price`, `quantity`, `created_at` |
| `order` | string | desc | Sort order: `asc`, `desc` |
| `brand` | string | - | Filter by brand (case-insensitive) |
| `search` | string | - | Search in name and brand |
| `minPrice` | number | - | Minimum price filter |
| `maxPrice` | number | - | Maximum price filter |
| `inStock` | boolean | - | Filter in-stock items (quantity > 0) |

**Example Request**:
```http
GET /api/perfumes?page=1&limit=20&brand=Chanel&inStock=true&sort=price&order=asc
```

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "perf_abc123",
        "name": "Chanel No. 5",
        "brand": "Chanel",
        "quantity": 15,
        "price": 120.50,
        "notes": "Classic floral fragrance",
        "size": "100ml",
        "createdAt": "2025-10-26T10:00:00.000Z",
        "updatedAt": "2025-10-26T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**TypeScript Types**:
```typescript
interface Perfume {
  id: string;
  name: string;
  brand: string;
  quantity: number;
  price: number;
  notes?: string;
  size?: string;
  createdAt: string;
  updatedAt: string;
}

interface PerfumeListResponse {
  success: true;
  data: {
    items: Perfume[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}
```

**Usage Example**:
```typescript
// Fetch with filtering
const params = new URLSearchParams({
  brand: 'Dior',
  inStock: 'true',
  sort: 'name',
  order: 'asc'
});

const response = await fetch(`/api/perfumes?${params}`);
const { data } = await response.json();

data.items.forEach(perfume => {
  console.log(`${perfume.name} - $${perfume.price}`);
});
```

---

### 3. Get Single Perfume

**Retrieve a specific perfume by ID**

```http
GET /api/perfumes/:id
```

**Path Parameters**:
- `id` (required): Perfume ID

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "id": "perf_abc123",
    "name": "Chanel No. 5",
    "brand": "Chanel",
    "quantity": 15,
    "price": 120.50,
    "notes": "Classic floral fragrance",
    "size": "100ml",
    "createdAt": "2025-10-26T10:00:00.000Z",
    "updatedAt": "2025-10-26T10:00:00.000Z"
  }
}
```

**Error Response** `404 Not Found`:
```json
{
  "success": false,
  "error": {
    "code": "PERFUME_NOT_FOUND",
    "message": "Perfume with ID 'perf_abc123' not found"
  }
}
```

**TypeScript Usage**:
```typescript
async function getPerfume(id: string): Promise<Perfume> {
  const response = await fetch(`/api/perfumes/${id}`);

  if (!response.ok) {
    throw new Error(`Perfume not found: ${id}`);
  }

  const { data } = await response.json();
  return data;
}
```

---

### 4. Create Perfume

**Add a new perfume to inventory**

```http
POST /api/perfumes
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Dior Sauvage",
  "brand": "Dior",
  "quantity": 20,
  "price": 95.00,
  "notes": "Fresh and spicy",
  "size": "100ml"
}
```

**Validation Schema** (Zod):
```typescript
const createPerfumeSchema = z.object({
  name: z.string().min(1).max(200),
  brand: z.string().min(1).max(100),
  quantity: z.number().int().min(0).max(999999),
  price: z.number().positive().max(999999.99),
  notes: z.string().max(1000).optional(),
  size: z.string().max(50).optional()
});
```

**Field Constraints**:

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | ✅ Yes | 1-200 chars |
| brand | string | ✅ Yes | 1-100 chars |
| quantity | number | ✅ Yes | Integer, 0-999999 |
| price | number | ✅ Yes | Positive, max 999999.99 |
| notes | string | ❌ No | Max 1000 chars |
| size | string | ❌ No | Max 50 chars (e.g., "100ml") |

**Response** `201 Created`:
```json
{
  "success": true,
  "data": {
    "id": "perf_xyz789",
    "name": "Dior Sauvage",
    "brand": "Dior",
    "quantity": 20,
    "price": 95.00,
    "notes": "Fresh and spicy",
    "size": "100ml",
    "createdAt": "2025-10-26T10:30:00.000Z",
    "updatedAt": "2025-10-26T10:30:00.000Z"
  }
}
```

**Error Response** `422 Unprocessable Entity`:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "price",
        "message": "Number must be greater than 0"
      },
      {
        "field": "name",
        "message": "String must contain at least 1 character(s)"
      }
    ]
  }
}
```

**TypeScript Usage**:
```typescript
interface CreatePerfumeInput {
  name: string;
  brand: string;
  quantity: number;
  price: number;
  notes?: string;
  size?: string;
}

async function createPerfume(input: CreatePerfumeInput): Promise<Perfume> {
  const response = await fetch('/api/perfumes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error.message);
  }

  const { data } = await response.json();
  return data;
}
```

---

### 5. Update Perfume

**Update an existing perfume (full replacement)**

```http
PUT /api/perfumes/:id
Content-Type: application/json
```

**Path Parameters**:
- `id` (required): Perfume ID

**Request Body** (all fields required):
```json
{
  "name": "Dior Sauvage Elixir",
  "brand": "Dior",
  "quantity": 15,
  "price": 130.00,
  "notes": "Concentrated aromatic",
  "size": "60ml"
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "id": "perf_xyz789",
    "name": "Dior Sauvage Elixir",
    "brand": "Dior",
    "quantity": 15,
    "price": 130.00,
    "notes": "Concentrated aromatic",
    "size": "60ml",
    "createdAt": "2025-10-26T10:30:00.000Z",
    "updatedAt": "2025-10-26T11:00:00.000Z"
  }
}
```

**Error Response** `404 Not Found`:
```json
{
  "success": false,
  "error": {
    "code": "PERFUME_NOT_FOUND",
    "message": "Perfume with ID 'perf_xyz789' not found"
  }
}
```

---

### 6. Partially Update Perfume

**Update specific fields of a perfume**

```http
PATCH /api/perfumes/:id
Content-Type: application/json
```

**Path Parameters**:
- `id` (required): Perfume ID

**Request Body** (partial update):
```json
{
  "quantity": 25,
  "price": 140.00
}
```

**Allowed Fields**:
- Any subset of: `name`, `brand`, `quantity`, `price`, `notes`, `size`

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "id": "perf_xyz789",
    "name": "Dior Sauvage Elixir",
    "brand": "Dior",
    "quantity": 25,
    "price": 140.00,
    "notes": "Concentrated aromatic",
    "size": "60ml",
    "createdAt": "2025-10-26T10:30:00.000Z",
    "updatedAt": "2025-10-26T11:15:00.000Z"
  }
}
```

**TypeScript Usage**:
```typescript
async function updateQuantity(id: string, quantity: number): Promise<Perfume> {
  const response = await fetch(`/api/perfumes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity })
  });

  const { data } = await response.json();
  return data;
}
```

---

### 7. Delete Perfume

**Remove a perfume from inventory**

```http
DELETE /api/perfumes/:id
```

**Path Parameters**:
- `id` (required): Perfume ID

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "id": "perf_xyz789",
    "deleted": true
  }
}
```

**Error Response** `404 Not Found`:
```json
{
  "success": false,
  "error": {
    "code": "PERFUME_NOT_FOUND",
    "message": "Perfume with ID 'perf_xyz789' not found"
  }
}
```

**TypeScript Usage**:
```typescript
async function deletePerfume(id: string): Promise<void> {
  const response = await fetch(`/api/perfumes/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error(`Failed to delete perfume: ${id}`);
  }
}
```

---

### 8. Bulk Operations

**Perform bulk create/update/delete operations**

```http
POST /api/perfumes/bulk
Content-Type: application/json
```

**Request Body**:
```json
{
  "operation": "create",
  "items": [
    {
      "name": "Perfume 1",
      "brand": "Brand A",
      "quantity": 10,
      "price": 50.00
    },
    {
      "name": "Perfume 2",
      "brand": "Brand B",
      "quantity": 5,
      "price": 75.00
    }
  ]
}
```

**Operations**:
- `create`: Insert multiple perfumes
- `update`: Update multiple perfumes
- `delete`: Delete multiple perfumes by IDs

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "operation": "create",
    "processed": 2,
    "succeeded": 2,
    "failed": 0,
    "results": [
      { "id": "perf_1", "status": "created" },
      { "id": "perf_2", "status": "created" }
    ]
  }
}
```

---

### 9. Analytics Endpoints

**Get inventory statistics**

```http
GET /api/analytics/summary
```

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "totalItems": 150,
    "totalValue": 18750.00,
    "lowStockItems": 12,
    "outOfStockItems": 3,
    "topBrands": [
      { "brand": "Chanel", "count": 25, "value": 3125.00 },
      { "brand": "Dior", "count": 20, "value": 2400.00 }
    ]
  }
}
```

**Get brand statistics**

```http
GET /api/analytics/brands
```

**Response** `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "brand": "Chanel",
      "totalItems": 25,
      "totalQuantity": 150,
      "averagePrice": 125.00,
      "totalValue": 3125.00
    }
  ]
}
```

---

## Error Handling

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Input validation failed | 422 |
| `PERFUME_NOT_FOUND` | Perfume ID doesn't exist | 404 |
| `DATABASE_ERROR` | Database operation failed | 500 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Unexpected server error | 500 |

### Error Response Structure

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
    retryAfter?: number; // For rate limiting
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}
```

### Handling Errors in TypeScript

```typescript
async function handleApiCall<T>(
  fetchFn: () => Promise<Response>
): Promise<T> {
  try {
    const response = await fetchFn();
    const json = await response.json();

    if (!response.ok) {
      throw new ApiError(json.error);
    }

    return json.data;
  } catch (error) {
    if (error instanceof ApiError) {
      // Handle known API errors
      console.error(`API Error: ${error.code}`, error.message);
    } else {
      // Handle network errors
      console.error('Network error:', error);
    }
    throw error;
  }
}

class ApiError extends Error {
  code: string;
  details?: any;

  constructor(error: ErrorResponse['error']) {
    super(error.message);
    this.code = error.code;
    this.details = error.details;
  }
}
```

---

## Request/Response Examples

### Example 1: Create Perfume with Validation

```typescript
// ❌ Invalid request
const invalidPerfume = {
  name: "",           // Too short
  brand: "Dior",
  quantity: -5,       // Negative
  price: 0            // Not positive
};

const response1 = await fetch('/api/perfumes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(invalidPerfume)
});

// Response: 422 Unprocessable Entity
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      { "field": "name", "message": "String must contain at least 1 character(s)" },
      { "field": "quantity", "message": "Number must be greater than or equal to 0" },
      { "field": "price", "message": "Number must be greater than 0" }
    ]
  }
}

// ✅ Valid request
const validPerfume = {
  name: "Dior Sauvage",
  brand: "Dior",
  quantity: 20,
  price: 95.00,
  notes: "Fresh and spicy",
  size: "100ml"
};

const response2 = await fetch('/api/perfumes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(validPerfume)
});

// Response: 201 Created
{
  "success": true,
  "data": {
    "id": "perf_xyz789",
    ...validPerfume,
    "createdAt": "2025-10-26T10:30:00.000Z",
    "updatedAt": "2025-10-26T10:30:00.000Z"
  }
}
```

### Example 2: Paginated List with Filters

```typescript
// Fetch Chanel perfumes, sorted by price (ascending)
const params = new URLSearchParams({
  brand: 'Chanel',
  sort: 'price',
  order: 'asc',
  page: '1',
  limit: '10'
});

const response = await fetch(`/api/perfumes?${params}`);
const { data } = await response.json();

console.log(`Found ${data.pagination.total} Chanel perfumes`);
console.log(`Page ${data.pagination.page} of ${data.pagination.totalPages}`);

data.items.forEach(perfume => {
  console.log(`${perfume.name}: $${perfume.price}`);
});
```

### Example 3: Optimistic UI Update

```typescript
// Optimistic update for better UX
async function updatePerfumeOptimistically(
  id: string,
  updates: Partial<Perfume>
) {
  // 1. Update UI immediately
  updateLocalState(id, updates);

  try {
    // 2. Send to server
    const response = await fetch(`/api/perfumes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    const { data } = await response.json();

    // 3. Confirm with server data
    updateLocalState(id, data);
  } catch (error) {
    // 4. Rollback on error
    rollbackLocalState(id);
    throw error;
  }
}
```

---

## Caching Strategy

### Cache Headers

```http
# GET /api/perfumes
Cache-Control: public, max-age=60, stale-while-revalidate=300

# GET /api/perfumes/:id
Cache-Control: public, max-age=300, stale-while-revalidate=600

# POST/PUT/PATCH/DELETE
Cache-Control: no-cache
```

### ETags for Conditional Requests

```http
# First request
GET /api/perfumes/123
ETag: "abc123xyz"

# Subsequent request
GET /api/perfumes/123
If-None-Match: "abc123xyz"

# Response: 304 Not Modified (if unchanged)
```

---

## CORS Configuration

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

For production, restrict origins:
```typescript
const allowedOrigins = [
  'https://senada.app',
  'https://www.senada.app'
];
```

---

## API Client TypeScript SDK

### Complete Type-Safe Client

```typescript
// api-client.ts
import { z } from 'zod';

const perfumeSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string(),
  quantity: z.number(),
  price: z.number(),
  notes: z.string().optional(),
  size: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type Perfume = z.infer<typeof perfumeSchema>;

export class SenadaApiClient {
  constructor(private baseUrl: string = '/api') {}

  async listPerfumes(params?: {
    page?: number;
    limit?: number;
    brand?: string;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }) {
    const query = new URLSearchParams(
      Object.entries(params || {}).map(([k, v]) => [k, String(v)])
    );

    const response = await fetch(`${this.baseUrl}/perfumes?${query}`);
    const json = await response.json();

    return json.data;
  }

  async getPerfume(id: string): Promise<Perfume> {
    const response = await fetch(`${this.baseUrl}/perfumes/${id}`);
    const json = await response.json();

    return perfumeSchema.parse(json.data);
  }

  async createPerfume(input: Omit<Perfume, 'id' | 'createdAt' | 'updatedAt'>): Promise<Perfume> {
    const response = await fetch(`${this.baseUrl}/perfumes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });

    const json = await response.json();
    return perfumeSchema.parse(json.data);
  }

  async updatePerfume(id: string, updates: Partial<Perfume>): Promise<Perfume> {
    const response = await fetch(`${this.baseUrl}/perfumes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    const json = await response.json();
    return perfumeSchema.parse(json.data);
  }

  async deletePerfume(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/perfumes/${id}`, {
      method: 'DELETE'
    });
  }
}

// Usage
const api = new SenadaApiClient();

const perfumes = await api.listPerfumes({ brand: 'Chanel' });
const perfume = await api.getPerfume('perf_123');
const newPerfume = await api.createPerfume({ name: 'Test', ... });
```

---

## WebSocket Support (Future)

**Real-time inventory updates** (planned for v2):

```typescript
// Connect to WebSocket
const ws = new WebSocket('wss://senada.workers.dev/api/ws');

// Subscribe to inventory changes
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'inventory'
}));

// Receive updates
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);

  if (update.type === 'PERFUME_UPDATED') {
    console.log('Perfume updated:', update.data);
  }
};
```

---

## Testing the API

### Using cURL

```bash
# Health check
curl https://senada.workers.dev/api/health

# List perfumes
curl "https://senada.workers.dev/api/perfumes?brand=Chanel&limit=5"

# Create perfume
curl -X POST https://senada.workers.dev/api/perfumes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chanel No. 5",
    "brand": "Chanel",
    "quantity": 15,
    "price": 120.50
  }'

# Update perfume
curl -X PATCH https://senada.workers.dev/api/perfumes/perf_123 \
  -H "Content-Type: application/json" \
  -d '{"quantity": 20}'

# Delete perfume
curl -X DELETE https://senada.workers.dev/api/perfumes/perf_123
```

### Using Postman

Import this collection:
```json
{
  "info": { "name": "Senada API", "schema": "v2.1.0" },
  "item": [
    {
      "name": "List Perfumes",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/perfumes"
      }
    },
    {
      "name": "Create Perfume",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/perfumes",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Test Perfume\",\n  \"brand\": \"Test Brand\",\n  \"quantity\": 10,\n  \"price\": 50.00\n}"
        }
      }
    }
  ]
}
```

---

## Performance Considerations

### Request Optimization

1. **Pagination**: Always use pagination for large datasets
2. **Field Selection**: Future support for sparse fieldsets (`?fields=id,name,price`)
3. **Compression**: Gzip/Brotli enabled for responses >1KB
4. **Batch Operations**: Use bulk endpoints for multiple operations

### Response Times

| Endpoint | Target | Actual (Edge) |
|----------|--------|---------------|
| GET /health | <50ms | ~15ms |
| GET /perfumes | <200ms | ~120ms |
| POST /perfumes | <300ms | ~180ms |
| PATCH /perfumes/:id | <250ms | ~150ms |

---

## Changelog

### v1.0.0 (2025-10-26)
- Initial API release
- CRUD operations for perfumes
- Pagination and filtering
- Analytics endpoints
- Bulk operations

### Future Versions
- **v1.1.0**: Authentication, user management
- **v1.2.0**: WebSocket real-time updates
- **v1.3.0**: Advanced search, full-text
- **v2.0.0**: Multi-tenant support, API versioning
