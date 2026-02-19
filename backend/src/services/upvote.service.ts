// backend/src/services/upvote.service.ts
import { UpvoteRepository } from '../repositories/upvote.repository';
import { Prisma } from '@prisma/client';

export class UpvoteService {
  constructor(private readonly upvoteRepository: UpvoteRepository) { }

  async upvoteIssue(issueId: string, userId: string) {
    try {
      await this.upvoteRepository.createUpvote(issueId, userId);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw { status: 409, message: 'Issue already upvoted' };
      }
      throw error;
    }

    const upvoteCount = await this.upvoteRepository.countUpvotes(issueId);

    return {
      upvoted: true,
      upvoteCount,
    };
  }

  async removeUpvote(issueId: string, userId: string) {
    try {
      await this.upvoteRepository.deleteUpvote(issueId, userId);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw { status: 404, message: 'Upvote does not exist' };
      }
      throw error;
    }

    const upvoteCount = await this.upvoteRepository.countUpvotes(issueId);

    return {
      upvoted: false,
      upvoteCount,
    };
  }

  async getUpvoteCount(issueId: string) {
    const upvoteCount = await this.upvoteRepository.countUpvotes(issueId);

    return { upvoteCount };
  }

}