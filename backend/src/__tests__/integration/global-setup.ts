// backend/src/__tests__/integration/global-setup.ts
//
// Runs once per `npm run test:integration`, before any test file. Builds the
// schema; per-file cleanup lives in setup.ts.

import { Client } from 'pg';
import { runMigrations } from '../../db/migrate';
import { resolveTestDatabaseUrl } from './test-database-url';

// `drizzle` holds the applied-migrations table. Dropping public without it
// would leave that table claiming everything is already applied, and the
// migrations would be skipped against an empty database.
//
// postgis_tiger_geocoder and postgis_topology install outside public too, so
// dropping public alone would leave their objects behind.
const OWNED_SCHEMAS = ['public', 'drizzle', 'tiger', 'tiger_data', 'topology'];

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

async function dropSchemas(url: string): Promise<void> {
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(
      OWNED_SCHEMAS.map((schema) => `DROP SCHEMA IF EXISTS "${schema}" CASCADE;`).join('\n') +
        '\nCREATE SCHEMA public;',
    );
  } finally {
    await client.end();
  }
}

export default async function globalSetup(): Promise<void> {
  const databaseUrl = resolveTestDatabaseUrl();

  await ensureDatabaseExists(databaseUrl);
  await dropSchemas(databaseUrl);

  // The same path production uses, so the tests cannot pass against a schema
  // that db:migrate would not produce. This is also what creates the PostGIS
  // extensions findNearby depends on.
  await runMigrations(databaseUrl);
}
