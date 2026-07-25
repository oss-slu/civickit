// backend/src/db/index.ts

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

/**
 * First row, or null when there were none.
 *
 * Needed for the return type rather than the value: TypeScript types `rows[0]`
 * as the row rather than `row | undefined`, so writing `rows[0] ?? null` inline
 * infers away the null and callers lose the "not found" case. The annotation
 * here puts it back.
 */
export function first<T>(rows: T[]): T | null {
  return rows[0] ?? null;
}

export default db;
