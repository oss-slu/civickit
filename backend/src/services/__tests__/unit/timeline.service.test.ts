// backend/src/services/__tests__/unit/timeline.service.test.ts

import { TimelineService } from '../../timeline.service';
import { TimelineRepository } from '../../../repositories/timeline.repository';
import { describe, beforeEach, vi, it, expect, Mocked, Mock } from 'vitest';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CreateIssueDTO, PostUpdateDTO } from '@civickit/shared/src/types/api';
import { IssueService } from '../../issue.service';
import { IssueRepository } from '../../../repositories/issue.repository';
import { UpvoteRepository } from '../../../repositories/upvote.repository';

// mock repository
vi.mock('../../../src/repositories/timeline.repository');

// mock bcrypt
vi.mock('bcryptjs', () => ({
    default: {
        compare: vi.fn(),
    },
}));

// mock jwt
vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn(),
    },
}));

describe('TimelineService', () => {
    let timelineService: TimelineService;
    let mockTimelineRepository: Mocked<TimelineRepository>;

    let issueService: IssueService;
    let mockIssueRepository: Mocked<IssueRepository>;

    let mockUpvoteRepository: Mocked<UpvoteRepository>;

    beforeEach(() => {
        // Manual mock setup
        mockTimelineRepository = {
            createUpdate: vi.fn(),
            findByIssue: vi.fn(),
            findByUser: vi.fn(),
        } as unknown as Mocked<TimelineRepository>;

        mockIssueRepository = {
            create: vi.fn(),
            findById: vi.fn(),
            findNearby: vi.fn(),
        } as unknown as Mocked<IssueRepository>;

        mockUpvoteRepository = {
            createUpvote: vi.fn(),
            deleteUpvote: vi.fn(),
            countUpvotes: vi.fn(),
            exists: vi.fn(),
        } as unknown as Mocked<UpvoteRepository>;

        timelineService = new TimelineService(mockTimelineRepository);
        issueService = new IssueService(mockIssueRepository, mockUpvoteRepository);
        vi.clearAllMocks();
    });

    const makeUpdateInput = (
        overrides: Partial<PostUpdateDTO> = {}
    ): PostUpdateDTO => ({
        message: 'test message 1',
        status: 'ACKNOWLEDGED',
        images: [],
        ...overrides,
    });

    const makeIssueInput = (
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

    describe('updateIssue', () => {
        it('should add update successfully', async () => {
            const mockUpdate = {
                issueId: 'issue1',
                id: 'update1',
                createdAt: new Date(),
                userId: 'user1',
                message: 'test message 1',
                status: 'ACKNOWLEDGED',
                images: []
            };
            mockTimelineRepository.createUpdate.mockResolvedValueOnce(mockUpdate as any);

            const result = await timelineService.postUpdate(
                makeUpdateInput(),
                'issue1',
                'user1'
            );

            expect(result).toEqual(mockUpdate);

        });


        it('should rethrow other errors', async () => {
            const error = new Error('Random error');
            mockTimelineRepository.createUpdate.mockRejectedValueOnce(error);

            await expect(timelineService.postUpdate(makeUpdateInput(), 'issue1', 'user1')).rejects.toThrow('Random error');
        });
    });

    describe('get', () => {
        it('should return updates attached to issue1', async () => {
            const mockIssue = { id: 'issue1' };
            const mockUpdate = {
                issueId: 'issue1',
                id: 'update1',
                createdAt: new Date(),
                userId: 'user1',
                message: 'test message 1',
                status: 'ACKNOWLEDGED',
                images: []
            };
            mockTimelineRepository.findByIssue.mockResolvedValue(mockUpdate as any);
            const result = await timelineService.getIssueUpdates(mockIssue.id)

            expect(result.updates).toEqual(mockUpdate);
        });

        it('should return updates attached to user1', async () => {
            const mockUser = { id: 'user1' };
            const mockUpdate = {
                issueId: 'issue1',
                id: 'update1',
                createdAt: new Date(),
                userId: 'user1',
                message: 'test message 1',
                status: 'ACKNOWLEDGED',
                images: []
            };
            mockTimelineRepository.findByUser.mockResolvedValue(mockUpdate as any);
            const result = await timelineService.getUserUpdates(mockUser.id)

            expect(result.updates).toEqual(mockUpdate);
        });

    });
});