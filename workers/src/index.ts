import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { createDbClient, type Env } from './db/client';
import productsRouter from './routes/products';
import stockRouter from './routes/stock';
import suppliersRouter from './routes/suppliers';
import analyticsRouter from './routes/analytics';
import fragrancesRouter from './routes/fragrances';
import customersRouter from './routes/customers';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    maxAge: 86400,
    credentials: true,
  })
);

// Database client middleware
app.use('*', async (c, next) => {
  const db = createDbClient(c.env.DB);
  c.set('db', db);
  await next();
});

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'Senada Inventory API',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.route('/api/products', productsRouter);
app.route('/api/stock', stockRouter);
app.route('/api/suppliers', suppliersRouter);
app.route('/api/analytics', analyticsRouter);
app.route('/api/fragrances', fragrancesRouter);
app.route('/api/customers', customersRouter);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json(
    {
      error: 'Internal Server Error',
      message: err.message,
    },
    500
  );
});

export default app;
