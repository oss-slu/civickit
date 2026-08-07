// backend/src/__tests__/integration/setup.ts
//
// Runs before each integration test file. Points the app's database client at
// the test database and clears rows between cases. Schema creation happens once
// per run, in global-setup.ts.

import { Pool } from 'pg';
import { resolveTestDatabaseUrl } from './test-database-url';

// Must happen at module scope: setup files are evaluated before the test file's
// imports, and src/db reads DATABASE_URL when it is first imported. Set this any
// later and the repositories under test would open a pool against the
// developer's own database.
const databaseUrl = resolveTestDatabaseUrl();
process.env.DATABASE_URL = databaseUrl;

// Not a real credential. Set here so better-auth does not fall back to a
// generated one, for the same import-order reason as the URL above.
process.env.BETTER_AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET ?? 'test-only-fake-better-auth-secret';

// A pool of our own, so cleanup never depends on the client being tested.
const pool = new Pool({ connectionString: databaseUrl });

// Owned by PostGIS, not by the application. Drizzle keeps its applied-migration
// table in a separate `drizzle` schema, so it is already out of scope here.
const PRESERVED_TABLES = ['spatial_ref_sys'];

/**
 * Discovered rather than hardcoded: the previous fixed list still named "User"
 * long after that table became "user", so cleanup threw on every run.
 */
async function applicationTables(): Promise<string[]> {
  const { rows } = await pool.query<{ tablename: string }>(
    `SELECT tablename
       FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename <> ALL($1::text[])`,
    [PRESERVED_TABLES],
  );
  return rows.map((row) => row.tablename);
}

afterEach(async () => {
  const tables = await applicationTables();
  if (tables.length === 0) return;

  const quoted = tables.map((table) => `"${table}"`).join(', ');
  // One statement so CASCADE resolves foreign keys in any order.
  await pool.query(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`);
});

afterAll(async () => {
  await pool.end();

  // Imported lazily: a static import would load src/db before the
  // DATABASE_URL assignment above, opening its pool against the wrong database.
  const { pool: appPool } = await import('../../db');
  await appPool.end();
});
