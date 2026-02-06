// backend/src/repositories/upvote.repository.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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