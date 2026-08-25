// backend/src/repositories/timeline.repository.ts

import { CreatePhotoDTO, IssueStatus } from '@civickit/shared';
import { desc, eq } from 'drizzle-orm';
import db from '../db';
import { timelineEntries, users } from '../db/schema';
import { PhotoRepository } from './photo.repository';

interface CreateEntryInput {
  message: string;
  status: IssueStatus;
  issueId: string;
  userId: string;
  createdAt?: Date;
  entryType?: 'COMMENT' | 'SYSTEM_REPORT_SUBMITTED';
  photos?: CreatePhotoDTO[];
}

/**
 * Author name comes from a join rather than a per-entry lookup. The version
 * this replaced called authRepository.findById once for every entry.
 */
const withAuthor = () =>
  db
    .select({
      id: timelineEntries.id,
      message: timelineEntries.message,
      status: timelineEntries.status,
      entryType: timelineEntries.entryType,
      createdAt: timelineEntries.createdAt,
      issueId: timelineEntries.issueId,
      userId: timelineEntries.userId,
      userName: users.name,
    })
    .from(timelineEntries)
    .innerJoin(users, eq(timelineEntries.userId, users.id));

export class TimelineRepository {
  /**
   * Entry and photos in one transaction. Photos carry the issue id from the
   * route as well as the new entry's id, so every photo on an issue is
   * reachable from that issue regardless of when it was added.
   */
  async createWithPhotos(data: CreateEntryInput) {
    const photoRepository = new PhotoRepository();

    return db.transaction(async (tx) => {
      const [entry] = await tx
        .insert(timelineEntries)
        .values({
          message: data.message,
          status: data.status,
          entryType: data.entryType ?? 'COMMENT',
          userId: data.userId,
          issueId: data.issueId,
          createdAt: data.createdAt,
        })
        .returning();

      const photos = await photoRepository.createMany(
        data.photos ?? [],
        { userId: data.userId, issueId: data.issueId, timelineEntryId: entry.id },
        tx,
      );

      return { entry, photos };
    });
  }

  async findByIssue(id: string) {
    return withAuthor()
      .where(eq(timelineEntries.issueId, id))
      .orderBy(desc(timelineEntries.createdAt));
  }

  async findByUser(id: string) {
    return withAuthor()
      .where(eq(timelineEntries.userId, id))
      .orderBy(desc(timelineEntries.createdAt));
  }
}
