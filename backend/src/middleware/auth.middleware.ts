// backend/src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
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
    //get token from Authorization: Bearer header
    const token = String(req.headers.authorization?.substring(7))
    
    //Verify Token
    const secret = String(process.env.JWT_SECRET)
    const tokenResponse  = jwt.verify(token, secret) as JwtPayload
    
    //attach userId to request
    req.userId = tokenResponse.userId

    //call next function
    next()

  } catch (error) {
    throw error
  }
  
  
};