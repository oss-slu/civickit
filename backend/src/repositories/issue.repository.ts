// backend/src/repositories/issue.repository.ts

import { CreateIssueDTO, IssueStatus } from '@civickit/shared';
import { and, desc, eq, exists, getTableColumns, isNull, sql } from 'drizzle-orm';
import db, { first } from '../db';
import { RecordNotFoundError } from '../db/errors';
import { Issue, issues, upvotes, users } from '../db/schema';

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

/** The author fields the API exposes. Never the whole user row. */
const author = {
  id: users.id,
  name: users.name,
  profileImage: users.profileImage,
};

export class IssueRepository {
  /** One shape for every non-geospatial read, so they cannot drift apart. */
  private selectIssues() {
    return db
      .select({ ...getTableColumns(issues), upvoteCount, user: author })
      .from(issues)
      .innerJoin(users, eq(issues.userId, users.id));
  }

  async create(data: CreateIssueDTO & { userId: string }) {
    const [inserted] = await db
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
        images: data.images,
        locationSource: data.locationSource,
        // CreateIssueDTO types this as an ISO string; the column is a timestamp.
        // Prisma accepted either, the driver does not.
        photoTakenAt: data.photoTakenAt ? new Date(data.photoTakenAt) : undefined,
        photoTakenAtSource: data.photoTakenAtSource,
        userId: data.userId,
      })
      .returning({ id: issues.id });

    // Re-read so create returns the same shape as findById.
    return (await this.findById(inserted.id))!;
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

  async findById(id: string) {
    return first(await this.selectIssues().where(eq(issues.id, id)).limit(1));
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
