// backend/src/__tests__/integration/global-setup.ts
//
// Runs once per `npm run test:integration`, before any test file. Builds the
// schema; per-file cleanup lives in setup.ts.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'pg';
import { resolveTestDatabaseUrl } from './test-database-url';

// Migrations are applied as plain SQL rather than through a migration CLI. That
// keeps the harness independent of whichever ORM owns the schema -- at the
// Drizzle cutover this only needs to point at drizzle/ instead.
const MIGRATIONS_DIR = 'prisma/migrations';

// postgis_tiger_geocoder and postgis_topology install outside public, so
// dropping public alone would leave their objects behind and the extensions
// half-present.
const OWNED_SCHEMAS = ['public', 'tiger', 'tiger_data', 'topology'];

/** `db:up` only creates the dev database, so the test one is made on demand. */
async function ensureDatabaseExists(url: string): Promise<void> {
  const databaseName = new URL(url).pathname.slice(1);

  const adminUrl = new URL(url);
  adminUrl.pathname = '/postgres';

  const client = new Client({ connectionString: adminUrl.toString() });
  try {
    await client.connect();
  } catch (error) {
    throw new Error(
      `Could not reach the Postgres server for integration tests. Is it up ` +
        `(npm run db:up)?\n${(error as Error).message}`,
    );
  }

  try {
    const { rowCount } = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [databaseName],
    );
    if (rowCount === 0) {
      // Identifiers cannot be parameterized; this one comes from our own URL.
      await client.query(`CREATE DATABASE "${databaseName.replace(/"/g, '""')}"`);
    }
  } finally {
    await client.end();
  }
}

/** Migration directories are timestamp-prefixed, so name order is apply order. */
function migrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .map((name) => join(MIGRATIONS_DIR, name, 'migration.sql'));
}

export default async function globalSetup(): Promise<void> {
  const databaseUrl = resolveTestDatabaseUrl();

  await ensureDatabaseExists(databaseUrl);

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query(
      OWNED_SCHEMAS.map((schema) => `DROP SCHEMA IF EXISTS "${schema}" CASCADE;`).join('\n') +
        '\nCREATE SCHEMA public;',
    );

    // Replaying these is also what creates the PostGIS extensions that
    // findNearby depends on.
    for (const file of migrationFiles()) {
      const sql = readFileSync(file, 'utf8');
      try {
        await client.query(sql);
      } catch (error) {
        throw new Error(`Failed applying ${file}:\n${(error as Error).message}`);
      }
    }
  } finally {
    await client.end();
  }
}
