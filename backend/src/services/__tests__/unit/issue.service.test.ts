// backend/src/services/__tests__/unit/issue.service.test.ts

// TODO: Add validation for latitude/longitude ranges
// TODO: Add validation for allowed categories (enum)
// TODO: Add image upload integration test

import { IssueService } from '../../issue.service';
import { IssueRepository } from '../../../repositories/issue.repository';
import { UpvoteRepository } from '../../../repositories/upvote.repository';
import { describe, beforeEach, vi, it, expect, Mocked } from 'vitest';
import { CreateIssueDTO, extractPhotoMetadataFromExif, resolvePhotoMetadata } from '@civickit/shared';
import { mock } from 'node:test';

// Mock the repository, not integration test
vi.mock('../../../src/repositories/issue.repository');
vi.mock('../../../src/repositories/upvote.repository');

describe('IssueService', () => {
  let issueService: IssueService;
  let mockIssueRepository: Mocked<IssueRepository>;
  let mockUpvoteRepository: Mocked<UpvoteRepository>;

  beforeEach(() => {
    // Create mock repository
    mockIssueRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findNearby: vi.fn(),
      findByUser: vi.fn(),
      findByUpvoter: vi.fn(),
    } as unknown as Mocked<IssueRepository>;

    mockUpvoteRepository = {
      createUpvote: vi.fn(),
      deleteUpvote: vi.fn(),
      countUpvotes: vi.fn(),
      exists: vi.fn(),
    } as unknown as Mocked<UpvoteRepository>;

    issueService = new IssueService(mockIssueRepository, mockUpvoteRepository);
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
    images: [],
    ...overrides,
  });

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
        images: [],
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockIssueRepository.create.mockResolvedValue(mockIssue as any);

      const result = await issueService.createIssue(
        makeInput(),
        'user-123'
      );

      expect(result).toEqual(mockIssue);
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
      const mockIssue = { id: '123' };
      mockIssueRepository.findById.mockResolvedValue(mockIssue as any);

      const result = await issueService.getIssueById('123');

      expect(result).toEqual(mockIssue);
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
        { id: 'issue-1', upvoteCount: 3 },
        { id: 'issue-2', upvoteCount: 0 },
      ];
      mockIssueRepository.findNearby.mockResolvedValue(mockIssues as any);

      const result = await issueService.getNearbyIssues(38.627, -90.1994);

      expect(mockUpvoteRepository.countUpvotes).not.toHaveBeenCalled();
      expect(mockIssueRepository.findNearby).toHaveBeenCalledWith(
        38.627,
        -90.1994,
        undefined,
        undefined
      );
      expect(result).toEqual(mockIssues);
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
    it('should not call countUpvotes and should map _count.upvotes onto upvoteCount', async () => {
      const mockIssues = [
        { id: 'issue-1', _count: { upvotes: 5 } },
        { id: 'issue-2', _count: { upvotes: 0 } },
      ];
      mockIssueRepository.findByUser.mockResolvedValue(mockIssues as any);

      const result = await issueService.getIssuesByUser('user-123');

      expect(mockUpvoteRepository.countUpvotes).not.toHaveBeenCalled();
      expect(result).toEqual([
        { id: 'issue-1', _count: { upvotes: 5 }, upvoteCount: 5 },
        { id: 'issue-2', _count: { upvotes: 0 }, upvoteCount: 0 },
      ]);
      result.forEach((issue) => {
        expect(typeof issue.upvoteCount).toBe('number');
      });
    });
  });

  describe('getIssuesByUserUpvotes', () => {
    it('should call findByUpvoter exactly once and never call findById', async () => {
      const mockIssues = [
        { id: 'issue-1', _count: { upvotes: 2 } },
      ];
      mockIssueRepository.findByUpvoter.mockResolvedValue(mockIssues as any);

      const result = await issueService.getIssuesByUserUpvotes('user-123');

      expect(mockIssueRepository.findByUpvoter).toHaveBeenCalledTimes(1);
      expect(mockIssueRepository.findByUpvoter).toHaveBeenCalledWith('user-123', undefined);
      expect(mockIssueRepository.findById).not.toHaveBeenCalled();
      expect(mockUpvoteRepository.countUpvotes).not.toHaveBeenCalled();
      expect(result).toEqual([
        { id: 'issue-1', _count: { upvotes: 2 }, upvoteCount: 2 },
      ]);
      result.forEach((issue) => {
        expect(typeof issue.upvoteCount).toBe('number');
      });
    });
  });
});
