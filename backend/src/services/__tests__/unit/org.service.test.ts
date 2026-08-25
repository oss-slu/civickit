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

describe('OrgService', () => {
  let orgService: OrgService;
  let mockOrgRepository: Mocked<OrgRepository>;
  let mockPhotoRepository: Mocked<PhotoRepository>
  let mockIssueRepository: Mocked<IssueRepository>

  beforeEach(() => {
    mockOrgRepository = {
      findOrgsForIssue: vi.fn(),
      findIssuesForOrg: vi.fn(),
    } as unknown as Mocked<OrgRepository>;

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
});
