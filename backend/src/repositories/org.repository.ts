// backend/src/repositories/org.repository.ts
import prisma from "../prisma";
import { IssueCategory } from '@civickit/shared';

export class OrgRepository {
  // Orgs whose geofence contains the issue's point AND whose categoryScope
  // includes the issue's category AND are ACTIVE.
  //
  // Do not rewrite ST_Covers(geofence, ...::geography) as
  // ST_Contains(geofence::geometry, ...) — the geography form uses
  // "Organization_geofence_idx" (verified: Index Scan), the geometry cast
  // cannot and falls back to a sequential scan over every organization.
  async findOrgsForIssue(lat: number, lng: number, category: IssueCategory): Promise<any[]> {
    return prisma.$queryRaw`
      SELECT o.id, o.name, o.type, o."categoryScope"::text[] AS "categoryScope"
      FROM "Organization" o
      WHERE o.status = 'ACTIVE'
        AND o.geofence IS NOT NULL
        AND ${category} = ANY(o."categoryScope")
        AND ST_Covers(
          o.geofence,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        )
    `;
  }

  // The inverse: every issue falling inside this org's geofence whose category
  // the org covers. Deliberately unfiltered by issue status or claim state —
  // Dispatch and Queue layer their own filters on top of this.
  async findIssuesForOrg(organizationId: string): Promise<any[]> {
    return prisma.$queryRaw`
      SELECT i.*
      FROM "Issue" i
      JOIN "Organization" o ON o.id = ${organizationId}
      WHERE o.status = 'ACTIVE'
        AND o.geofence IS NOT NULL
        AND i.category = ANY(o."categoryScope")
        AND ST_Covers(
          o.geofence,
          ST_SetSRID(ST_MakePoint(i.longitude, i.latitude), 4326)::geography
        )
    `;
  }
}
