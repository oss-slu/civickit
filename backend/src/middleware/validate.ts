import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';
import { AppError } from '../utils/errors';

export const validateBody = (schema: ZodType) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new AppError('Invalid request body', 400));
    }
    req.body = result.data; // normalized + unknown keys stripped
    next();
  };
