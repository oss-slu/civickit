// backend/src/services/upvote.service.ts
import { UpvoteRepository } from '../repositories/upvote.repository';

// Postgres unique_violation SQLSTATE. With Drizzle + node-postgres a duplicate
// upvote surfaces as a driver error carrying this code (the Prisma-specific
// P2002 no longer applies after the #189 migration of this repository).
// Drizzle wraps the underlying node-postgres DatabaseError in a
// DrizzleQueryError, so the SQLSTATE code can live on `error.cause` rather than
// on the error itself -- walk the cause chain to be safe.
const PG_UNIQUE_VIOLATION = '23505';

function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; current != null && depth < 5; depth++) {
    if (
      typeof current === 'object' &&
      'code' in current &&
      (current as { code?: unknown }).code === PG_UNIQUE_VIOLATION
    ) {
      return true;
    }
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}

export class UpvoteService {
  constructor(private readonly upvoteRepository: UpvoteRepository) { }

  async upvoteIssue(issueId: string, userId: string) {
    try {
      await this.upvoteRepository.createUpvote(issueId, userId);
    } catch (error) {
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
    // Drizzle's delete does not throw when nothing matches, so the repository
    // returns the deleted row (or undefined). Absence means the upvote never
    // existed -> preserve the previous 404 behaviour.
    const deleted = await this.upvoteRepository.deleteUpvote(issueId, userId);

    if (!deleted) {
      throw { status: 404, message: 'Upvote does not exist' };
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
