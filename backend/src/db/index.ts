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

/**
 * Either the pool-backed `db` or an open transaction. Repository methods that
 * can participate in a transaction take one of these and default to `db`, so
 * existing callers are unaffected.
 *
 * A read issued on `db` from inside a transaction runs on a different
 * connection and will not see that transaction's uncommitted rows -- which is
 * why this has to be threaded through rather than assumed.
 */
export type Executor = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

export default db;
