// backend/src/repositories/image.repository.ts

import { desc, eq, exists, getTableColumns, sql } from 'drizzle-orm';
import db, { first } from '../db';
import { images, Issue, issues, upvotes, users } from '../db/schema';
import { CreateImageDTO } from '@civickit/shared/src/types/api';
import { PhotoSource } from '@civickit/shared';
import { RecordNotFoundError } from '../db/errors';




export class ImageRepository {

  async create(data: CreateImageDTO & { userId: string }) {
    const [inserted] = await db
      .insert(images)
      .values({
        link: data.link,
        userId: data.userId,
        photoTakenAt: new Date(data.photoTakenAt),
        photoTakenAtSource: data.photoTakenAtSource,
        sourceId: data.sourceId,
        source: data.source,
        width: data.width,
        height: data.height,
        createdAt: data.createdAt,
      })
      .returning({ id: images.id });

    // Re-read so create returns the same shape as findById.
    return (await this.findById(inserted.id))!;
  }

  async findById(id: string) {
    return first(
      await db
        .select({
          id: images.id,
          link: images.link,
          userId: images.userId,
          createdAt: images.createdAt,
          photoTakenAt: images.photoTakenAt,
          photoTakenAtSource: images.photoTakenAtSource,
          sourceId: images.sourceId,
          source: images.source,
          width: images.width,
          height: images.height
        })
        .from(images)
        .where(eq(images.id, id))
        .limit(1),
    );
  }

  async updateSource(id: string, data: Partial<{ source: PhotoSource, sourceId: string }>) {
    const [updated] = await db
      .update(images)
      .set(data)
      .where(eq(images.id, String(data.sourceId)))
      .returning();

    if (!updated) {
      throw new RecordNotFoundError('Image not found');
    }

    return updated;
  }
}


