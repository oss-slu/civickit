// backend/src/__tests__/integration/seed.integration.test.ts
//
// The seed is how everyone gets test accounts (docs/testing-instructions.md).
// These check that the fixtures land where their comments say, and that each
// seeded account gets exactly the access the docs promise, through the real
// login route and the real authorization middleware.

import express from 'express';
import request from 'supertest';
import { sql } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import db from '../../db';
import { errorHandler } from '../../middleware/error.middleware';
import issueRoutes from '../../routes/issue.routes';
import loginRoutes from '../../routes/login.routes';
import orgRoutes from '../../routes/org.routes';
import { OrgRepository } from '../../repositories/org.repository';
import { seedDatabase } from '../../seed-utils';
import {
    issueTemplates,
    organizationTemplates,
    orgMembershipTemplates,
    ORG_A_SLUG,
    ORG_B_SLUG,
    SEED_ACCOUNTS,
    SEED_PASSWORD,
    userTemplates,
} from '../../seed-data';

const app = express();
app.use(express.json());
app.use('/api/auth/login', loginRoutes);
app.use('/api/organizations', orgRoutes);
app.use('/api/issues', issueRoutes);
app.use(errorHandler);

const orgRepository = new OrgRepository();

// The issue docs/testing-instructions.md walks through: org A's area and scope.
const CLAIM_TARGET = 'Unwalkable sidewalk';

type Account = keyof typeof SEED_ACCOUNTS;

async function login(account: Account): Promise<{ token: string; id: string }> {
    const response = await request(app)
        .post('/api/auth/login')
        .send({ email: SEED_ACCOUNTS[account], password: SEED_PASSWORD });
    expect(response.status).toBe(200);
    return { token: response.body.token, id: response.body.user.id };
}

async function as(account: Account) {
    const { token, id } = await login(account);
    const auth = { Authorization: `Bearer ${token}` };
    return {
        id,
        get: (path: string) => request(app).get(`/api${path}`).set(auth),
        post: (path: string, body: object = {}) => request(app).post(`/api${path}`).set(auth).send(body),
        patch: (path: string, body: object) => request(app).patch(`/api${path}`).set(auth).send(body),
    };
}

async function orgId(slug: string): Promise<string> {
    const { rows } = await db.execute<{ id: string }>(
        sql`SELECT id FROM "Organization" WHERE slug = ${slug}`,
    );
    return rows[0].id;
}

async function issueId(title: string): Promise<string> {
    const { rows } = await db.execute<{ id: string }>(sql`SELECT id FROM "Issue" WHERE title = ${title}`);
    return rows[0].id;
}

async function userId(email: string): Promise<string> {
    const { rows } = await db.execute<{ id: string }>(sql`SELECT id FROM "user" WHERE email = ${email}`);
    return rows[0].id;
}

beforeEach(async () => {
    // The seed logs every row it writes.
    vi.spyOn(console, 'log').mockImplementation(() => {});
    // setup.ts truncates after every case, so each one starts from a fresh seed.
    await seedDatabase(issueTemplates, { uploadImages: false });
    vi.restoreAllMocks();
});

describe('seed fixtures', () => {
    it('gives every org a geofence', async () => {
        const { rows } = await db.execute<{ slug: string; has_geofence: boolean }>(
            sql`SELECT slug, geofence IS NOT NULL AS has_geofence FROM "Organization" ORDER BY slug`,
        );

        expect(rows).toEqual(
            organizationTemplates
                .map((o) => ({ slug: o.slug, has_geofence: true }))
                .sort((a, b) => a.slug.localeCompare(b.slug)),
        );
    });

    it('resolves every membership to a seeded user and org', async () => {
        const { rows } = await db.execute<{ email: string; slug: string; role: string }>(sql`
            SELECT u.email, o.slug, m.role
            FROM "OrgMembership" m
            JOIN "user" u ON u.id = m."userId"
            JOIN "Organization" o ON o.id = m."organizationId"
        `);

        expect(rows).toHaveLength(orgMembershipTemplates.length);
        expect(rows).toEqual(
            expect.arrayContaining(
                orgMembershipTemplates.map((m) => ({ email: m.userEmail, slug: m.orgSlug, role: m.role })),
            ),
        );
    });

    it('seeds every test account, with ADMIN only on admin@', async () => {
        const { rows } = await db.execute<{ email: string; role: string }>(
            sql`SELECT email, role FROM "user" WHERE role = 'ADMIN'`,
        );

        expect(rows).toEqual([{ email: SEED_ACCOUNTS.admin, role: 'ADMIN' }]);
        const { rows: all } = await db.execute<{ total: number }>(sql`SELECT count(*)::int AS total FROM "user"`);
        expect(all[0].total).toBe(userTemplates.length);
    });

    it("puts 12 Midtown issues in org A's geofence, 11 of them in its scope", async () => {
        const { rows } = await db.execute<{ title: string; category: string }>(sql`
            SELECT i.title, i.category
            FROM "Issue" i JOIN "Organization" o ON o.slug = ${ORG_A_SLUG}
            WHERE ST_Covers(o.geofence, ST_SetSRID(ST_MakePoint(i.longitude, i.latitude), 4326)::geography)
        `);
        expect(rows).toHaveLength(12);
        expect(rows.every((r) => r.title !== 'Graffiti on storefront shutter')).toBe(true);

        const inScope = await orgRepository.findIssuesForOrg(await orgId(ORG_A_SLUG));
        expect(inScope).toHaveLength(11);
        // The one in the geofence but out of scope.
        expect(inScope.map((i) => i.category)).not.toContain('ILLEGAL_DUMPING');
    });

    it("puts only the two Tower Grove South issues in org B's area and scope", async () => {
        const inScope = await orgRepository.findIssuesForOrg(await orgId(ORG_B_SLUG));

        expect(inScope.map((i) => i.title).sort()).toEqual(
            ['Graffiti on storefront shutter', 'Mattress dumped in alley'].sort(),
        );
    });

    it('leaves the Midtown dumping issue to no org', async () => {
        const dumping = issueTemplates.find((t) => t.title === 'Abandoned items in alleyway')!;

        const orgs = await orgRepository.findOrgsForIssue(dumping.latitude, dumping.longitude, dumping.category);

        expect(orgs).toEqual([]);
    });

    it("gives the reporter exactly the fixture's issues and endorsements", async () => {
        const reporterId = await userId(SEED_ACCOUNTS.reporter);
        const { rows: issues } = await db.execute<{ title: string }>(
            sql`SELECT title FROM "Issue" WHERE "userId" = ${reporterId}`,
        );
        const { rows: upvotes } = await db.execute<{ title: string }>(sql`
            SELECT i.title FROM "Upvote" v JOIN "Issue" i ON i.id = v."issueId" WHERE v."userId" = ${reporterId}
        `);

        expect(issues.map((r) => r.title).sort()).toEqual(
            issueTemplates.filter((t) => t.reporterEmail === SEED_ACCOUNTS.reporter).map((t) => t.title).sort(),
        );
        expect(upvotes.map((r) => r.title).sort()).toEqual(
            issueTemplates.filter((t) => t.endorsedBy?.includes(SEED_ACCOUNTS.reporter)).map((t) => t.title).sort(),
        );
    });
});

describe('seeded accounts', () => {
    it.each(Object.keys(SEED_ACCOUNTS) as Account[])('%s logs in through /api/auth/login', async (account) => {
        const { token } = await login(account);
        expect(token).toEqual(expect.any(String));
    });

    describe('GET /organizations/me and /me/membership', () => {
        const cases: { account: Account; org: string | null; role: string | null }[] = [
            { account: 'reporter', org: null, role: null },
            { account: 'admin', org: null, role: null },
            { account: 'orgAdmin', org: ORG_A_SLUG, role: 'ORG_ADMIN' },
            { account: 'orgMember', org: ORG_A_SLUG, role: 'ORG_MEMBER' },
            { account: 'otherOrg', org: ORG_B_SLUG, role: 'ORG_MEMBER' },
        ];

        it.each(cases)('$account -> $org $role', async ({ account, org, role }) => {
            const user = await as(account);

            const me = await user.get('/organizations/me');
            const membership = await user.get('/organizations/me/membership');

            expect(me.status).toBe(200);
            expect(membership.status).toBe(200);
            expect(me.body?.slug ?? null).toBe(org);
            expect(membership.body?.role ?? null).toBe(role);
        });
    });

    describe('GET /organizations/:orgId/getMembershipsbyOrgId', () => {
        const cases: { account: Account; org: string; status: number }[] = [
            { account: 'orgMember', org: ORG_A_SLUG, status: 200 },
            { account: 'orgMember', org: ORG_B_SLUG, status: 403 },
            { account: 'otherOrg', org: ORG_A_SLUG, status: 403 },
            { account: 'reporter', org: ORG_A_SLUG, status: 403 },
            { account: 'admin', org: ORG_A_SLUG, status: 200 },
            { account: 'admin', org: ORG_B_SLUG, status: 200 },
        ];

        it.each(cases)('$account on $org -> $status', async ({ account, org, status }) => {
            const user = await as(account);

            const response = await user.get(`/organizations/${await orgId(org)}/getMembershipsbyOrgId`);

            expect(response.status).toBe(status);
        });
    });

    describe(':userId org routes, looking up orgmember@', () => {
        const routes = ['getOrgByUserId', 'getMembershipByUserId'];
        const cases: { account: Account; status: number }[] = [
            { account: 'reporter', status: 403 },
            { account: 'orgAdmin', status: 403 },
            { account: 'otherOrg', status: 403 },
            { account: 'admin', status: 200 },
            // Self is allowed; requireSelfOrAdmin.
            { account: 'orgMember', status: 200 },
        ];

        for (const route of routes) {
            it.each(cases)(`${route}: $account -> $status`, async ({ account, status }) => {
                const user = await as(account);
                const target = await userId(SEED_ACCOUNTS.orgMember);

                const response = await user.get(`/organizations/${target}/${route}`);

                expect(response.status).toBe(status);
            });
        }
    });

    describe(`claim, update, status on "${CLAIM_TARGET}" (org A)`, () => {
        const update = { message: 'Crew scheduled for Tuesday', status: 'IN_PROGRESS', photos: [] };

        it('lets an org A member claim it, and any org A member act on it', async () => {
            const member = await as('orgMember');
            const orgAdmin = await as('orgAdmin');
            const id = await issueId(CLAIM_TARGET);

            expect((await member.post(`/issues/${id}/claim`)).status).toBe(200);
            // A different member of the claiming org.
            expect((await orgAdmin.post(`/issues/${id}/update`, update)).status).toBe(201);
            expect((await orgAdmin.patch(`/issues/${id}/status`, { status: 'RESOLVED' })).status).toBe(200);
            expect((await member.post(`/issues/${id}/release`)).status).toBe(200);
        });

        it.each(['reporter', 'admin'] as Account[])('refuses a claim from %s (no org)', async (account) => {
            const user = await as(account);

            const response = await user.post(`/issues/${await issueId(CLAIM_TARGET)}/claim`);

            expect(response.status).toBe(403);
        });

        // requirePermission's claim branch only checks that the caller is in
        // some org; the service-area check is a TODO there. Flip to it() once
        // that lands. Vitest reports this case as passing while the gap exists.
        it.fails('refuses a claim from org B', async () => {
            const outsider = await as('otherOrg');

            const response = await outsider.post(`/issues/${await issueId(CLAIM_TARGET)}/claim`);

            expect(response.status).toBe(403);
        });

        describe('once org A has claimed it', () => {
            async function claimedByOrgA() {
                const member = await as('orgMember');
                const id = await issueId(CLAIM_TARGET);
                expect((await member.post(`/issues/${id}/claim`)).status).toBe(200);
                return id;
            }

            it.each(['reporter', 'otherOrg'] as Account[])('refuses update, status and release from %s', async (account) => {
                const id = await claimedByOrgA();
                const user = await as(account);

                expect((await user.post(`/issues/${id}/update`, update)).status).toBe(403);
                expect((await user.patch(`/issues/${id}/status`, { status: 'RESOLVED' })).status).toBe(403);
                expect((await user.post(`/issues/${id}/release`)).status).toBe(403);
            });

            it('lets a platform ADMIN update and change status, but not release', async () => {
                const id = await claimedByOrgA();
                const admin = await as('admin');

                // ADMIN's rolePermissions include these two; release goes
                // through the org check, which an org-less admin fails.
                expect((await admin.post(`/issues/${id}/update`, update)).status).toBe(201);
                expect((await admin.patch(`/issues/${id}/status`, { status: 'RESOLVED' })).status).toBe(200);
                expect((await admin.post(`/issues/${id}/release`)).status).toBe(403);
            });
        });
    });
});
