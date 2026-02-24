// backend/src/prisma.ts

import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });
/*
const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}*/

export default prisma;