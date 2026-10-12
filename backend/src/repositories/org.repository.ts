// backend/src/repositories/org.repository.ts

import { IssueCategory } from '@civickit/shared';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import db, { first } from '../db';
import { Issue, issues, organizations } from '../db/schema';
import { CreateOrgDTO } from '@civickit/shared/src/types/api';
import { MembershipRepository } from './membership.repository';
import { RecordNotFoundError } from '../db/errors';
import { PhotoRepository } from './photo.repository';

/**
 * A row from findOrgsForIssue. Raw SQL, so the shape is asserted rather than
 * inferred; the integration tests are what hold it to this.
 */
export interface OrgMatch {
  id: string;
  name: string;
  type: string;
  categoryScope: string[];
}

const membershipRepository = new MembershipRepository();

export class OrgRepository {

  async create(data: CreateOrgDTO & { adminId: string }) {
    const newSlug = await this.getUniqueSlug(data.slug)

    let photo
    if (data.profilePhoto) {
      const photoRepository = new PhotoRepository();
      const photos = await photoRepository.createMany(
        [data.profilePhoto],
        { userId: data.adminId },
      );

      if (photos.length > 0) {
        photo = photos[0]
      }
    }

    const [inserted] = await db
      .insert(organizations)
      .values({
        name: data.name,
        slug: newSlug,
        type: data.type,
        status: data.status,
        tier: data.tier,
        categoryScope: data.categoryScope,
        boundaryRef: data.boundaryRef,
        boundarySource: data.boundarySource,
        boundarySyncedAt: data.boundarySyncedAt,
        geofence: data.geofence,
        profilePhotoId: photo && photo.id
      })
      .returning({ id: organizations.id });

    const membership = membershipRepository.create({
      userId: data.adminId,
      organizationId: inserted.id,
      role: "ORG_ADMIN"
    })

    // Re-read so create returns the same shape as findById.
    return (await this.findById(inserted.id))!;
  }

  async getUniqueSlug(slug: string) {
    let result: any[] = []
    let newSlug = slug
    let i = 1
    do {
      result = await db.select().from(organizations).where(eq(organizations.slug, newSlug));
      if (result.length > 0) {
        newSlug = slug + "-" + i
      }
      i++
    } while (result.length > 0)
    return newSlug

  }

  async findById(id: string) {
    return first(await db.select().from(organizations).where(eq(organizations.id, id)).limit(1));
  }

  // Orgs whose geofence contains the issue's point AND whose categoryScope
  // includes the issue's category AND are ACTIVE.
  //
  // Do not rewrite ST_Covers(geofence, ...::geography) as
  // ST_Contains(geofence::geometry, ...) -- the geography form uses
  // "Organization_geofence_idx" (verified: Index Scan), the geometry cast
  // cannot and falls back to a sequential scan over every organization.
  async findOrgsForIssue(
    lat: number,
    lng: number,
    category: IssueCategory,
  ): Promise<OrgMatch[]> {
    const result = await db.execute(sql`
      SELECT o.id, o.name, o.type, o."categoryScope"::text[] AS "categoryScope"
      FROM ${organizations} o
      WHERE o.status = 'ACTIVE'
        AND o.geofence IS NOT NULL
        AND ${category}::"IssueCategory" = ANY(o."categoryScope")
        AND ST_Covers(
          o.geofence,
          ST_SetSRID(ST_MakePoint(${lng}::float8, ${lat}::float8), 4326)::geography
        )
    `);

    return result.rows as unknown as OrgMatch[];
  }

  // The inverse: every issue falling inside this org's geofence whose category
  // the org covers. Deliberately unfiltered by issue status or claim state --
  // Dispatch and Queue layer their own filters on top of this.
  async findIssuesForOrg(organizationId: string): Promise<Issue[]> {
    const result = await db.execute(sql`
      SELECT i.*
      FROM ${issues} i
      JOIN ${organizations} o ON o.id = ${organizationId}
      WHERE o.status = 'ACTIVE'
        AND o.geofence IS NOT NULL
        AND i.category = ANY(o."categoryScope")
        AND ST_Covers(
          o.geofence,
          ST_SetSRID(ST_MakePoint(i.longitude, i.latitude), 4326)::geography
        )
    `);

    return result.rows as unknown as Issue[];
  }
}
