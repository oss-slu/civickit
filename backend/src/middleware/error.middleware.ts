// backend/src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Default values
    let statusCode = 500;
    let message = 'Internal Server Error';

    // Handle known operational errors
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err && typeof err === 'object' && typeof (err.status ?? err.statusCode) === 'number') {
        statusCode = err.status ?? err.statusCode;
        if (typeof err.message === 'string') message = err.message;
    }

    // Log full error details
    console.error('--- ERROR START ---');
    console.error(`Time: ${new Date().toISOString()}`);
    console.error(`Method: ${req.method}`);
    console.error(`Path: ${req.originalUrl}`);
    console.error(err?.message ?? String(err));
    console.error('--- ERROR END ---');

    // Send safe response to client
    res.status(statusCode).json({
        success: false,
        message,
    });
};