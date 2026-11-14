// backend/src/__tests__/integration/org.integration.test.ts
//
// Org and membership lookups used to take the target ID from the URL and only
// check that the caller was signed in (#249). These hit the real routes and
// database with a real token, so each 403 is the authorization check talking,
// not a mock.

import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { JWT_SECRET } from '../../config/env';
import { errorHandler } from '../../middleware/error.middleware';
import orgRoutes from '../../routes/org.routes';
import { makeMembership, makeOrg, makePlatformAdmin, makeUser } from './factories';

const app = express();
app.use(express.json());
app.use('/api/organizations', orgRoutes);
app.use(errorHandler);

const tokenFor = (userId: string) => jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });

const get = (path: string, userId: string) =>
  request(app).get(`/api/organizations${path}`).set('Authorization', `Bearer ${tokenFor(userId)}`);

/** An org with one ORG_MEMBER, the usual responder setup. */
async function makeResponder() {
  const user = await makeUser();
  const org = await makeOrg();
  const membership = await makeMembership(user.id, org.id, 'ORG_MEMBER');
  return { user, org, membership };
}

describe('GET /organizations/me', () => {
  it('returns 200 with null for a reporter with no org', async () => {
    const reporter = await makeUser();

    const response = await get('/me', reporter.id);

    expect(response.status).toBe(200);
    expect(response.body).toBeNull();
  });

  it("returns the member's own org", async () => {
    const { user, org } = await makeResponder();

    const response = await get('/me', user.id);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(org.id);
    expect(response.body.name).toBe(org.name);
  });

  it('rejects a request with no token', async () => {
    const response = await request(app).get('/api/organizations/me');

    expect(response.status).toBe(401);
  });
});

describe('GET /organizations/me/membership', () => {
  it('returns 200 with null for a reporter with no org', async () => {
    const reporter = await makeUser();

    const response = await get('/me/membership', reporter.id);

    expect(response.status).toBe(200);
    expect(response.body).toBeNull();
  });

  it("returns the member's own membership", async () => {
    const { user, org } = await makeResponder();

    const response = await get('/me/membership', user.id);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      userId: user.id,
      organizationId: org.id,
      role: 'ORG_MEMBER',
    });
  });
});

describe("another user's :userId routes", () => {
  const routes = [
    { name: 'getOrgByUserId', path: (id: string) => `/${id}/getOrgByUserId` },
    { name: 'getMembershipByUserId', path: (id: string) => `/${id}/getMembershipByUserId` },
  ];

  for (const route of routes) {
    describe(route.name, () => {
      it('returns 403 to a reporter asking about someone else', async () => {
        const reporter = await makeUser();
        const { user: target } = await makeResponder();

        const response = await get(route.path(target.id), reporter.id);

        expect(response.status).toBe(403);
        // Nothing about the target leaks into the error.
        expect(JSON.stringify(response.body)).not.toContain(target.id);
      });

      it('returns 403 to a member of another org', async () => {
        const { user: outsider } = await makeResponder();
        const { user: target } = await makeResponder();

        const response = await get(route.path(target.id), outsider.id);

        expect(response.status).toBe(403);
      });

      it('returns 200 to a platform ADMIN', async () => {
        const admin = await makePlatformAdmin();
        const { user: target, org } = await makeResponder();

        const response = await get(route.path(target.id), admin.id);

        expect(response.status).toBe(200);
        const orgId = response.body.organizationId ?? response.body.id;
        expect(orgId).toBe(org.id);
      });
    });
  }
});

describe('GET /organizations/:orgId/getMembershipsbyOrgId', () => {
  it('returns 403 to a user outside the org', async () => {
    const outsider = await makeUser();
    const { org } = await makeResponder();

    const response = await get(`/${org.id}/getMembershipsbyOrgId`, outsider.id);

    expect(response.status).toBe(403);
  });

  it('gives the same 403 for an org that does not exist', async () => {
    const outsider = await makeUser();
    const { org } = await makeResponder();

    const real = await get(`/${org.id}/getMembershipsbyOrgId`, outsider.id);
    const missing = await get('/no-such-org/getMembershipsbyOrgId', outsider.id);

    expect(missing.status).toBe(403);
    expect(missing.body).toEqual(real.body);
  });

  it('returns 403 to a member of a different org', async () => {
    const { user: outsider } = await makeResponder();
    const { org } = await makeResponder();

    const response = await get(`/${org.id}/getMembershipsbyOrgId`, outsider.id);

    expect(response.status).toBe(403);
  });

  it('returns the member list to a member of that org', async () => {
    const { user, org } = await makeResponder();
    const colleague = await makeUser();
    await makeMembership(colleague.id, org.id, 'ORG_ADMIN');

    const response = await get(`/${org.id}/getMembershipsbyOrgId`, user.id);

    expect(response.status).toBe(200);
    expect(response.body.map((m: { userId: string }) => m.userId).sort()).toEqual(
      [user.id, colleague.id].sort(),
    );
  });

  it('returns the member list to a platform ADMIN', async () => {
    const admin = await makePlatformAdmin();
    const { user, org } = await makeResponder();

    const response = await get(`/${org.id}/getMembershipsbyOrgId`, admin.id);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].userId).toBe(user.id);
  });
});
