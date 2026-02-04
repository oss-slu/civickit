// backend/src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { LoginController } from '../controllers/login.controller';

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
    const token = String(req.headers.authorization?.substring(7))
    const secret = String(process.env.JWT_SECRET)
    const tokenResponse  = jwt.verify(token, secret)
    const userId = tokenResponse.userId
    req.userId = userId
    next()
  } catch (error) {
    throw error
  }
  
  
};