// backend/src/repositories/photo.repository.ts

import { CreatePhotoDTO } from '@civickit/shared';
import { and, asc, eq, inArray, isNull } from 'drizzle-orm';
import db, { Executor, first } from '../db';
import { Photo, photos } from '../db/schema';

/**
 * Which parent a batch of photos belongs to. `issueId` is set for every issue
 * photo; `timelineEntryId` is set additionally when the photo arrived via a
 * status update. A profile photo has neither.
 */
export interface PhotoOwner {
  userId: string;
  issueId?: string;
  timelineEntryId?: string;
}

/** Groups rows by a parent id, preserving the order the query returned them in. */
function groupBy(rows: Photo[], key: (row: Photo) => string | null): Map<string, Photo[]> {
  const grouped = new Map<string, Photo[]>();
  for (const row of rows) {
    const id = key(row);
    if (id === null) continue;
    const bucket = grouped.get(id);
    if (bucket) {
      bucket.push(row);
    } else {
      grouped.set(id, [row]);
    }
  }
  return grouped;
}

export class PhotoRepository {
  /**
   * Positions come from array order, so the client's ordering survives. Takes
   * an executor because photos are always written inside the transaction that
   * creates their parent.
   */
  async createMany(
    input: CreatePhotoDTO[],
    owner: PhotoOwner,
    executor: Executor = db,
  ): Promise<Photo[]> {
    if (input.length === 0) return [];

    return executor
      .insert(photos)
      .values(
        input.map((photo, index) => ({
          url: photo.url,
          publicId: photo.publicId,
          width: photo.width,
          height: photo.height,
          photoTakenAt: photo.photoTakenAt ? new Date(photo.photoTakenAt) : undefined,
          photoTakenAtSource: photo.photoTakenAtSource,
          position: index,
          userId: owner.userId,
          issueId: owner.issueId,
          timelineEntryId: owner.timelineEntryId,
        })),
      )
      .returning();
  }

  /**
   * Photos filed with the original report -- `timelineEntryId IS NULL`. Photos
   * added later by a status update carry the same `issueId` but are excluded
   * here; they are read through findByTimelineEntryIds instead.
   *
   * The soft-delete filter lives here rather than in the services so that no
   * caller can forget it.
   */
  async findOriginalsByIssueIds(
    issueIds: string[],
    executor: Executor = db,
  ): Promise<Map<string, Photo[]>> {
    if (issueIds.length === 0) return new Map();

    const rows = await executor
      .select()
      .from(photos)
      .where(
        and(
          inArray(photos.issueId, issueIds),
          isNull(photos.timelineEntryId),
          isNull(photos.deletedAt),
        ),
      )
      .orderBy(asc(photos.position));

    return groupBy(rows, (row) => row.issueId);
  }

  async findByTimelineEntryIds(
    entryIds: string[],
    executor: Executor = db,
  ): Promise<Map<string, Photo[]>> {
    if (entryIds.length === 0) return new Map();

    const rows = await executor
      .select()
      .from(photos)
      .where(and(inArray(photos.timelineEntryId, entryIds), isNull(photos.deletedAt)))
      .orderBy(asc(photos.position));

    return groupBy(rows, (row) => row.timelineEntryId);
  }

  /** Single lookup, for profile photos. Issue and entry photos come batched. */
  async findById(id: string, executor: Executor = db): Promise<Photo | null> {
    return first(await executor.select().from(photos).where(eq(photos.id, id)).limit(1));
  }

  /** Hides a photo without destroying the row or the Cloudinary asset. */
  async softDelete(id: string, executor: Executor = db): Promise<void> {
    await executor.update(photos).set({ deletedAt: new Date() }).where(eq(photos.id, id));
  }
}
