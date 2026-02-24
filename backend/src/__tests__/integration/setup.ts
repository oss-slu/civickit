// backend/src/__tests__/setup.ts
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test.local' });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { execSync } from 'child_process';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not defined in .env.test")
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });


// Runs before all tests
beforeAll(async () => {
  // Set test database URL
  // Reset database and run migrations
  execSync('npx prisma migrate reset --force', {
    env: { ...process.env },
  });
  /* option to use deploy instead of reset
    execSync('npx prisma migrate deploy', {
    env: { ...process.env },
  });
  */
});

// Runs after all tests
afterAll(async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
});

// Clear database between test suites
afterEach(async () => {
  const tables = ['User', 'Issue', 'Comment', 'Upvote', 'Event', 'EventRsvp'];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }
});

export { prisma }; //exporting use for tests