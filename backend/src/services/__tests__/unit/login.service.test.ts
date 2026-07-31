// backend/src/services/__tests__/unit/login.service.test.ts

import { LoginService } from '../../login.service';
import { LoginRepository } from '../../../repositories/login.repository';
import { describe, beforeEach, vi, it, expect, Mocked, Mock } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../../../utils/errors';

// mock repository
vi.mock('../../../src/repositories/login.repository');

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

// test login service
describe('LoginService', () => {
    let loginService: LoginService;
    let mockLoginRepository: Mocked<LoginRepository>;

    beforeEach(() => {
        mockLoginRepository = {
            findByEmail: vi.fn()
        } as unknown as Mocked<LoginRepository>;

        loginService = new LoginService(mockLoginRepository);
    });

    const date = new Date();
    const mockUser = () => ({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashedPassword',
        profileImage: '',
        createdAt: date,
        updatedAt: date
    });

    it('should login successfully and return token + user', async () => {
        const user = mockUser();

        mockLoginRepository.findByEmail.mockResolvedValue(user);
        (bcrypt.compare as any).mockResolvedValue(true);
        (jwt.sign as any).mockReturnValue('mocked-token');

        const result = await loginService.login({
            email: 'test@example.com',
            password: 'password123',
        });

        expect(mockLoginRepository.findByEmail).toHaveBeenCalledWith('test@example.com');

        expect(bcrypt.compare).toHaveBeenCalledWith(
            'password123',
            user.passwordHash
        );

        expect(jwt.sign).toHaveBeenCalledWith(
            { userId: user.id },
            'test-only-fake-secret-value-1234',
            { expiresIn: '7d' }
        );

        expect(result).toEqual({
            token: 'mocked-token',
            user: {
                id: '1',
                name: 'Test User',
                email: 'test@example.com',
                createdAt: date.toString(),
                profileImage: ''
            },
        });
    });

    it('should throw error if email not found', async () => {
        (mockLoginRepository.findByEmail as any).mockResolvedValue(null);

        await expect(
            loginService.login({
                email: 'notfound@example.com',
                password: 'password123',
            })
        ).rejects.toEqual(new AppError(
            'Email not found',
            401
        ))
    });

    it('should throw error if password does not match', async () => {
        const user = mockUser();

        mockLoginRepository.findByEmail.mockResolvedValue(user);
        (bcrypt.compare as any).mockResolvedValue(false);

        await expect(
            loginService.login({
                email: 'test@example.com',
                password: 'wrongpassword',
            })
        ).rejects.toEqual(
            new AppError("Password and email do not match", 401));
    });
});