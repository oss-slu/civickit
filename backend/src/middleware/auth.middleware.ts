// backend/src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {

  try {
    // get and check auth header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid auth format' });
    }

    //get token from Authorization: Bearer header
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token missing' });
    }

    //Verify Token
    const tokenResponse = jwt.verify(token, JWT_SECRET) as JwtPayload

    //attach userId to request
    req.userId = tokenResponse.userId

    //call next function
    next()

  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

};