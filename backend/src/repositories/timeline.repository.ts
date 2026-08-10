// backend/src/repositories/timeline.repository.ts

import { PostUpdateDTO } from '@civickit/shared/src/types/api';
import { eq } from 'drizzle-orm';
import db from '../db';
import { timelineEntries } from '../db/schema';

export class TimelineRepository {
  async createUpdate(data: PostUpdateDTO & { issueId: string; userId: string }) {
    const [entry] = await db
      .insert(timelineEntries)
      .values({
        message: data.message,
        status: data.status,
        // Left undefined rather than null when absent, so the column default
        // supplies the empty array.
        images: data.images,
        userId: data.userId,
        issueId: data.issueId,
        // Optional on PostUpdateDTO. issue.controller.ts backdates the
        // "Photo Taken" entry to the photo's own timestamp, so an explicit
        // value has to win over the column default.
        createdAt: data.createdAt,
      })
      .returning();

    return entry;
  }

  async findByIssue(id: string) {
    return db.select().from(timelineEntries).where(eq(timelineEntries.issueId, id));
  }

  async findByUser(id: string) {
    return await db.select().from(timelineEntries).where(eq(timelineEntries.userId, id));
  }
}
