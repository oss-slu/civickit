// backend/src/services/__tests__/unit/org.service.test.ts

import 'dotenv/config';
import { describe, beforeEach, beforeAll, afterAll, vi, it, expect, Mocked } from 'vitest';
import { OrgService } from '../../org.service';
import { OrgRepository } from '../../../repositories/org.repository';
import prisma from '../../../prisma';

// ---------------------------------------------------------------------------
// Pure unit coverage: the service's validation, with the repository mocked.
// ---------------------------------------------------------------------------

describe('OrgService', () => {
  let orgService: OrgService;
  let mockOrgRepository: Mocked<OrgRepository>;

  beforeEach(() => {
    mockOrgRepository = {
      findOrgsForIssue: vi.fn(),
      findIssuesForOrg: vi.fn(),
    } as unknown as Mocked<OrgRepository>;

    orgService = new OrgService(mockOrgRepository);
  });

  describe('findOrgsForIssue', () => {
    it('should pass coordinates and category through to the repository', async () => {
      const orgs = [{ id: 'org-1' }];
      mockOrgRepository.findOrgsForIssue.mockResolvedValue(orgs as any);

      const result = await orgService.findOrgsForIssue(38.63, -90.195, 'POTHOLE');

      expect(result).toEqual(orgs);
      expect(mockOrgRepository.findOrgsForIssue).toHaveBeenCalledWith(38.63, -90.195, 'POTHOLE');
    });

    it('should throw if latitude is missing', async () => {
      await expect(
        orgService.findOrgsForIssue(undefined as any, -90.195, 'POTHOLE')
      ).rejects.toThrow('Latitude and longitude are required');
      expect(mockOrgRepository.findOrgsForIssue).not.toHaveBeenCalled();
    });

    it('should throw if longitude is missing', async () => {
      await expect(
        orgService.findOrgsForIssue(38.63, undefined as any, 'POTHOLE')
      ).rejects.toThrow('Latitude and longitude are required');
      expect(mockOrgRepository.findOrgsForIssue).not.toHaveBeenCalled();
    });
  });

  describe('findIssuesForOrg', () => {
    it('should pass the organization id through to the repository', async () => {
      const issues = [{ id: 'issue-1' }];
      mockOrgRepository.findIssuesForOrg.mockResolvedValue(issues as any);

      const result = await orgService.findIssuesForOrg('org-1');

      expect(result).toEqual(issues);
      expect(mockOrgRepository.findIssuesForOrg).toHaveBeenCalledWith('org-1');
    });

    it('should throw if organizationId is missing', async () => {
      await expect(orgService.findIssuesForOrg('')).rejects.toThrow(
        'organizationId is required'
      );
      expect(mockOrgRepository.findIssuesForOrg).not.toHaveBeenCalled();
    });
  });
});

// ---------------------------------------------------------------------------
// Real query shape against PostGIS.
//
// The routing rules this plan exists to guarantee (geofence containment,
// categoryScope membership, ACTIVE-only, overlapping orgs) live entirely in
// SQL. A mocked repository can only assert that a stub returned what it was
// told to, so these cases run against the real database.
//
// Fixtures are created and torn down by explicit id — this suite must never
// truncate, since it runs against the developer's own dev database.
// ---------------------------------------------------------------------------

const PREFIX = 'test-geo-routing-';

const dbAvailable = await (async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
})();

if (!dbAvailable) {
  console.warn(
    `\n[org.service.test] Skipping geo-routing database tests: no database reachable ` +
      `at DATABASE_URL. Run \`npm run db:up\` to exercise them.\n`
  );
}

// A point inside both DOWNTOWN and OVERLAP below.
const POINT = { lat: 38.63, lng: -90.195 };

// Covers roughly -90.21..-90.19 x 38.62..38.64
const DOWNTOWN_FENCE =
  'MULTIPOLYGON(((-90.21 38.62, -90.19 38.62, -90.19 38.64, -90.21 38.64, -90.21 38.62)))';
// Covers roughly -90.20..-90.18 x 38.625..38.645 — deliberately overlaps DOWNTOWN.
const OVERLAP_FENCE =
  'MULTIPOLYGON(((-90.20 38.625, -90.18 38.625, -90.18 38.645, -90.20 38.645, -90.20 38.625)))';
// Nowhere near POINT.
const FARAWAY_FENCE =
  'MULTIPOLYGON(((-80.10 25.70, -80.08 25.70, -80.08 25.72, -80.10 25.72, -80.10 25.70)))';

async function insertOrg(opts: {
  id: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  categoryScope: string[];
  fence: string | null;
}) {
  const scope = `ARRAY[${opts.categoryScope.map((c) => `'${c}'`).join(',')}]::"IssueCategory"[]`;
  const fence = opts.fence === null ? 'NULL' : `ST_GeomFromText('${opts.fence}', 4326)::geography`;
  await prisma.$executeRawUnsafe(
    `INSERT INTO "Organization"
       (id, name, slug, type, status, "categoryScope", geofence, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, 'CID', $4::"OrgStatus", ${scope}, ${fence}, now(), now())`,
    opts.id,
    opts.id,
    opts.id,
    opts.status
  );
}

async function insertIssue(opts: {
  id: string;
  category: string;
  lat: number;
  lng: number;
  userId: string;
}) {
  await prisma.$executeRawUnsafe(
    `INSERT INTO "Issue"
       (id, title, description, category, status, latitude, longitude, images, "userId", "createdAt", "updatedAt")
     VALUES ($1, 'Test issue', 'Test description', $2::"IssueCategory", 'REPORTED', $3, $4, ARRAY[]::text[], $5, now(), now())`,
    opts.id,
    opts.category,
    opts.lat,
    opts.lng,
    opts.userId
  );
}

describe.skipIf(!dbAvailable)('geo-matched routing against PostGIS', () => {
  const orgRepository = new OrgRepository();

  const DOWNTOWN = `${PREFIX}downtown`;
  const OVERLAP = `${PREFIX}overlap`;
  const WRONG_CATEGORY = `${PREFIX}wrong-category`;
  const FARAWAY = `${PREFIX}faraway`;
  const PENDING = `${PREFIX}pending`;
  const SUSPENDED = `${PREFIX}suspended`;
  const NO_FENCE = `${PREFIX}no-fence`;

  const USER = `${PREFIX}user`;
  const ISSUE_INSIDE = `${PREFIX}issue-inside`;
  const ISSUE_OUTSIDE = `${PREFIX}issue-outside`;
  const ISSUE_WRONG_CATEGORY = `${PREFIX}issue-wrong-category`;

  async function cleanup() {
    await prisma.$executeRaw`DELETE FROM "Issue" WHERE id LIKE ${PREFIX + '%'}`;
    await prisma.$executeRaw`DELETE FROM "user" WHERE id LIKE ${PREFIX + '%'}`;
    await prisma.$executeRaw`DELETE FROM "Organization" WHERE id LIKE ${PREFIX + '%'}`;
  }

  beforeAll(async () => {
    await cleanup();

    await insertOrg({ id: DOWNTOWN, status: 'ACTIVE', categoryScope: ['POTHOLE', 'GRAFFITI'], fence: DOWNTOWN_FENCE });
    await insertOrg({ id: OVERLAP, status: 'ACTIVE', categoryScope: ['POTHOLE'], fence: OVERLAP_FENCE });
    await insertOrg({ id: WRONG_CATEGORY, status: 'ACTIVE', categoryScope: ['STREETLIGHT'], fence: DOWNTOWN_FENCE });
    await insertOrg({ id: FARAWAY, status: 'ACTIVE', categoryScope: ['POTHOLE'], fence: FARAWAY_FENCE });
    await insertOrg({ id: PENDING, status: 'PENDING', categoryScope: ['POTHOLE'], fence: DOWNTOWN_FENCE });
    await insertOrg({ id: SUSPENDED, status: 'SUSPENDED', categoryScope: ['POTHOLE'], fence: DOWNTOWN_FENCE });
    await insertOrg({ id: NO_FENCE, status: 'ACTIVE', categoryScope: ['POTHOLE'], fence: null });

    await prisma.$executeRaw`
      INSERT INTO "user" (id, email, name, "emailVerified", "createdAt", "updatedAt")
      VALUES (${USER}, ${USER + '@example.test'}, 'Geo Routing Test User', false, now(), now())
    `;

    // Inside DOWNTOWN, category it covers.
    await insertIssue({ id: ISSUE_INSIDE, category: 'POTHOLE', lat: POINT.lat, lng: POINT.lng, userId: USER });
    // Inside DOWNTOWN, category it does NOT cover.
    await insertIssue({ id: ISSUE_WRONG_CATEGORY, category: 'ILLEGAL_DUMPING', lat: POINT.lat, lng: POINT.lng, userId: USER });
    // Covered category, but far outside DOWNTOWN.
    await insertIssue({ id: ISSUE_OUTSIDE, category: 'POTHOLE', lat: 25.71, lng: -80.09, userId: USER });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  describe('findOrgsForIssue', () => {
    it('returns an org whose geofence contains the point and whose categoryScope matches', async () => {
      const orgs = await orgRepository.findOrgsForIssue(POINT.lat, POINT.lng, 'POTHOLE');

      expect(orgs.map((o) => o.id)).toContain(DOWNTOWN);
    });

    it('returns categoryScope as a parsed array, not a raw Postgres array string', async () => {
      const orgs = await orgRepository.findOrgsForIssue(POINT.lat, POINT.lng, 'POTHOLE');
      const downtown = orgs.find((o) => o.id === DOWNTOWN);

      expect(Array.isArray(downtown.categoryScope)).toBe(true);
      expect(downtown.categoryScope).toEqual(['POTHOLE', 'GRAFFITI']);
    });

    it('excludes an org that contains the point but does not cover the category', async () => {
      const orgs = await orgRepository.findOrgsForIssue(POINT.lat, POINT.lng, 'POTHOLE');

      expect(orgs.map((o) => o.id)).not.toContain(WRONG_CATEGORY);
    });

    it('excludes an org that covers the category but does not contain the point', async () => {
      const orgs = await orgRepository.findOrgsForIssue(POINT.lat, POINT.lng, 'POTHOLE');

      expect(orgs.map((o) => o.id)).not.toContain(FARAWAY);
    });

    it('excludes PENDING and SUSPENDED orgs that would otherwise match', async () => {
      const orgs = await orgRepository.findOrgsForIssue(POINT.lat, POINT.lng, 'POTHOLE');
      const ids = orgs.map((o) => o.id);

      expect(ids).not.toContain(PENDING);
      expect(ids).not.toContain(SUSPENDED);
    });

    it('excludes an ACTIVE org with no geofence set rather than erroring', async () => {
      const orgs = await orgRepository.findOrgsForIssue(POINT.lat, POINT.lng, 'POTHOLE');

      expect(orgs.map((o) => o.id)).not.toContain(NO_FENCE);
    });

    // The case the whole flat-routing model exists for: overlapping taxing
    // districts. Both orgs must see the issue — do not dedupe this away.
    it('returns BOTH orgs when two overlapping geofences contain the point', async () => {
      const orgs = await orgRepository.findOrgsForIssue(POINT.lat, POINT.lng, 'POTHOLE');
      const ids = orgs.map((o) => o.id);

      expect(ids).toContain(DOWNTOWN);
      expect(ids).toContain(OVERLAP);
    });

    it('routes to only the org whose categoryScope covers the category', async () => {
      // GRAFFITI is in DOWNTOWN's scope but not OVERLAP's, though both fences
      // contain the point.
      const orgs = await orgRepository.findOrgsForIssue(POINT.lat, POINT.lng, 'GRAFFITI');
      const ids = orgs.map((o) => o.id);

      expect(ids).toContain(DOWNTOWN);
      expect(ids).not.toContain(OVERLAP);
    });
  });

  describe('findIssuesForOrg', () => {
    it('returns issues inside the geofence whose category the org covers', async () => {
      const issues = await orgRepository.findIssuesForOrg(DOWNTOWN);

      expect(issues.map((i) => i.id)).toContain(ISSUE_INSIDE);
    });

    it('excludes issues inside the geofence whose category the org does not cover', async () => {
      const issues = await orgRepository.findIssuesForOrg(DOWNTOWN);

      expect(issues.map((i) => i.id)).not.toContain(ISSUE_WRONG_CATEGORY);
    });

    it('excludes issues outside the geofence', async () => {
      const issues = await orgRepository.findIssuesForOrg(DOWNTOWN);

      expect(issues.map((i) => i.id)).not.toContain(ISSUE_OUTSIDE);
    });

    it('returns nothing for a non-ACTIVE org', async () => {
      const issues = await orgRepository.findIssuesForOrg(SUSPENDED);

      expect(issues.map((i) => i.id)).not.toContain(ISSUE_INSIDE);
    });

    it('returns nothing for an org with no geofence rather than erroring', async () => {
      const issues = await orgRepository.findIssuesForOrg(NO_FENCE);

      expect(issues).toEqual([]);
    });

    it('returns nothing for an organization id that does not exist', async () => {
      const issues = await orgRepository.findIssuesForOrg(`${PREFIX}does-not-exist`);

      expect(issues).toEqual([]);
    });
  });
});
