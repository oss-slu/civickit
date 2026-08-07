// backend/src/repositories/__tests__/integration/org.repository.integration.test.ts
//
// Geofence containment, categoryScope membership, ACTIVE-only filtering and
// overlapping service areas all live in SQL. Mocking the repository would only
// assert that a stub returned what it was handed, so these run against PostGIS.

import { describe, it, expect } from 'vitest';
import { OrgRepository } from '../../org.repository';
import {
  DOWNTOWN_FENCE,
  FARAWAY_FENCE,
  ORIGIN,
  OVERLAP_FENCE,
  makeIssue,
  makeOrg,
  makeUser,
} from '../../../__tests__/integration/factories';

const repository = new OrgRepository();

/** Inside FARAWAY_FENCE, far outside DOWNTOWN_FENCE. */
const FAR_AWAY = { latitude: 25.71, longitude: -80.09 };

/** Every org matching a POTHOLE reported at ORIGIN. */
async function orgIdsAtOrigin(category: 'POTHOLE' | 'STREETLIGHT' = 'POTHOLE') {
  const matches = await repository.findOrgsForIssue(
    ORIGIN.latitude,
    ORIGIN.longitude,
    category,
  );
  return matches.map((org) => org.id).sort();
}

describe('OrgRepository', () => {
  describe('findOrgsForIssue', () => {
    it('returns an active org whose service area and category scope both match', async () => {
      const org = await makeOrg({ fence: DOWNTOWN_FENCE, categoryScope: ['POTHOLE'] });

      expect(await orgIdsAtOrigin()).toEqual([org.id]);
    });

    it('projects the columns dispatch needs', async () => {
      await makeOrg({ categoryScope: ['POTHOLE', 'GRAFFITI'] });

      const [match] = await repository.findOrgsForIssue(
        ORIGIN.latitude,
        ORIGIN.longitude,
        'POTHOLE',
      );

      expect(match.name).toMatch(/^Org /);
      expect(match.type).toBe('CID');
      expect(match.categoryScope).toEqual(['POTHOLE', 'GRAFFITI']);
    });

    // Two orgs may legitimately cover the same block; the claim settles
    // ownership later, not this query.
    it('returns every org whose service area covers the point', async () => {
      const downtown = await makeOrg({ fence: DOWNTOWN_FENCE, categoryScope: ['POTHOLE'] });
      const overlap = await makeOrg({ fence: OVERLAP_FENCE, categoryScope: ['POTHOLE'] });

      expect(await orgIdsAtOrigin()).toEqual([downtown.id, overlap.id].sort());
    });

    it('excludes an org whose category scope omits the category', async () => {
      await makeOrg({ fence: DOWNTOWN_FENCE, categoryScope: ['STREETLIGHT'] });

      expect(await orgIdsAtOrigin()).toEqual([]);
    });

    it('excludes an org whose service area does not reach the point', async () => {
      await makeOrg({ fence: FARAWAY_FENCE, categoryScope: ['POTHOLE'] });

      expect(await orgIdsAtOrigin()).toEqual([]);
    });

    // A registered-but-unapproved org must not start receiving work.
    it('excludes orgs that are not ACTIVE', async () => {
      await makeOrg({ fence: DOWNTOWN_FENCE, status: 'PENDING' });
      await makeOrg({ fence: DOWNTOWN_FENCE, status: 'SUSPENDED' });

      expect(await orgIdsAtOrigin()).toEqual([]);
    });

    it('excludes an org that has not drawn a service area yet', async () => {
      await makeOrg({ fence: null });

      expect(await orgIdsAtOrigin()).toEqual([]);
    });
  });

  describe('findIssuesForOrg', () => {
    it('returns an issue inside the service area whose category the org covers', async () => {
      const org = await makeOrg({ fence: DOWNTOWN_FENCE, categoryScope: ['POTHOLE'] });
      const author = await makeUser();
      const issue = await makeIssue(author.id, { category: 'POTHOLE' });

      const found = await repository.findIssuesForOrg(org.id);

      expect(found.map((row) => row.id)).toEqual([issue.id]);
    });

    it('excludes an issue outside the service area', async () => {
      const org = await makeOrg({ fence: DOWNTOWN_FENCE, categoryScope: ['POTHOLE'] });
      const author = await makeUser();
      await makeIssue(author.id, { category: 'POTHOLE', ...FAR_AWAY });

      expect(await repository.findIssuesForOrg(org.id)).toEqual([]);
    });

    it('excludes an issue whose category the org does not cover', async () => {
      const org = await makeOrg({ fence: DOWNTOWN_FENCE, categoryScope: ['POTHOLE'] });
      const author = await makeUser();
      await makeIssue(author.id, { category: 'ILLEGAL_DUMPING' });

      expect(await repository.findIssuesForOrg(org.id)).toEqual([]);
    });

    it('returns nothing for an org that is not ACTIVE', async () => {
      const org = await makeOrg({ fence: DOWNTOWN_FENCE, status: 'SUSPENDED' });
      const author = await makeUser();
      await makeIssue(author.id, { category: 'POTHOLE' });

      expect(await repository.findIssuesForOrg(org.id)).toEqual([]);
    });
  });
});
