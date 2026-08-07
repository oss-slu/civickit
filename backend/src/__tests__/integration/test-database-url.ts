// backend/src/__tests__/integration/test-database-url.ts
//
// Integration tests reset the schema and TRUNCATE between cases, so pointing
// them at a developer's working database would silently destroy it. This
// resolves the test URL and refuses to hand back anything that looks like the
// database `.env` is using.

import { existsSync, readFileSync } from 'node:fs';
import dotenv from 'dotenv';

const TEST_ENV_FILE = '.env.test.local';
const DEV_ENV_FILE = '.env';

// Matches the credentials in docker-compose.yml, against a database name that
// `npm run db:up` does not create. Nothing here is a real credential.
const DEFAULT_TEST_DATABASE_URL =
  'postgresql://postgres:password@localhost:5432/civickit_test';

/** host + database name, the parts that decide which data gets destroyed. */
function identify(url: string): string | null {
  try {
    const parsed = new URL(url);
    return `${parsed.host}${parsed.pathname}`;
  } catch {
    return null;
  }
}

function devDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (!existsSync(DEV_ENV_FILE)) return undefined;
  return dotenv.parse(readFileSync(DEV_ENV_FILE)).DATABASE_URL;
}

export function resolveTestDatabaseUrl(): string {
  // Read the dev URL before loading the test env file, so a TEST_DATABASE_URL
  // defined there can still be compared against it.
  const devUrl = devDatabaseUrl();

  if (existsSync(TEST_ENV_FILE)) {
    dotenv.config({ path: TEST_ENV_FILE });
  }

  const testUrl = process.env.TEST_DATABASE_URL ?? DEFAULT_TEST_DATABASE_URL;

  const testTarget = identify(testUrl);
  if (!testTarget) {
    throw new Error(`TEST_DATABASE_URL is not a valid connection string: ${testUrl}`);
  }

  if (devUrl && identify(devUrl) === testTarget) {
    throw new Error(
      `Refusing to run integration tests against ${testTarget}, which is the ` +
        `database DATABASE_URL points at. These tests DROP and TRUNCATE every ` +
        `table. Set TEST_DATABASE_URL to a separate database ` +
        `(see .env.test.example).`,
    );
  }

  return testUrl;
}
