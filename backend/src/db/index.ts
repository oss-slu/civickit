// backend/src/db/index.ts
//
// Drizzle database client. Reuses the same node-postgres Pool style already used
// by the Prisma client (see ../prisma.ts) so both ORMs share identical connection
// configuration during the phased migration to Drizzle (#189).

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export { schema };
