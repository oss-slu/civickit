// backend/src/__tests__/integration/factories.ts
//
// Built on the repositories rather than on a database client directly, so these
// keep working across the ORM cutover.

import { CreateIssueDTO, IssueCategory, OrgRole, OrgStatus } from '@civickit/shared';
import { sql } from 'drizzle-orm';
import db from '../../db';
import { orgMemberships, organizations } from '../../db/schema';
import { AuthRepository } from '../../repositories/auth.repository';
import { IssueRepository } from '../../repositories/issue.repository';

const authRepository = new AuthRepository();
const issueRepository = new IssueRepository();

// Rows are truncated between cases; this only has to be unique within a file.
let sequence = 0;

export async function makeUser(
  overrides: Partial<{ email: string; name: string; passwordHash: string }> = {},
) {
  sequence += 1;
  return authRepository.createUser({
    email: `user${sequence}@example.com`,
    name: `User ${sequence}`,
    passwordHash: 'not-a-real-hash',
    ...overrides,
  });
}

/** Downtown St. Louis, matching the seed data's area. */
export const ORIGIN = { latitude: 38.627, longitude: -90.1994 };

export function issueInput(overrides: Partial<CreateIssueDTO> = {}): CreateIssueDTO {
  return {
    title: 'Pothole on Main',
    description: 'Large pothole near the intersection',
    category: 'POTHOLE',
    status: 'REPORTED',
    address: '100 Main St',
    images: [],
    ...ORIGIN,
    ...overrides,
  };
}

export async function makeIssue(userId: string, overrides: Partial<CreateIssueDTO> = {}) {
  return issueRepository.create({ ...issueInput(overrides), userId });
}

// Fences are written as WKT and stored through ST_Multi, so a plain POLYGON
// literal is accepted by the MultiPolygon column.

/** Covers roughly -90.21..-90.19 x 38.62..38.64. Contains ORIGIN. */
export const DOWNTOWN_FENCE =
  'MULTIPOLYGON(((-90.21 38.62, -90.19 38.62, -90.19 38.64, -90.21 38.64, -90.21 38.62)))';

/** -90.20..-90.18 x 38.625..38.645 -- deliberately overlaps DOWNTOWN, and also contains ORIGIN. */
export const OVERLAP_FENCE =
  'MULTIPOLYGON(((-90.20 38.625, -90.18 38.625, -90.18 38.645, -90.20 38.645, -90.20 38.625)))';

/** Miami. Nowhere near ORIGIN. */
export const FARAWAY_FENCE =
  'MULTIPOLYGON(((-80.10 25.70, -80.08 25.70, -80.08 25.72, -80.10 25.72, -80.10 25.70)))';

export async function makeOrg(
  overrides: Partial<{
    name: string;
    slug: string;
    status: OrgStatus;
    categoryScope: IssueCategory[];
    /** WKT geometry, or null for an org that has not drawn a service area yet. */
    fence: string | null;
  }> = {},
) {
  sequence += 1;
  const { fence = DOWNTOWN_FENCE, ...rest } = overrides;

  const [org] = await db
    .insert(organizations)
    .values({
      name: `Org ${sequence}`,
      slug: `org-${sequence}`,
      type: 'CID',
      status: 'ACTIVE',
      categoryScope: ['POTHOLE'],
      ...rest,
      // A `sql` expression rather than a value: the column is geography, and
      // ST_Multi is what lets a bare POLYGON through.
      geofence:
        fence === null
          ? null
          : sql`ST_Multi(ST_GeomFromText(${fence}, 4326))::geography`,
    })
    .returning();

  return org;
}

export async function makeMembership(
  userId: string,
  organizationId: string,
  role: OrgRole = 'ORG_MEMBER',
) {
  const [membership] = await db
    .insert(orgMemberships)
    .values({ userId, organizationId, role })
    .returning();

  return membership;
}
