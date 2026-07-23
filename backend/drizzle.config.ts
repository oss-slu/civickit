// backend/drizzle.config.ts
//
// drizzle-kit configuration. During the phased migration (#189) the database
// schema is still owned by Prisma migrations, so this config is used only for
// introspection / diffing (`drizzle-kit pull`, `drizzle-kit check`) rather than
// for applying migrations.

import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
