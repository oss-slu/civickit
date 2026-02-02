// backend/src/repositories/login.repository.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";
import { LoginResponse } from '../types/login.types';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({adapter});

export class LoginRepository {

  async findByEmail(email: string) {

    const user = await prisma.user.findUnique({
      where: { email }
    });

    return {id: user?.id, email: user?.email, 
        name: user?.name, passwordHash: user?.passwordHash}
  }
}