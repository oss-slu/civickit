//backend/tests/unit/services/issue.service.test.ts

// TODO: Add validation for latitude/longitude ranges
// TODO: Add validation for allowed categories (enum)
// TODO: Add image upload integration test

import { IssueService } from '../../issue.service';
import { IssueRepository } from '../../../repositories/issue.repository';
import { describe, beforeEach, vi, it, expect, Mocked } from 'vitest';
import { CreateIssueDTO } from '@civickit/shared';

// Mock the repository, not integration test
vi.mock('../../../src/repositories/issue.repository');

describe('IssueService', () => {
  let issueService: IssueService;
  let mockIssueRepository: Mocked<IssueRepository>;

  beforeEach(() => {
    // Create mock repository
    mockIssueRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findNearby: vi.fn(),
    } as unknown as Mocked<IssueRepository>;
    //mockIssueRepository = new IssueRepository() as Mocked<IssueRepository>;
    issueService = new IssueService(mockIssueRepository);
  });

  const makeInput = (
    overrides: Partial<CreateIssueDTO> = {}
  ): CreateIssueDTO => ({
    title: 'Test Issue',
    description: 'Test Description',
    category: 'POTHOLE',
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
});