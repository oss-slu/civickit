// backend/src/services/__tests__/unit/timeline.service.test.ts

import { TimelineService } from '../../timeline.service';
import { TimelineRepository } from '../../../repositories/timeline.repository';
import { describe, beforeEach, vi, it, expect, Mocked, Mock } from 'vitest';
import { CreateIssueDTO, PostUpdateDTO } from '@civickit/shared/src/types/api';
import { IssueService } from '../../issue.service';
import { IssueRepository } from '../../../repositories/issue.repository';
import { AuthRepository } from '../../../repositories/auth.repository';
import { ImageRepository } from '../../../repositories/image.repository';

// mock repository
vi.mock('../../../src/repositories/timeline.repository');

describe('TimelineService', () => {
    let timelineService: TimelineService;
    let mockTimelineRepository: Mocked<TimelineRepository>;

    let issueService: IssueService;
    let mockIssueRepository: Mocked<IssueRepository>;
    let mockAuthRepository: Mocked<AuthRepository>;
    let mockImageRepository: Mocked<ImageRepository>


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

        mockAuthRepository = {
            create: vi.fn(),
            findById: vi.fn(),
            findNearby: vi.fn(),
        } as unknown as Mocked<AuthRepository>;

        mockImageRepository = {
            create: vi.fn(),
            findById: vi.fn(),
            findNearby: vi.fn(),
        } as unknown as Mocked<ImageRepository>;

        timelineService = new TimelineService(mockTimelineRepository, mockImageRepository, mockAuthRepository);
        issueService = new IssueService(mockIssueRepository, mockImageRepository);
        vi.clearAllMocks();
    });

    const makeUpdateInput = (
        overrides: Partial<PostUpdateDTO> = {}
    ): PostUpdateDTO => ({
        message: 'test message 1',
        status: 'ACKNOWLEDGED',
        imageIds: [],
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
        imageIds: [],
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
                imageIds: []
            };
            const mockReturn = {
                issueId: 'issue1',
                id: 'update1',
                createdAt: new Date(),
                userId: 'user1',
                message: 'test message 1',
                status: 'ACKNOWLEDGED',
                images: [],
                userName: undefined
            };

            mockTimelineRepository.createUpdate.mockResolvedValueOnce(mockUpdate as any);

            const result = await timelineService.postUpdate(
                makeUpdateInput(),
                'issue1',
                'user1'
            );

            expect(result).toEqual(mockReturn);

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
            const mockUpdate = [{
                issueId: 'issue1',
                id: 'update1',
                createdAt: new Date(),
                userId: 'user1',
                message: 'test message 1',
                status: 'ACKNOWLEDGED',
                imageIds: []
            }];
            const mockReturn = [{
                issueId: 'issue1',
                id: 'update1',
                createdAt: new Date(),
                userId: 'user1',
                message: 'test message 1',
                status: 'ACKNOWLEDGED',
                images: [],
                userName: undefined
            }];
            mockTimelineRepository.findByIssue.mockResolvedValue(mockUpdate as any);
            const result = await timelineService.getIssueUpdates(mockIssue.id)

            expect(result.updates).toEqual(mockReturn);
        });

        it('should return updates attached to user1', async () => {
            const mockUser = { id: 'user1' };
            const mockUpdate = [{
                issueId: 'issue1',
                id: 'update1',
                createdAt: new Date(),
                userId: 'user1',
                message: 'test message 1',
                status: 'ACKNOWLEDGED',
                imageIds: [],
                userName: undefined
            }];


            const mockReturn = [{
                issueId: 'issue1',
                id: 'update1',
                createdAt: new Date(),
                userId: 'user1',
                message: 'test message 1',
                status: 'ACKNOWLEDGED',
                images: [],
                userName: undefined
            }];
            mockTimelineRepository.findByUser.mockResolvedValue(mockUpdate as any);
            const result = await timelineService.getUserUpdates(mockUser.id)
            expect(result.updates).toEqual(mockReturn);
        });

    });
});