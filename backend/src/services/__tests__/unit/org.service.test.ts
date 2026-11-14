// backend/src/services/__tests__/unit/org.service.test.ts
//
// The service's validation, with the repository mocked. The routing rules
// themselves are SQL and are covered by
// repositories/__tests__/integration/org.repository.integration.test.ts.

import { describe, beforeEach, vi, it, expect, Mocked } from 'vitest';
import { OrgService } from '../../org.service';
import { OrgRepository } from '../../../repositories/org.repository';
import { PhotoRepository } from '../../../repositories/photo.repository';
import { IssueRepository } from '../../../repositories/issue.repository';

// OrgService builds its MembershipRepository at module load, so it is mocked
// here rather than injected.
const { findByUser } = vi.hoisted(() => ({ findByUser: vi.fn() }));
vi.mock('../../../repositories/membership.repository', () => ({
  MembershipRepository: class {
    findByUser = findByUser;
  },
}));

describe('OrgService', () => {
  let orgService: OrgService;
  let mockOrgRepository: Mocked<OrgRepository>;
  let mockPhotoRepository: Mocked<PhotoRepository>
  let mockIssueRepository: Mocked<IssueRepository>

  beforeEach(() => {
    mockOrgRepository = {
      findOrgsForIssue: vi.fn(),
      findIssuesForOrg: vi.fn(),
      findById: vi.fn(),
    } as unknown as Mocked<OrgRepository>;
    findByUser.mockReset();

    mockPhotoRepository = {
      createMany: vi.fn(),
      findById: vi.fn(),
      findOriginalsByIssueIds: vi.fn().mockResolvedValue(new Map()),
      findByTimelineEntryIds: vi.fn().mockResolvedValue(new Map()),
      softDelete: vi.fn(),
    } as unknown as Mocked<PhotoRepository>;

    mockIssueRepository = {
      createWithPhotos: vi.fn(),
      findById: vi.fn(),
      findNearby: vi.fn(),
    } as unknown as Mocked<IssueRepository>;



    orgService = new OrgService(mockOrgRepository, mockPhotoRepository, mockIssueRepository);
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

      const mockReturn = [{
        claimedByOrg: null,
        claimedByUser: null,
        id: "issue-1",
        photos: [],
      }]

      const result = await orgService.findIssuesForOrg('org-1');

      expect(result).toEqual(mockReturn);
      expect(mockOrgRepository.findIssuesForOrg).toHaveBeenCalledWith('org-1');
    });

    it('should throw if organizationId is missing', async () => {
      await expect(orgService.findIssuesForOrg('')).rejects.toThrow(
        'organizationId is required'
      );
      expect(mockOrgRepository.findIssuesForOrg).not.toHaveBeenCalled();
    });
  });

  describe('getOrgForUser', () => {
    it("returns the user's org, with its photo resolved", async () => {
      findByUser.mockResolvedValue({ userId: 'user-1', organizationId: 'org-1', role: 'ORG_MEMBER' });
      mockOrgRepository.findById.mockResolvedValue({ id: 'org-1', name: 'Org', profilePhotoId: null } as any);

      const org = await orgService.getOrgForUser('user-1');

      expect(mockOrgRepository.findById).toHaveBeenCalledWith('org-1');
      expect(org).toEqual({ id: 'org-1', name: 'Org', profilePhoto: null });
    });

    it('returns null for a user with no membership, without looking up an org', async () => {
      findByUser.mockResolvedValue(null);

      await expect(orgService.getOrgForUser('user-1')).resolves.toBeNull();
      expect(mockOrgRepository.findById).not.toHaveBeenCalled();
    });

    it('returns null when the membership points at an org that no longer exists', async () => {
      findByUser.mockResolvedValue({ userId: 'user-1', organizationId: 'gone', role: 'ORG_MEMBER' });
      mockOrgRepository.findById.mockResolvedValue(null);

      await expect(orgService.getOrgForUser('user-1')).resolves.toBeNull();
    });
  });

  describe('getOrgByUserId', () => {
    it('throws a 404 for a user with no org', async () => {
      findByUser.mockResolvedValue(null);

      await expect(orgService.getOrgByUserId('user-1')).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
