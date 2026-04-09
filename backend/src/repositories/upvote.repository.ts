// backend/src/repositories/upvote.repository.ts
import prisma from "../prisma";

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

  async exists(issueId: string, userId: string): Promise<boolean> {
    const upvote = await prisma.upvote.findUnique({
      where: {
        issueId_userId: {
          issueId,
          userId,
        },
      },
      select: { issueId: true },
    });

    return !!upvote;
  }
}