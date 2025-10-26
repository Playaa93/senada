import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export type Env = {
  DB: D1Database;
};

export function createDbClient(db: D1Database) {
  return drizzle(db, { schema });
}

export type DbClient = ReturnType<typeof createDbClient>;
