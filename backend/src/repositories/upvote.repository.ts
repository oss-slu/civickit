// backend/src/repositories/upvote.repository.ts
//
// Converted from Prisma to Drizzle as the first vertical slice of the ORM
// migration (#189). The public method surface is unchanged so the service layer
// and its tests keep working; only the data-access implementation differs.

import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db';
import { upvote } from '../db/schema';

type Upvote = typeof upvote.$inferSelect;

export class UpvoteRepository {
  async createUpvote(issueId: string, userId: string) {
    const [row] = await db.insert(upvote).values({ issueId, userId }).returning();
    return row;
  }

  // Returns the deleted row, or undefined when no matching upvote existed. The
  // service uses this to preserve the previous "not found -> 404" behaviour that
  // Prisma gave us by throwing.
  async deleteUpvote(issueId: string, userId: string): Promise<Upvote | undefined> {
    const [row] = await db
      .delete(upvote)
      .where(and(eq(upvote.issueId, issueId), eq(upvote.userId, userId)))
      .returning();
    return row;
  }

  async countUpvotes(issueId: string): Promise<number> {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(upvote)
      .where(eq(upvote.issueId, issueId));
    return row?.count ?? 0;
  }

  async exists(issueId: string, userId: string): Promise<boolean> {
    const [row] = await db
      .select({ id: upvote.id })
      .from(upvote)
      .where(and(eq(upvote.issueId, issueId), eq(upvote.userId, userId)))
      .limit(1);
    return !!row;
  }

  async findByUser(id: string) {
    return db.select().from(upvote).where(eq(upvote.userId, id));
  }
}
