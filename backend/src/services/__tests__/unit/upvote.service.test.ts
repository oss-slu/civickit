// backend/src/services/__tests__/unit/upvote.service.test.ts

import { UpvoteService } from '../../upvote.service';
import { UpvoteRepository } from '../../../repositories/upvote.repository';
import { describe, beforeEach, vi, it, expect, Mocked, Mock } from 'vitest';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { exists } from 'fs';

// mock repository
vi.mock('../../../src/repositories/upvote.repository');

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

describe('UpvoteService', () => {
    let upvoteService: UpvoteService;
    let mockUpvoteRepository: Mocked<UpvoteRepository>;

    beforeEach(() => {
        // Manual mock setup
        mockUpvoteRepository = {
            createUpvote: vi.fn(),
            deleteUpvote: vi.fn(),
            countUpvotes: vi.fn(),
            exists: vi.fn(),
        } as unknown as Mocked<UpvoteRepository>;

        upvoteService = new UpvoteService(mockUpvoteRepository);
        vi.clearAllMocks();
    });

    describe('upvoteIssue', () => {
        it('should upvote successfully and return updated count', async () => {
            mockUpvoteRepository.createUpvote.mockResolvedValueOnce({
                issueId: 'issue1',
                id: 'upvote1',
                createdAt: new Date(),
                userId: 'user1',
            });

            mockUpvoteRepository.countUpvotes.mockResolvedValueOnce(5);

            const result = await upvoteService.upvoteIssue('issue1', 'user1');

            expect(mockUpvoteRepository.createUpvote).toHaveBeenCalledWith('issue1', 'user1');
            expect(result).toEqual({ upvoteCount: 5, upvoted: true });
        });

        it('should throw 409 if issue already upvoted', async () => {
            const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
                code: 'P2002',
                clientVersion: '7.4.1',
            });

            mockUpvoteRepository.createUpvote.mockRejectedValueOnce(error);

            await expect(upvoteService.upvoteIssue('issue1', 'user1')).rejects.toEqual({
                status: 409,
                message: 'Issue already upvoted',
            });
        });

        it('should rethrow other errors', async () => {
            const error = new Error('Random error');
            mockUpvoteRepository.createUpvote.mockRejectedValueOnce(error);

            await expect(upvoteService.upvoteIssue('issue1', 'user1')).rejects.toThrow('Random error');
        });
    });

    describe('removeUpvote', () => {
        it('should remove upvote successfully and return updated count', async () => {
            mockUpvoteRepository.deleteUpvote.mockResolvedValueOnce({
                issueId: 'issue1',
                id: 'upvote1',
                createdAt: new Date(),
                userId: 'user1',
            });
            mockUpvoteRepository.countUpvotes.mockResolvedValueOnce(3);

            const result = await upvoteService.removeUpvote('issue1', 'user1');

            expect(mockUpvoteRepository.deleteUpvote).toHaveBeenCalledWith('issue1', 'user1');
            expect(mockUpvoteRepository.countUpvotes).toHaveBeenCalledWith('issue1');
            expect(result).toEqual({ upvoteCount: 3, upvoted: false });
        });

        it('should throw 404 if upvote does not exist', async () => {
            const error = new Prisma.PrismaClientKnownRequestError('Record not found', {
                code: 'P2025',
                clientVersion: '7.4.1',
            });

            mockUpvoteRepository.deleteUpvote.mockRejectedValueOnce(error);

            await expect(upvoteService.removeUpvote('issue1', 'user1')).rejects.toEqual({
                status: 404,
                message: 'Upvote does not exist',
            });
        });

        it('should rethrow other errors', async () => {
            const error = new Error('Random error');
            mockUpvoteRepository.deleteUpvote.mockRejectedValueOnce(error);

            await expect(upvoteService.removeUpvote('issue1', 'user1')).rejects.toThrow('Random error');
        });
    });

    describe('getUpvoteCount', () => {
        it('should return the upvote count', async () => {
            mockUpvoteRepository.countUpvotes.mockResolvedValueOnce(7);
            mockUpvoteRepository.exists.mockResolvedValueOnce(false);

            const result = await upvoteService.getUpvoteCount('issue1', 'user1');

            expect(mockUpvoteRepository.countUpvotes).toHaveBeenCalledWith('issue1');
            expect(result).toEqual({ upvoteCount: 7, upvoted: false });
        });
    });
});