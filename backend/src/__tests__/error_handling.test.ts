// backend/src/__tests__/error_handling.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';

import { errorHandler } from '../middleware/error.middleware';
import { requestLogger } from '../middleware/logger.middleware';
import {
    AppError,
    NotFoundError,
    ValidationError,
    UnauthorizedError,
} from '../utils/errors';

//  Mock helpers
const mockRequest = (overrides = {}): Partial<Request> => ({
    method: 'GET',
    originalUrl: '/test',
    ...overrides,
});

const mockResponse = () => {
    const res: Partial<Response> = {};

    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    res.on = vi.fn();

    return res;
};

const mockNext: NextFunction = vi.fn();

describe('Error Handling System (Vitest only)', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
    let consoleLogSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
    });


    // Error Class Tests 
    it('should create NotFoundError correctly', () => {
        const err = new NotFoundError('Not found');

        expect(err).toBeInstanceOf(AppError);
        expect(err.statusCode).toBe(404);
        expect(err.message).toBe('Not found');
    });

    it('should create ValidationError correctly', () => {
        const err = new ValidationError('Bad input');

        expect(err.statusCode).toBe(400);
        expect(err.message).toBe('Bad input');
    });

    it('should create UnauthorizedError correctly', () => {
        const err = new UnauthorizedError();

        expect(err.statusCode).toBe(401);
        expect(err.message).toBe('Unauthorized');
    });


    // Error Middleware Tests
    it('should handle AppError and return correct response', () => {
        const err = new ValidationError('Invalid input');
        const req = mockRequest();
        const res = mockResponse();

        errorHandler(err, req as Request, res as Response, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Invalid input',
        });

        expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle unknown errors as 500', () => {
        const err = new Error('Unexpected failure');
        const req = mockRequest();
        const res = mockResponse();

        errorHandler(err, req as Request, res as Response, mockNext);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Internal Server Error',
        });
    });

    it('should NOT expose stack trace to client', () => {
        const err = new Error('Sensitive error');
        const req = mockRequest();
        const res = mockResponse();

        errorHandler(err, req as Request, res as Response, mockNext);

        const jsonCall = (res.json as any).mock.calls[0][0];

        expect(jsonCall).not.toHaveProperty('stack');
        expect(jsonCall.message).toBe('Internal Server Error');
    });

    it('should log error details including stack trace', () => {
        const err = new Error('Boom');
        const req = mockRequest({ method: 'POST', originalUrl: '/boom' });
        const res = mockResponse();

        errorHandler(err, req as Request, res as Response, mockNext);

        const logs = consoleErrorSpy.mock.calls.flat().join(' ');

        expect(logs).toContain('ERROR START');
        expect(logs).toContain('ERROR END');
        expect(logs).toContain('Boom');
        expect(logs).toContain('/boom');
        expect(logs).toContain('POST');
    });


    // Logger Middleware Tests
    it('should call next()', () => {
        const req = mockRequest();
        const res = mockResponse();

        requestLogger(req as Request, res as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
    });

    it('should log request after response finishes', () => {
        const req = mockRequest({
            method: 'GET',
            originalUrl: '/test-log',
        });

        let finishCallback: Function | undefined;

        const res = {
            statusCode: 200,
            on: vi.fn((event: string, cb: Function) => {
                if (event === 'finish') {
                    finishCallback = cb;
                }
            }),
        } as unknown as Response;

        requestLogger(req as Request, res, mockNext);

        // Simulate response finishing
        finishCallback && finishCallback();

        expect(consoleLogSpy).toHaveBeenCalled();

        const log = consoleLogSpy.mock.calls[0][0];

        expect(log).toContain('GET');
        expect(log).toContain('/test-log');
        expect(log).toContain('200');
    });

    it('should include timestamp and duration in logs', () => {
        const req = mockRequest();
        let finishCallback: Function | undefined;

        const res = {
            statusCode: 201,
            on: vi.fn((event: string, cb: Function) => {
                if (event === 'finish') finishCallback = cb;
            }),
        } as unknown as Response;

        requestLogger(req as Request, res, mockNext);

        finishCallback && finishCallback();

        const log = consoleLogSpy.mock.calls[0][0];

        expect(log).toMatch(/\d{4}-\d{2}-\d{2}T/); // ISO timestamp
        expect(log).toContain('201');
        expect(log).toContain('ms');
    });
});