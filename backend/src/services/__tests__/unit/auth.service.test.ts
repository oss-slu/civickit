// backend/src/services/__tests__/unit/auth.service.test.ts

import { AuthService } from '../../auth.service';
import { AuthRepository } from '../../../repositories/auth.repository';
import { describe, beforeEach, vi, it, expect, Mocked } from 'vitest';
import bcrypt from 'bcryptjs';
import { AppError } from '../../../utils/errors';

// mock repository
vi.mock('../../../src/repositories/auth.repository');

// mock bcrypt
vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn(),
    },
}));

// test auth service
describe('AuthService', () => {
    let authService: AuthService;
    let mockAuthRepository: Mocked<AuthRepository>;

    beforeEach(() => {
        mockAuthRepository = {
            findByEmail: vi.fn(),
            createUser: vi.fn(),
            findById: vi.fn(),
        } as unknown as Mocked<AuthRepository>;

        authService = new AuthService(mockAuthRepository);
    });

    it('should register a user successfully', async () => {
        mockAuthRepository.findByEmail.mockResolvedValue(null);

        (bcrypt.hash as any).mockResolvedValue('hashedPassword');

        mockAuthRepository.createUser.mockResolvedValue({
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            passwordHash: 'hashedPassword',
            profileImage: null,
            role: 'REPORTER',
            createdAt: new Date(),
            updatedAt: new Date(),
            emailVerified: false,
            image: null,
        });

        const result = await authService.registerUser({
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
        });

        expect(result).toMatchObject({
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
        });

        expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
        expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
        expect(mockAuthRepository.createUser).toHaveBeenCalled();
    });

    it('should throw error for invalid email', async () => {
        await expect(
            authService.registerUser({
                email: 'bad-email',
                password: 'password123',
                name: 'Test',
            })
        ).rejects.toEqual(
            new AppError("Invalid email format", 400));
    });

    it('should throw error for short password', async () => {
        await expect(
            authService.registerUser({
                email: 'test@example.com',
                password: 'short',
                name: 'Test',
            })
        ).rejects.toEqual(
            new AppError('Password too short (min 8 characters)', 400));
    });

    it.each([
        ['an empty name', ''],
        ['a whitespace-only name', '   '],
        ['a single-character name', 'A'],
    ])('should throw a 400 for %s', async (_label, name) => {
        await expect(
            authService.registerUser({
                email: 'test@example.com',
                password: 'password123',
                name,
            })
        ).rejects.toEqual(new AppError('Name is required (min 2 characters)', 400));
    });

    it('should throw a 400 for a name longer than 100 characters', async () => {
        await expect(
            authService.registerUser({
                email: 'test@example.com',
                password: 'password123',
                name: 'a'.repeat(101),
            })
        ).rejects.toEqual(new AppError('Name too long (max 100 characters)', 400));
    });

    it('should trim the name before persisting it', async () => {
        mockAuthRepository.findByEmail.mockResolvedValue(null);
        (bcrypt.hash as any).mockResolvedValue('hashedPassword');
        mockAuthRepository.createUser.mockResolvedValue({
            id: '1',
            email: 'test@example.com',
            name: 'Jane Doe',
            passwordHash: 'hashedPassword',
            profileImage: null,
            role: 'REPORTER',
            createdAt: new Date(),
            updatedAt: new Date(),
            emailVerified: false,
            image: null,
        });

        await authService.registerUser({
            email: 'test@example.com',
            password: 'password123',
            name: '  Jane Doe  ',
        });

        expect(mockAuthRepository.createUser).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'Jane Doe' })
        );
    });

    it('should throw error if email already exists', async () => {
        mockAuthRepository.findByEmail.mockResolvedValue({
            id: '1',
            email: 'test@example.com',
            name: 'Existing User',
            passwordHash: 'hashed',
            profileImage: null,
            role: 'REPORTER',
            createdAt: new Date(),
            updatedAt: new Date(),
            emailVerified: false,
            image: null,
        });

        await expect(
            authService.registerUser({
                email: 'test@example.com',
                password: 'password123',
                name: 'Test',
            })
        ).rejects.toEqual(
            new AppError("Email already exists", 409));
    });

    describe('getUserById', () => {
        it('returns a user without a passwordHash field', async () => {
            mockAuthRepository.findById.mockResolvedValue({
                id: '1',
                email: 'test@example.com',
                name: 'Test User',
                profileImage: null,
                role: 'REPORTER',
                createdAt: new Date(),
            } as any);

            const result = await authService.getUserById('1');

            expect(result).not.toHaveProperty('passwordHash');
            expect(mockAuthRepository.findById).toHaveBeenCalledWith('1');
        });

        it('throws AppError 404 when the repository returns null', async () => {
            mockAuthRepository.findById.mockResolvedValue(null);

            await expect(
                authService.getUserById('missing-id')
            ).rejects.toEqual(new AppError('User not found', 404));
        });
    });
});