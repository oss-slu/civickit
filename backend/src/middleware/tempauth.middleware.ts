// backend/src/middleware/tempauth.middleware.ts

// temporary file to authorize user until auth middleware is merged

import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
//   req.user = {
    (req as Request & { user?: { id: string } }).user = {
        id: 'temp-user-id',
        // email: 'dev@example.com',
    };
    
    next();
};