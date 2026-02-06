// backend/src/repositories/upvote.repository.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({adapter});

export class UpvoteRepository {
  async createUpvote(issueId: string, userId: string) {
    return prisma.upvote.create({
      data: {
        issueId,
        userId,
      },
    });
  }

  async deleteUpvote(issueId: string, userId: string) {
    return prisma.upvote.delete({
      where: {
        issueId_userId: {
          issueId,
          userId,
        },
      },
    });
  }

  async countUpvotes(issueId: string) {
    return prisma.upvote.count({
      where: { issueId },
    });
  }
}