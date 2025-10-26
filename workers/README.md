# Senada Workers - Cloudflare Backend API

Cloudflare Workers backend for Senada perfume inventory management system, built with Hono v4, Drizzle ORM, and D1 database.

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono v4
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **Language**: TypeScript

## Project Structure

```
workers/
├── src/
│   ├── db/
│   │   ├── schema.ts          # Database schema definitions
│   │   └── client.ts          # Drizzle D1 client
│   ├── routes/
│   │   ├── products.ts        # Product CRUD endpoints
│   │   ├── stock.ts           # Stock movement endpoints
│   │   ├── suppliers.ts       # Supplier CRUD endpoints
│   │   └── analytics.ts       # Analytics & predictions
│   └── index.ts               # Hono app entry point
├── drizzle/                   # Generated migrations
├── wrangler.toml              # Cloudflare configuration
├── drizzle.config.ts          # Drizzle Kit configuration
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Create D1 Database

```bash
# Create production database
npx wrangler d1 create senada-db

# Update wrangler.toml with the database_id from output
```

### 3. Configure Environment Variables

```bash
# Copy example file
cp .dev.vars.example .dev.vars

# Edit .dev.vars with your Cloudflare credentials
```

### 4. Generate and Apply Migrations

```bash
# Generate migration files from schema
npm run db:generate

# Apply migrations to D1
npm run db:migrate
```

### 5. Run Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:8787`

## API Endpoints

### Products (`/api/products`)

- `GET /` - List all products (supports filtering by category, search, lowStock)
- `GET /:id` - Get single product with stock history
- `POST /` - Create new product
- `PUT /:id` - Update product
- `DELETE /:id` - Delete product
- `GET /meta/categories` - Get all unique categories

### Stock Movements (`/api/stock`)

- `GET /movements` - Get all stock movements (filterable by productId, type)
- `POST /movements` - Create stock movement (in/out/adjustment)
- `GET /low` - Get products with low stock
- `GET /summary` - Get stock summary statistics
- `POST /bulk-adjust` - Bulk stock adjustment

### Suppliers (`/api/suppliers`)

- `GET /` - List all suppliers (filterable by active status)
- `GET /:id` - Get single supplier with associated products
- `POST /` - Create new supplier
- `PUT /:id` - Update supplier
- `DELETE /:id` - Delete supplier
- `PATCH /:id/toggle` - Toggle supplier active status

### Analytics (`/api/analytics`)

- `GET /dashboard` - Dashboard overview statistics
- `GET /sales-velocity` - Calculate sales velocity
- `GET /predictions` - Get restock predictions
- `POST /predictions` - Create restock prediction
- `PATCH /predictions/:id` - Update prediction status
- `GET /profit-margins` - Calculate profit margins
- `GET /supplier-performance` - Analyze supplier performance

## Database Schema

### Products
- Core inventory items with SKU, pricing, stock levels, and supplier info

### Stock Movements
- Complete audit trail of all inventory changes (in/out/adjustments)

### Suppliers
- Vendor information with contact details and payment terms

### Restock Predictions
- AI-driven predictions for inventory replenishment

## Development Commands

```bash
# Run dev server with hot reload
npm run dev

# Generate Drizzle migrations
npm run db:generate

# Apply migrations to D1
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio

# Type check
npm run typecheck

# Deploy to production
npm run deploy
```

## API Features

- **CORS enabled** for frontend integration
- **Input validation** on all endpoints
- **Proper HTTP status codes**
- **Error handling** with descriptive messages
- **TypeScript strict mode** for type safety
- **Transaction support** for stock movements
- **Filtering and pagination** on list endpoints
- **Audit trail** via stock movements table

## Production Deployment

1. Update `wrangler.toml` with production D1 database ID
2. Set production environment variables in Cloudflare dashboard
3. Deploy:

```bash
npm run deploy
```

## Environment Variables

Required in `.dev.vars` for Drizzle Kit:

- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `CLOUDFLARE_D1_DATABASE_ID` - D1 database ID
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token with D1 permissions

## CORS Configuration

Default allowed origins:
- `http://localhost:3000`
- `http://localhost:5173`

Update in `src/index.ts` for production domains.

## License

MIT
