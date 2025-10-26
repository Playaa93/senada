import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * Products table - Core inventory items
 */
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sku: text('sku').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // e.g., 'perfume', 'cologne', 'fragrance oil'
  buyPrice: real('buy_price').notNull(),
  sellPrice: real('sell_price').notNull(),
  currentStock: integer('current_stock').notNull().default(0),
  minStock: integer('min_stock').notNull().default(0),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  imageUrl: text('image_url'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Stock movements table - Track all inventory changes
 */
export const stockMovements = sqliteTable('stock_movements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['in', 'out', 'adjustment'] }).notNull(),
  quantity: integer('quantity').notNull(),
  previousStock: integer('previous_stock').notNull(),
  newStock: integer('new_stock').notNull(),
  reason: text('reason'), // e.g., 'purchase', 'sale', 'damaged', 'theft', 'recount'
  user: text('user'), // Who made the change
  reference: text('reference'), // Order ID, invoice number, etc.
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Suppliers table - Vendor information
 */
export const suppliers = sqliteTable('suppliers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  contactName: text('contact_name'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  paymentTerms: text('payment_terms'), // e.g., 'NET30', 'COD'
  leadTimeDays: integer('lead_time_days').default(7),
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Restock predictions table - AI/rule-based predictions for inventory replenishment
 */
export const restockPredictions = sqliteTable('restock_predictions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  predictedDate: integer('predicted_date', { mode: 'timestamp' }).notNull(),
  suggestedQuantity: integer('suggested_quantity').notNull(),
  confidenceScore: real('confidence_score').notNull(), // 0.0 to 1.0
  basedOn: text('based_on'), // JSON string: sales velocity, seasonal trends, etc.
  status: text('status', { enum: ['pending', 'ordered', 'dismissed'] })
    .notNull()
    .default('pending'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Fragrances table - Reference database from Fragrantica dataset
 */
export const fragrances = sqliteTable('fragrances', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fragrancaId: text('fragrantica_id').unique(), // External ID from Fragrantica
  name: text('name').notNull(),
  brand: text('brand').notNull(),
  gender: text('gender'), // 'for women', 'for men', 'unisex'
  year: integer('year'), // Release year
  perfumer: text('perfumer'),
  topNotes: text('top_notes'), // Comma-separated or JSON array
  middleNotes: text('middle_notes'),
  baseNotes: text('base_notes'),
  mainAccords: text('main_accords'), // JSON array of accords
  description: text('description'),
  rating: real('rating'), // Average rating
  votes: integer('votes'), // Number of votes
  imageUrl: text('image_url'),
  sillage: text('sillage'), // Projection strength
  longevity: text('longevity'), // How long it lasts
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Customers table - Client relationship management
 */
export const customers = sqliteTable('customers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  city: text('city'),
  notes: text('notes'),
  segment: text('segment', { enum: ['VIP', 'Régulier', 'Occasionnel'] })
    .notNull()
    .default('Occasionnel'),
  totalSpent: real('total_spent').notNull().default(0),
  ordersCount: integer('orders_count').notNull().default(0),
  lastOrderDate: integer('last_order_date', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Type exports for TypeScript
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type StockMovement = typeof stockMovements.$inferSelect;
export type NewStockMovement = typeof stockMovements.$inferInsert;
export type Supplier = typeof suppliers.$inferSelect;
export type NewSupplier = typeof suppliers.$inferInsert;
export type RestockPrediction = typeof restockPredictions.$inferSelect;
export type NewRestockPrediction = typeof restockPredictions.$inferInsert;
export type Fragrance = typeof fragrances.$inferSelect;
export type NewFragrance = typeof fragrances.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
