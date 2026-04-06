// backend/src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export const errorHandler = (
    err: Error,
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
    }

    // Log full error details
    console.error('--- ERROR START ---');
    console.error(`Time: ${new Date().toISOString()}`);
    console.error(`Method: ${req.method}`);
    console.error(`Path: ${req.originalUrl}`);
    console.error(err.stack);
    console.error('--- ERROR END ---');

    // Send safe response to client
    res.status(statusCode).json({
        success: false,
        message,
    });
};