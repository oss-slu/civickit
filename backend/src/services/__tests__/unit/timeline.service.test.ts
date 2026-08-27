// backend/src/services/__tests__/unit/timeline.service.test.ts

import { TimelineService } from '../../timeline.service';
import { TimelineRepository } from '../../../repositories/timeline.repository';
import { describe, beforeEach, vi, it, expect, Mocked, Mock } from 'vitest';
import { CreateIssueDTO, PostUpdateDTO } from '@civickit/shared/src/types/api';
import { IssueService } from '../../issue.service';
import { IssueRepository } from '../../../repositories/issue.repository';
import { AuthRepository } from '../../../repositories/auth.repository';
import { PhotoRepository } from '../../../repositories/photo.repository';
import { OrgRepository } from '../../../repositories/org.repository';
import { MembershipRepository } from '../../../repositories/membership.repository';

// mock repository
vi.mock('../../../src/repositories/timeline.repository');

describe('TimelineService', () => {
    let timelineService: TimelineService;
    let mockTimelineRepository: Mocked<TimelineRepository>;

    let issueService: IssueService;
    let mockIssueRepository: Mocked<IssueRepository>;
    let mockAuthRepository: Mocked<AuthRepository>;
    let mockPhotoRepository: Mocked<PhotoRepository>
    let mockOrgRepository: Mocked<OrgRepository>
    let mockMembershipRepository: Mocked<MembershipRepository>


    beforeEach(() => {
        // Manual mock setup
        mockTimelineRepository = {
            createWithPhotos: vi.fn(),
            findByIssue: vi.fn(),
            findByUser: vi.fn(),
        } as unknown as Mocked<TimelineRepository>;

        mockIssueRepository = {
            createWithPhotos: vi.fn(),
            findById: vi.fn(),
            findNearby: vi.fn(),
        } as unknown as Mocked<IssueRepository>;

        mockAuthRepository = {
            create: vi.fn(),
            findById: vi.fn(),
            findNearby: vi.fn(),
        } as unknown as Mocked<AuthRepository>;

        mockPhotoRepository = {
            createMany: vi.fn(),
            findById: vi.fn(),
            findOriginalsByIssueIds: vi.fn(),
            findByTimelineEntryIds: vi.fn(),
            softDelete: vi.fn(),
        } as unknown as Mocked<PhotoRepository>;

        mockOrgRepository = {
            findOrgsForIssue: vi.fn(),
            findIssuesForOrg: vi.fn(),
        } as unknown as Mocked<OrgRepository>;

        mockMembershipRepository = {
            create: vi.fn(),
            findById: vi.fn(),
            findByUser: vi.fn(),
            findByUserAndOrg: vi.fn(),
            findByOrganization: vi.fn(),
        } as unknown as Mocked<MembershipRepository>;

        timelineService = new TimelineService(mockTimelineRepository, mockPhotoRepository, mockAuthRepository);
        issueService = new IssueService(mockIssueRepository, mockPhotoRepository, mockOrgRepository, mockAuthRepository, mockMembershipRepository);
        vi.clearAllMocks();

        // After clearAllMocks, or the defaults it wipes leave `.get` on undefined.
        mockPhotoRepository.findOriginalsByIssueIds.mockResolvedValue(new Map());
        mockPhotoRepository.findByTimelineEntryIds.mockResolvedValue(new Map());
    });

    const makeUpdateInput = (
        overrides: Partial<PostUpdateDTO> = {}
    ): PostUpdateDTO => ({
        message: 'test message 1',
        status: 'ACKNOWLEDGED',
        photos: [],
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
        photos: [],
        ...overrides,
    });

    describe('updateIssue', () => {
        it('should add update successfully', async () => {
            // One instant shared by the mock and the expectation. Two separate
            // new Date() calls differ whenever the millisecond ticks between
            // them, which is rare locally and regular on CI.
            const now = new Date();
            const mockUpdate = {
                issueId: 'issue1',
                id: 'update1',
                createdAt: now,
                userId: 'user1',
                message: 'test message 1',
                status: 'ACKNOWLEDGED',
                entryType: 'COMMENT',
            };
            const mockReturn = {
                issueId: 'issue1',
                id: 'update1',
                createdAt: now,
                userId: 'user1',
                message: 'test message 1',
                status: 'ACKNOWLEDGED',
                entryType: 'COMMENT',
                photos: [],
            };

            mockTimelineRepository.createWithPhotos.mockResolvedValueOnce({
                entry: mockUpdate,
                photos: [],
            } as any);

            const result = await timelineService.postUpdate(
                makeUpdateInput(),
                'issue1',
                'user1'
            );

            expect(result).toEqual(mockReturn);

        });


        it('should rethrow other errors', async () => {
            const error = new Error('Random error');
            mockTimelineRepository.createWithPhotos.mockRejectedValueOnce(error);

            await expect(timelineService.postUpdate(makeUpdateInput(), 'issue1', 'user1')).rejects.toThrow('Random error');
        });
    });

    describe('get', () => {
        it('should return updates attached to issue1', async () => {
            const mockIssue = { id: 'issue1' };
            const now = new Date();
            const mockUpdate = [{
                issueId: 'issue1',
                id: 'update1',
                createdAt: now,
                userId: 'user1',
                message: 'test message 1',
                status: 'ACKNOWLEDGED',
                entryType: 'COMMENT',
                userName: 'Ada',
            }];
            const mockReturn = [{
                issueId: 'issue1',
                id: 'update1',
                createdAt: now,
                userId: 'user1',
                message: 'test message 1',
                status: 'ACKNOWLEDGED',
                entryType: 'COMMENT',
                userName: 'Ada',
                photos: [],
            }];
            mockTimelineRepository.findByIssue.mockResolvedValue(mockUpdate as any);
            const result = await timelineService.getIssueUpdates(mockIssue.id)

            expect(result.updates).toEqual(mockReturn);
        });

        it('should return updates attached to user1', async () => {
            const mockUser = { id: 'user1' };
            const now = new Date();
            const mockUpdate = [{
                issueId: 'issue1',
                id: 'update1',
                createdAt: now,
                userId: 'user1',
                message: 'test message 1',
                status: 'ACKNOWLEDGED',
                entryType: 'COMMENT',
                userName: 'Ada',
            }];


            const mockReturn = [{
                issueId: 'issue1',
                id: 'update1',
                createdAt: now,
                userId: 'user1',
                message: 'test message 1',
                status: 'ACKNOWLEDGED',
                entryType: 'COMMENT',
                userName: 'Ada',
                photos: [],
            }];
            mockTimelineRepository.findByUser.mockResolvedValue(mockUpdate as any);
            const result = await timelineService.getUserUpdates(mockUser.id)
            expect(result.updates).toEqual(mockReturn);
        });

    });
});