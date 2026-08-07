// backend/src/repositories/upvote.repository.ts

import { and, count, eq } from 'drizzle-orm';
import db from '../db';
import { RecordNotFoundError } from '../db/errors';
import { upvotes } from '../db/schema';

/** The pair behind the Upvote_issueId_userId_key unique index. */
const forPair = (issueId: string, userId: string) =>
  and(eq(upvotes.issueId, issueId), eq(upvotes.userId, userId));

export class UpvoteRepository {
  async createUpvote(issueId: string, userId: string) {
    const [upvote] = await db.insert(upvotes).values({ issueId, userId }).returning();

    return upvote;
  }

  async deleteUpvote(issueId: string, userId: string) {
    const [deleted] = await db
      .delete(upvotes)
      .where(forPair(issueId, userId))
      .returning();

    // Deleting nothing is not an error in Postgres, where Prisma raised P2025.
    // upvote.service.ts still needs to answer 404, so the absence is raised here.
    if (!deleted) {
      throw new RecordNotFoundError('Upvote does not exist');
    }

    return deleted;
  }

  async countUpvotes(issueId: string) {
    const [row] = await db
      .select({ value: count() })
      .from(upvotes)
      .where(eq(upvotes.issueId, issueId));

    return row.value;
  }

  async exists(issueId: string, userId: string): Promise<boolean> {
    const [upvote] = await db
      .select({ issueId: upvotes.issueId })
      .from(upvotes)
      .where(forPair(issueId, userId))
      .limit(1);

    return !!upvote;
  }

  async findByUser(id: string) {
    return db.select().from(upvotes).where(eq(upvotes.userId, id));
  }
}
