// backend/src/db/migrate.ts
//
// Applies pending migrations. Run with `npm run db:migrate`.

import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

const MIGRATIONS_FOLDER = './drizzle';
const EXTENSIONS_FILE = `${MIGRATIONS_FOLDER}/extensions.sql`;

export async function runMigrations(connectionString: string): Promise<void> {
  const pool = new Pool({ connectionString });

  try {
    // Before the generated migrations: nothing in schema.ts can create these,
    // and findNearby needs postgis present.
    await pool.query(readFileSync(EXTENSIONS_FILE, 'utf8'));

    await migrate(drizzle(pool), { migrationsFolder: MIGRATIONS_FOLDER });
  } finally {
    await pool.end();
  }
}

// Only run when invoked directly, so tests can import runMigrations.
if (process.argv[1]?.endsWith('migrate.ts')) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set.');
    process.exit(1);
  }

  runMigrations(connectionString)
    .then(() => console.log('Migrations applied.'))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
