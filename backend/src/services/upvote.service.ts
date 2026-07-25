// backend/src/services/upvote.service.ts
import { UpvoteRepository } from '../repositories/upvote.repository';
import { RecordNotFoundError, isUniqueViolation } from '../db/errors';

export class UpvoteService {
  constructor(private readonly upvoteRepository: UpvoteRepository) { }

  async upvoteIssue(issueId: string, userId: string) {
    try {
      await this.upvoteRepository.createUpvote(issueId, userId);
    } catch (error) {
      // Postgres unique_violation, where Prisma reported P2002.
      if (isUniqueViolation(error)) {
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
      // Deleting no rows raises nothing in Postgres, where Prisma reported
      // P2025, so the repository raises this in its place.
      if (error instanceof RecordNotFoundError) {
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

  async getUpvoteCount(issueId: string, userId: string) {
    const [count, hasUpvoted] = await Promise.all([
      this.upvoteRepository.countUpvotes(issueId),
      this.upvoteRepository.exists(issueId, userId),
    ]);

    return {
      upvoteCount: count,
      upvoted: hasUpvoted,
    };
  }


}