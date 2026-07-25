// backend/src/services/__tests__/unit/upvote.service.test.ts

import { UpvoteService } from '../../upvote.service';
import { UpvoteRepository } from '../../../repositories/upvote.repository';
import { describe, beforeEach, vi, it, expect, Mocked, Mock } from 'vitest';
import { RecordNotFoundError } from '../../../db/errors';

// mock repository
vi.mock('../../../src/repositories/upvote.repository');

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
            // Shaped like what actually reaches the service: Drizzle wraps the
            // failed query, and the driver error carrying the SQLSTATE is the
            // cause. A bare { code: '23505' } passes this test while the real
            // endpoint answers 500, so the nesting is the point.
            const error = Object.assign(new Error('Failed query'), {
                cause: Object.assign(
                    new Error('duplicate key value violates unique constraint'),
                    { code: '23505', constraint: 'Upvote_issueId_userId_key' },
                ),
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
            // Postgres reports nothing when a delete matches no row, so the
            // repository raises this where Prisma raised P2025.
            const error = new RecordNotFoundError('Upvote does not exist');

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