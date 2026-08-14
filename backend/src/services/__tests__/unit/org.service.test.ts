// backend/src/services/__tests__/unit/org.service.test.ts
//
// The service's validation, with the repository mocked. The routing rules
// themselves are SQL and are covered by
// repositories/__tests__/integration/org.repository.integration.test.ts.

import { describe, beforeEach, vi, it, expect, Mocked } from 'vitest';
import { OrgService } from '../../org.service';
import { OrgRepository } from '../../../repositories/org.repository';
import { ImageRepository } from '../../../repositories/image.repository';
import { IssueRepository } from '../../../repositories/issue.repository';

describe('OrgService', () => {
  let orgService: OrgService;
  let mockOrgRepository: Mocked<OrgRepository>;
  let mockImageRepository: Mocked<ImageRepository>
  let mockIssueRepository: Mocked<IssueRepository>

  beforeEach(() => {
    mockOrgRepository = {
      findOrgsForIssue: vi.fn(),
      findIssuesForOrg: vi.fn(),
    } as unknown as Mocked<OrgRepository>;

    mockImageRepository = {
      create: vi.fn(),
      findById: vi.fn(),
    } as unknown as Mocked<ImageRepository>;

    mockIssueRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findNearby: vi.fn(),
    } as unknown as Mocked<IssueRepository>;

    orgService = new OrgService(mockOrgRepository, mockImageRepository, mockIssueRepository);
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
      const issues = [{ id: 'issue-1', imageIds: [] }];
      mockOrgRepository.findIssuesForOrg.mockResolvedValue(issues as any);

      const mockReturn = [{
        claimedByOrg: {
          id: undefined,
          name: undefined,
          profileImage: undefined,
        },
        claimedByUser: {
          id: undefined,
          name: undefined,
          profileImage: undefined,
        },
        id: "issue-1",
        images: [],
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
});
