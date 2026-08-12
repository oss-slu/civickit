// backend/src/repositories/__tests__/integration/membership.repository.integration.test.ts
//
// findByUserAndOrg is what every organization-scoped authorization decision
// rests on, and its scoping is entirely in the WHERE clause. A mocked
// repository would only assert that a stub returned what it was handed, so
// these run against the real database.

import { describe, it, expect } from 'vitest';
import { MembershipRepository } from '../../membership.repository';
import { makeOrg, makeUser } from '../../../__tests__/integration/factories';
import db from '../../../db';
import { orgMemberships } from '../../../db/schema';

const repository = new MembershipRepository();

describe('MembershipRepository', () => {
  describe('findByUserAndOrg', () => {
    it('returns the membership when the user belongs to that organization', async () => {
      const user = await makeUser();
      const org = await makeOrg();
      await db.insert(orgMemberships).values({
        userId: user.id,
        organizationId: org.id,
        role: 'ORG_ADMIN',
      });

      const membership = await repository.findByUserAndOrg(user.id, org.id);

      expect(membership).toMatchObject({
        userId: user.id,
        organizationId: org.id,
        role: 'ORG_ADMIN',
      });
    });

    // The escalation guard: admin of one org, nothing in another. An
    // unscoped lookup would return the org-a row and read as "is an admin".
    it('returns null for an organization the user does not belong to', async () => {
      const user = await makeUser();
      const memberOf = await makeOrg();
      const other = await makeOrg();
      await db.insert(orgMemberships).values({
        userId: user.id,
        organizationId: memberOf.id,
        role: 'ORG_ADMIN',
      });

      expect(await repository.findByUserAndOrg(user.id, other.id)).toBeNull();
    });

    it('returns null for a user with no memberships at all', async () => {
      const user = await makeUser();
      const org = await makeOrg();

      expect(await repository.findByUserAndOrg(user.id, org.id)).toBeNull();
    });

    // Same org, different user -- the userId half of the filter has to bind too.
    it('returns a single membership, not a list', async () => {
      const user = await makeUser();
      const org = await makeOrg();
      await db.insert(orgMemberships).values({
        userId: user.id,
        organizationId: org.id,
        role: 'ORG_ADMIN',
      });

      const membership = await repository.findByUserAndOrg(user.id, org.id);

      expect(Array.isArray(membership)).toBe(false);
    });

    it('does not return another user membership in the same organization', async () => {
      const member = await makeUser();
      const outsider = await makeUser();
      const org = await makeOrg();
      await db.insert(orgMemberships).values({
        userId: member.id,
        organizationId: org.id,
        role: 'ORG_ADMIN',
      });

      expect(await repository.findByUserAndOrg(outsider.id, org.id)).toBeNull();
    });
  });

  // create() re-reads through findById, so an array there is what reached the
  // wire: POST /createMembership answered [{...}] while every sibling endpoint
  // answers {...}.
  describe('findById', () => {
    it('returns a single membership, not a list', async () => {
      const user = await makeUser();
      const org = await makeOrg();

      const created = await repository.create({
        userId: user.id,
        organizationId: org.id,
        role: 'ORG_MEMBER',
      });

      expect(Array.isArray(created)).toBe(false);
      expect(created).toMatchObject({ userId: user.id, organizationId: org.id });
    });

    it('returns null for an id that matches nothing', async () => {
      expect(await repository.findById('no-such-membership')).toBeNull();
    });
  });
});
