// backend/src/services/__tests__/unit/membership.service.test.ts
//
// createMembership is the privilege boundary for an organization: it is the
// only way to grant someone ORG_ADMIN. These tests pin down that the caller
// must already be an ORG_ADMIN *of the organization being written to*.

import { describe, beforeEach, vi, it, expect, Mocked } from 'vitest';
import { MembershipService } from '../../membership.service';
import { MembershipRepository } from '../../../repositories/membership.repository';

describe('MembershipService', () => {
  let membershipService: MembershipService;
  let mockMembershipRepository: Mocked<MembershipRepository>;

  const ADMIN_OF_ORG_A = {
    id: 'membership-1',
    userId: 'caller-1',
    organizationId: 'org-a',
    role: 'ORG_ADMIN' as const,
  };

  beforeEach(() => {
    mockMembershipRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByUser: vi.fn(),
      findByUserAndOrg: vi.fn(),
      findByOrganization: vi.fn(),
    } as unknown as Mocked<MembershipRepository>;

    membershipService = new MembershipService(mockMembershipRepository);
  });

  describe('createMembership', () => {
    const newMember = {
      userId: 'user-2',
      organizationId: 'org-a',
      role: 'ORG_MEMBER' as const,
    };

    it('lets an ORG_ADMIN of the target organization add a member', async () => {
      mockMembershipRepository.findByUserAndOrg.mockResolvedValue(ADMIN_OF_ORG_A as any);
      mockMembershipRepository.create.mockResolvedValue({ id: 'membership-2' } as any);

      const result = await membershipService.createMembership(newMember, 'caller-1');

      expect(result).toEqual({ id: 'membership-2' });
      expect(mockMembershipRepository.findByUserAndOrg).toHaveBeenCalledWith('caller-1', 'org-a');
      expect(mockMembershipRepository.create).toHaveBeenCalledWith(newMember);
    });

    it('rejects a caller who is not a member of the target organization', async () => {
      mockMembershipRepository.findByUserAndOrg.mockResolvedValue(null as any);

      await expect(
        membershipService.createMembership(newMember, 'outsider-1'),
      ).rejects.toMatchObject({ statusCode: 403 });

      expect(mockMembershipRepository.create).not.toHaveBeenCalled();
    });

    it('rejects a caller who is only an ORG_MEMBER of the target organization', async () => {
      mockMembershipRepository.findByUserAndOrg.mockResolvedValue({
        ...ADMIN_OF_ORG_A,
        role: 'ORG_MEMBER',
      } as any);

      await expect(
        membershipService.createMembership(newMember, 'caller-1'),
      ).rejects.toMatchObject({ statusCode: 403 });

      expect(mockMembershipRepository.create).not.toHaveBeenCalled();
    });

    // The escalation this guards against: being ORG_ADMIN somewhere must not
    // grant write access everywhere. findByUser (unscoped, LIMIT 1) would
    // return the org-a admin row here and wrongly allow the write.
    it('rejects an ORG_ADMIN of a different organization', async () => {
      mockMembershipRepository.findByUser.mockResolvedValue(ADMIN_OF_ORG_A as any);
      mockMembershipRepository.findByUserAndOrg.mockResolvedValue(null as any);

      await expect(
        membershipService.createMembership(
          { ...newMember, organizationId: 'org-b' },
          'caller-1',
        ),
      ).rejects.toMatchObject({ statusCode: 403 });

      expect(mockMembershipRepository.create).not.toHaveBeenCalled();
    });

    it('rejects a request with no authenticated caller', async () => {
      await expect(
        membershipService.createMembership(newMember, undefined as any),
      ).rejects.toMatchObject({ statusCode: 401 });

      expect(mockMembershipRepository.findByUserAndOrg).not.toHaveBeenCalled();
      expect(mockMembershipRepository.create).not.toHaveBeenCalled();
    });

    it('rejects a request with no target organization', async () => {
      await expect(
        membershipService.createMembership(
          { ...newMember, organizationId: '' },
          'caller-1',
        ),
      ).rejects.toMatchObject({ statusCode: 400 });

      expect(mockMembershipRepository.create).not.toHaveBeenCalled();
    });

    it('rejects a request with no user to add', async () => {
      mockMembershipRepository.findByUserAndOrg.mockResolvedValue(ADMIN_OF_ORG_A as any);

      await expect(
        membershipService.createMembership({ ...newMember, userId: '' }, 'caller-1'),
      ).rejects.toMatchObject({ statusCode: 400 });

      expect(mockMembershipRepository.create).not.toHaveBeenCalled();
    });

    // A userId that is well-formed but belongs to nobody only fails at the
    // foreign key. Left unmapped that surfaces as 500 -- an alarm saying the
    // server broke, when the caller sent a bad id.
    it('reports a 404 when the insert hits a foreign key violation', async () => {
      mockMembershipRepository.findByUserAndOrg.mockResolvedValue(ADMIN_OF_ORG_A as any);
      mockMembershipRepository.create.mockRejectedValue(
        Object.assign(new Error('Failed query'), { cause: { code: '23503' } }),
      );

      await expect(
        membershipService.createMembership(newMember, 'caller-1'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    // OrgMembership_userId_organizationId_key: one row per person per org.
    // Re-adding someone is a conflict with existing state, not a server fault.
    it('reports a 409 when the user is already in the organization', async () => {
      mockMembershipRepository.findByUserAndOrg.mockResolvedValue(ADMIN_OF_ORG_A as any);
      mockMembershipRepository.create.mockRejectedValue(
        Object.assign(new Error('Failed query'), { cause: { code: '23505' } }),
      );

      await expect(
        membershipService.createMembership(newMember, 'caller-1'),
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('does not swallow an unrelated repository failure', async () => {
      mockMembershipRepository.findByUserAndOrg.mockResolvedValue(ADMIN_OF_ORG_A as any);
      mockMembershipRepository.create.mockRejectedValue(new Error('database is down'));

      await expect(
        membershipService.createMembership(newMember, 'caller-1'),
      ).rejects.toThrow('database is down');
    });
  });
});
