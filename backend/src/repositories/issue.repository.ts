// backend/src/repositories/issue.repository.ts

import { CreateIssueDTO, IssueStatus } from '@civickit/shared';
import { and, desc, eq, exists, getTableColumns, isNull, sql } from 'drizzle-orm';
import db, { Executor, first } from '../db';
import { RecordNotFoundError } from '../db/errors';
import { Issue, issues, upvotes, users } from '../db/schema';
import { PhotoRepository } from './photo.repository';

/**
 * A row from findNearby. The columns are the Issue table's, selected raw
 * (`i.*`), plus the two the geospatial query computes.
 */
export interface NearbyIssue extends Issue {
  upvoteCount: number;
  /** Metres from the query point, from ST_Distance over geography. */
  distance: number;
}

/**
 * Prisma returned `_count: { upvotes }`, which issue.service.ts then mapped onto
 * `upvoteCount` before anything left the backend. Drizzle has no `_count`, and
 * every consumer -- the shared types, all four mobile screens, and findNearby
 * below -- already spoke `upvoteCount`, so the subquery produces that name
 * directly and the mapping step is gone.
 */
const upvoteCount = sql<number>`(
  SELECT count(*)::int FROM ${upvotes} WHERE ${upvotes.issueId} = ${issues.id}
)`;

/**
 * The author fields the API exposes. Never the whole user row.
 *
 * No profile photo: nothing renders the issue author's avatar, and resolving
 * one here would cost a query per issue on the feed's hottest path.
 */
const author = {
  id: users.id,
  name: users.name,
};

export class IssueRepository {
  /** One shape for every non-geospatial read, so they cannot drift apart. */
  private selectIssues(executor: Executor = db) {
    return executor
      .select({ ...getTableColumns(issues), upvoteCount, user: author })
      .from(issues)
      .innerJoin(users, eq(issues.userId, users.id));
  }

  /**
   * Issue and photos in one transaction, so a failure part-way through leaves
   * neither. The photos carry `issueId` and no `timelineEntryId`, which is what
   * marks them as filed with the original report.
   */
  async createWithPhotos(
    data: CreateIssueDTO & { userId: string; status: IssueStatus },
  ) {
    const photoRepository = new PhotoRepository();

    return db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(issues)
        .values({
          title: data.title,
          description: data.description,
          category: data.category,
          status: data.status,
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address,
          district: data.district,
          subregion: data.subregion,
          name: data.name,
          locationSource: data.locationSource,
          userId: data.userId,
        })
        .returning({ id: issues.id });

      const photos = await photoRepository.createMany(
        data.photos ?? [],
        { userId: data.userId, issueId: inserted.id },
        tx,
      );

      // Re-read so create returns the same shape as findById. Reads through
      // `tx`, not `db` -- a pooled read would be on another connection and
      // would not see this transaction's uncommitted row.
      const issue = (await this.findById(inserted.id, tx))!;

      return { issue, photos };
    });
  }

  async findNearby(
    lat: number,
    lng: number,
    radiusMeters: number = 1000,
    limit: number = 100,
  ): Promise<NearbyIssue[]> {
    // Raw SQL for the PostGIS geospatial query. Parameters are cast explicitly
    // so Postgres does not have to infer types for the ST_* overloads.
    const result = await db.execute(sql`
      SELECT
        i.*,
        (SELECT count(*)::int FROM ${upvotes} u WHERE u."issueId" = i.id) AS "upvoteCount",
        ST_Distance(
          ST_SetSRID(ST_MakePoint(i.longitude, i.latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${lng}::float8, ${lat}::float8), 4326)::geography
        ) as distance
      FROM ${issues} i
      WHERE ST_DWithin(
        ST_SetSRID(ST_MakePoint(i.longitude, i.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${lng}::float8, ${lat}::float8), 4326)::geography,
        ${radiusMeters}::float8
      )
      ORDER BY distance ASC
      LIMIT ${limit}::int
    `);

    // Raw SQL, so the shape is asserted rather than inferred. The integration
    // tests are what hold it to NearbyIssue.
    return result.rows as unknown as NearbyIssue[];
  }

  async findById(id: string, executor: Executor = db) {
    return first(await this.selectIssues(executor).where(eq(issues.id, id)).limit(1));
  }

  async findByUser(id: string, limit: number = 100) {
    return this.selectIssues().where(eq(issues.userId, id)).limit(limit);
  }

  async findByUpvoter(userId: string, limit: number = 100) {
    // EXISTS rather than a join: an issue with several upvotes must still come
    // back once.
    return this.selectIssues()
      .where(
        exists(
          db
            .select({ one: sql`1` })
            .from(upvotes)
            .where(and(eq(upvotes.issueId, issues.id), eq(upvotes.userId, userId))),
        ),
      )
      .orderBy(desc(issues.createdAt))
      .limit(limit);
  }

  // update issue statuss
  async updateStatus(id: string, data: Partial<{ status: IssueStatus }>) {
    const [updated] = await db
      .update(issues)
      .set(data)
      .where(eq(issues.id, id))
      .returning();

    if (!updated) {
      throw new RecordNotFoundError('Issue not found');
    }

    return updated;
  }

  /**
   * Claims the issue only if nobody holds it, and reports whether that
   * happened. The `claimedById IS NULL` guard is part of the UPDATE rather than
   * a read-then-write in the service so two organizations claiming the same
   * issue at the same moment cannot both win: the second statement matches zero
   * rows.
   *
   * Returns null when the write did not apply -- either the issue is already
   * claimed or there is no such issue. The service reads back to tell those
   * apart, since only the caller knows which one deserves which status.
   */
  async claimIssue(id: string, data: { claimedById: string }) {
    const [updated] = await db
      .update(issues)
      .set(data)
      .where(and(eq(issues.id, id), isNull(issues.claimedById)))
      .returning();

    return updated ?? null;
  }

  async releaseIssue(id: string) {
    const [updated] = await db
      .update(issues)
      .set({ claimedById: null })
      .where(eq(issues.id, id))
      .returning();

    if (!updated) {
      throw new RecordNotFoundError('Issue not found');
    }

    return updated;
  }
}
