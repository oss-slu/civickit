// backend/src/services/__tests__/unit/timeline.service.test.ts

import { TimelineService } from '../../timeline.service';
import { TimelineRepository } from '../../../repositories/timeline.repository';
import { describe, beforeEach, vi, it, expect, Mocked, Mock } from 'vitest';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { exists } from 'fs';
import { PostUpdateDTO } from '@civickit/shared/src/types/api';

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

    beforeEach(() => {
        // Manual mock setup
        mockTimelineRepository = {
            postUpdate: vi.fn(),
            getIssueUpdates: vi.fn(),
            getUserUpdates: vi.fn(),
        } as unknown as Mocked<TimelineRepository>;

        timelineService = new TimelineService(mockTimelineRepository);
        vi.clearAllMocks();
    });

    const makeInput1 = (
        overrides: Partial<PostUpdateDTO> = {}
    ): PostUpdateDTO => ({
        message: 'test message 1',
        status: 'ACKNOWLEDGED',
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
                makeInput1(),
                'issue1',
                'user1'
            );

            expect(result).toEqual(mockUpdate);

        });


        it('should rethrow other errors', async () => {
            const error = new Error('Random error');
            mockTimelineRepository.createUpdate.mockRejectedValueOnce(error);

            await expect(timelineService.postUpdate(makeInput1(), 'issue1', 'user1')).rejects.toThrow('Random error');
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

            const result = mockTimelineRepository.findByIssue.mockResolvedValue(mockIssue as any);
            expect(result).toEqual(mockUpdate);
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

            const result = mockTimelineRepository.findByUser.mockResolvedValue(mockUser as any);
            expect(result).toEqual(mockUpdate);
        });
    });
});