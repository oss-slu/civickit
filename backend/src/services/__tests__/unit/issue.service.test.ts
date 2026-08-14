// backend/src/services/__tests__/unit/issue.service.test.ts

// TODO: Add validation for latitude/longitude ranges
// TODO: Add validation for allowed categories (enum)
// TODO: Add image upload integration test

import { IssueService } from '../../issue.service';
import { IssueRepository } from '../../../repositories/issue.repository';
import { describe, beforeEach, vi, it, expect, Mocked } from 'vitest';
import { CreateIssueDTO, extractPhotoMetadataFromExif, resolvePhotoMetadata } from '@civickit/shared';
import { mock } from 'node:test';
import { ImageRepository } from '../../../repositories/image.repository';
import { AuthRepository } from '../../../repositories/auth.repository';
import { OrgRepository } from '../../../repositories/org.repository';
import { MembershipRepository } from '../../../repositories/membership.repository';

// Mock the repository, not integration test
vi.mock('../../../src/repositories/issue.repository');

describe('IssueService', () => {
  let issueService: IssueService;
  let mockIssueRepository: Mocked<IssueRepository>;
  let mockImageRepository: Mocked<ImageRepository>
  let mockAuthRepository: Mocked<AuthRepository>
  let mockOrgRepository: Mocked<OrgRepository>
  let mockMembershipRepository: Mocked<MembershipRepository>

  beforeEach(() => {
    // Create mock repository
    mockIssueRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findNearby: vi.fn(),
      findByUser: vi.fn(),
      findByUpvoter: vi.fn(),
      claimIssue: vi.fn(),
      releaseIssue: vi.fn(),
    } as unknown as Mocked<IssueRepository>;
    mockImageRepository = {
      create: vi.fn(),
      findById: vi.fn(),
    } as unknown as Mocked<ImageRepository>;
    mockAuthRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findNearby: vi.fn(),
    } as unknown as Mocked<AuthRepository>;

    mockOrgRepository = {
      findOrgsForIssue: vi.fn(),
      findIssuesForOrg: vi.fn(),
      findById: vi.fn()
    } as unknown as Mocked<OrgRepository>;

    mockMembershipRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByUser: vi.fn(),
      findByUserAndOrg: vi.fn(),
      findByOrganization: vi.fn(),
    } as unknown as Mocked<MembershipRepository>;

    issueService = new IssueService(mockIssueRepository, mockImageRepository, mockOrgRepository, mockAuthRepository, mockMembershipRepository);
  });

  const makeInput = (
    overrides: Partial<CreateIssueDTO> = {}
  ): CreateIssueDTO => ({
    title: 'Test Issue',
    description: 'Test Description',
    category: 'POTHOLE',
    status: 'REPORTED',
    latitude: 38.627,
    longitude: -90.1994,
    address: "",
    imageIds: [],
    ...overrides,
  });

  const otherInfo = {
    claimedByOrg: {
      id: undefined,
      name: undefined,
      profileImage: undefined,
    },
    claimedByUser: {
      id: undefined,
      name: undefined,
      profileImage: undefined,
    }
  }

  describe('createIssue', () => {
    it('should create an issue successfully', async () => {
      const mockIssue = {
        id: 'test-id',
        title: 'Test Issue',
        description: 'Test Description',
        category: 'POTHOLE',
        status: 'REPORTED',
        latitude: 38.6270,
        longitude: -90.1994,
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockIssueRepository.create.mockResolvedValue({ ...mockIssue, imageIds: [] } as any);

      const result = await issueService.createIssue(
        makeInput(),
        'user-123',
      );

      expect(result).toEqual({ ...mockIssue, images: [], ...otherInfo });
      expect(mockIssueRepository.create).toHaveBeenCalledWith({
        ...makeInput(),
        userId: 'user-123',
      });
      expect(mockIssueRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should pass photo metadata through when creating an issue', async () => {
      const input = makeInput({
        latitude: 38.64,
        longitude: -90.22,
        locationSource: 'exif',
        photoTakenAt: '2026-06-18T14:30:00.000Z',
        photoTakenAtSource: 'exif',
      });

      mockIssueRepository.create.mockResolvedValue({ id: 'test-id', ...input } as any);

      await issueService.createIssue(input, 'user-123');

      expect(mockIssueRepository.create).toHaveBeenCalledWith({
        ...input,
        userId: 'user-123',
      });
    });

    it('should throw error if title is too short', async () => {
      await expect(
        issueService.createIssue(
          makeInput({ title: 'AB' }), //title too short
          'user-123'
        )
      ).rejects.toThrow('Title must be at least 3 characters');
    });
    it('should throw if category is missing', async () => {
      await expect(
        issueService.createIssue(
          makeInput({ category: null as any }), //no category
          'user-123'
        )
      ).rejects.toThrow('Category is required');
      expect(mockIssueRepository.create).not.toHaveBeenCalled(); // proves validation stops execution before hitting the DB
    });
    it('should throw if latitude is missing', async () => {
      await expect(
        issueService.createIssue(
          makeInput({ latitude: undefined as any }),
          'user-123'
        )
      ).rejects.toThrow('Latitude and longitude are required');
      expect(mockIssueRepository.create).not.toHaveBeenCalled();
    });

    it('should throw if longitude is missing', async () => {
      await expect(
        issueService.createIssue(
          makeInput({ longitude: undefined as any }),
          'user-123'
        )
      ).rejects.toThrow('Latitude and longitude are required');
      expect(mockIssueRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('photo metadata helpers', () => {
    it('should prefer EXIF location and timestamp over phone fallback', () => {
      const exifMetadata = extractPhotoMetadataFromExif({
        GPSLatitude: 38.64,
        GPSLongitude: 90.22,
        GPSLongitudeRef: 'W',
        DateTimeOriginal: '2026:06:18 14:30:00',
      });

      const resolved = resolvePhotoMetadata([exifMetadata], {
        latitude: 38.627,
        longitude: -90.1994,
        takenAt: '2026-06-19T15:00:00.000Z',
      });

      expect(resolved).toMatchObject({
        latitude: 38.64,
        longitude: -90.22,
        locationSource: 'exif',
        photoTakenAtSource: 'exif',
      });
      expect(resolved.photoTakenAt).toBe(new Date('2026-06-18 14:30:00').toISOString());
    });

    it('should fall back to phone location and time when EXIF is missing', () => {
      const resolved = resolvePhotoMetadata([extractPhotoMetadataFromExif({})], {
        latitude: 38.627,
        longitude: -90.1994,
        takenAt: '2026-06-19T15:00:00.000Z',
      });

      expect(resolved).toEqual({
        latitude: 38.627,
        longitude: -90.1994,
        locationSource: 'device',
        photoTakenAt: '2026-06-19T15:00:00.000Z',
        photoTakenAtSource: 'device',
      });
    });

    it('should reject 0,0 EXIF coordinates and fall back to phone location', () => {
      const resolved = resolvePhotoMetadata([extractPhotoMetadataFromExif({
        GPSLatitude: 0,
        GPSLongitude: 0,
        DateTimeOriginal: '2026:06:18 14:30:00',
      })], {
        latitude: 38.627,
        longitude: -90.1994,
        takenAt: '2026-06-19T15:00:00.000Z',
      });

      expect(resolved).toMatchObject({
        latitude: 38.627,
        longitude: -90.1994,
        locationSource: 'device',
        photoTakenAtSource: 'exif',
      });
    });
  });

  describe('getIssueById', () => {
    it('should return issue if found', async () => {
      const mockIssue = {
        id: '123',
        imageIds: []
      };
      mockIssueRepository.findById.mockResolvedValue(mockIssue as any);

      const result = await issueService.getIssueById('123');

      expect(result).toEqual({ id: '123', images: [], ...otherInfo });
      expect(mockIssueRepository.findById).toHaveBeenCalledWith('123');
    });

    it('should throw error if issue not found', async () => {
      mockIssueRepository.findById.mockResolvedValue(null);

      await expect(
        issueService.getIssueById('123')
      ).rejects.toThrow('Issue not found');
    });
  });

  describe('getNearbyIssues', () => {
    it('should return issues from the repository without an N+1 upvote count loop', async () => {
      const mockIssues = [
        {
          id: 'issue-1',
          upvoteCount: 3,
        },
        {
          id: 'issue-2',
          upvoteCount: 0,
        },
      ];
      mockIssueRepository.findNearby.mockResolvedValue(mockIssues.map((mi) => { return { ...mi, imageIds: [] } }) as any);

      const result = await issueService.getNearbyIssues(38.627, -90.1994);

      expect(mockIssueRepository.findNearby).toHaveBeenCalledWith(
        38.627,
        -90.1994,
        undefined,
        undefined
      );
      expect(result).toEqual(mockIssues.map((mi) => { return { ...mi, images: [], ...otherInfo } }));
      result.forEach((issue) => {
        expect(typeof issue.upvoteCount).toBe('number');
      });
    });

    it('should pass radius and limit through to the repository', async () => {
      mockIssueRepository.findNearby.mockResolvedValue([]);

      await issueService.getNearbyIssues(38.627, -90.1994, 500, 50);

      expect(mockIssueRepository.findNearby).toHaveBeenCalledWith(
        38.627,
        -90.1994,
        500,
        50
      );
    });
  });

  describe('getIssuesByUser', () => {
    it('should pass the repository rows through with their upvoteCount', async () => {
      const mockIssues = [
        { id: 'issue-1', upvoteCount: 5, imageIds: [] },
        { id: 'issue-2', upvoteCount: 0, imageIds: [] },
      ];
      mockIssueRepository.findByUser.mockResolvedValue(mockIssues as any);

      const result = await issueService.getIssuesByUser('user-123');

      expect(result).toEqual(mockIssues.map((mi) => {
        let newMI: any = mi
        delete newMI.imageIds
        return { ...newMI, images: [], ...otherInfo }
      }));

      result.forEach((issue) => {
        expect(typeof issue.upvoteCount).toBe('number');
      });
    });
  });

  describe('getIssuesByUserUpvotes', () => {
    it('should call findByUpvoter exactly once and never call findById', async () => {
      const mockIssues = [
        { id: 'issue-1', upvoteCount: 2, imageIds: [] },
      ];
      mockIssueRepository.findByUpvoter.mockResolvedValue(mockIssues as any);

      const result = await issueService.getIssuesByUserUpvotes('user-123');

      expect(mockIssueRepository.findByUpvoter).toHaveBeenCalledTimes(1);
      expect(mockIssueRepository.findByUpvoter).toHaveBeenCalledWith('user-123', undefined);
      expect(mockIssueRepository.findById).not.toHaveBeenCalled();
      expect(result).toEqual([
        {
          id: 'issue-1', upvoteCount: 2, images: [], claimedByOrg: {
            id: undefined,
            name: undefined,
            profileImage: undefined,
          },
          claimedByUser: {
            id: undefined,
            name: undefined,
            profileImage: undefined,
          },
        },
      ]);
      result.forEach((issue) => {
        expect(typeof issue.upvoteCount).toBe('number');
      });
    });
  });

  describe('updateStatus', () => {
    beforeEach(() => {
      mockIssueRepository.updateStatus = vi.fn();
    });

    it('should pass a valid status through to the repository', async () => {
      const updated = { id: 'issue-1', status: 'RESOLVED', imageIds: [] };
      (mockIssueRepository.updateStatus as any).mockResolvedValue(updated);

      const result = await issueService.updateStatus('issue-1', 'RESOLVED');

      expect(mockIssueRepository.updateStatus).toHaveBeenCalledWith('issue-1', {
        status: 'RESOLVED',
      });
      expect(result).toEqual({
        id: 'issue-1', status: 'RESOLVED', images: [],
        claimedByOrg: {
          id: undefined,
          name: undefined,
          profileImage: undefined
        },
        claimedByUser: {
          id: undefined,
          name: undefined,
          profileImage: undefined
        }
      });
    });

    // PATCH /:issueId/status reads req.body.status with no body validation, so
    // these arrive exactly as written.
    it.each([
      ['missing', undefined],
      ['null', null],
      ['empty', ''],
      ['not a member of the enum', 'BANANA'],
      ['the wrong type', 42],
    ])('should reject a status that is %s with a 400', async (_label, status) => {
      await expect(
        issueService.updateStatus('issue-1', status as never),
      ).rejects.toThrow('A valid status is required');

      expect(mockIssueRepository.updateStatus).not.toHaveBeenCalled();
    });
  });

  // A claim is exclusive: it is what tells one organization the issue is theirs
  // to work. The repository applies the write conditionally and returns null
  // when it did not apply, so the service reads back to say why.
  describe('claimIssue', () => {
    it('claims an issue that nobody holds', async () => {
      const claimed = { id: 'issue-1', claimedById: 'user-1', imageIds: [] };
      mockIssueRepository.claimIssue.mockResolvedValue(claimed as any);

      const result = await issueService.claimIssue('issue-1', 'user-1');

      expect(result).toEqual({ id: claimed.id, claimedById: 'user-1', images: [], ...otherInfo });
      expect(mockIssueRepository.claimIssue).toHaveBeenCalledWith('issue-1', {
        claimedById: 'user-1',
      });
    });

    it('rejects claiming an issue another user already holds with a 409', async () => {
      mockIssueRepository.claimIssue.mockResolvedValue(null as any);
      mockIssueRepository.findById.mockResolvedValue({
        id: 'issue-1',
        claimedById: 'someone-else',
      } as any);

      await expect(issueService.claimIssue('issue-1', 'user-1')).rejects.toMatchObject({
        statusCode: 409,
      });
    });

    // A double-tap on Claim must not surface an error to the user who already
    // holds the issue.
    it('is idempotent when the same user re-claims an issue they hold', async () => {
      const held = { id: 'issue-1', claimedById: 'user-1' };
      mockIssueRepository.claimIssue.mockResolvedValue(null as any);
      mockIssueRepository.findById.mockResolvedValue(held as any);

      const result = await issueService.claimIssue('issue-1', 'user-1');

      expect(result).toMatchObject({ id: 'issue-1', claimedById: 'user-1' });
    });

    it('reports a 404 when the issue does not exist', async () => {
      mockIssueRepository.claimIssue.mockResolvedValue(null as any);
      mockIssueRepository.findById.mockResolvedValue(null as any);

      await expect(issueService.claimIssue('nope', 'user-1')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
