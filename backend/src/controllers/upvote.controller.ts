// backend/src/controllers/upvote.controller.ts
import { Request, Response, NextFunction } from 'express';
import { UpvoteService } from '../services/upvote.service';
import { UpvoteRepository } from '../repositories/upvote.repository';


const upvoteService = new UpvoteService(new UpvoteRepository());

export class UpvoteController {
  async upvote(req: Request, res: Response, next: NextFunction) {
    try {
      const { issueId } = req.params;
      const userId = String(req.userId);
      const result = await upvoteService.upvoteIssue(String(issueId), userId);

      res.status(201).json(result);

    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      }
      next(error);
    }
  }

  async removeUpvote(req: Request, res: Response, next: NextFunction) {
    try {
      const { issueId } = req.params;
      const userId = String(req.userId);
      const result = await upvoteService.removeUpvote(String(issueId), userId);

      res.status(200).json(result);

    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      }
      next(error);
    }
  }

  async getUpvotes(req: Request, res: Response, next: NextFunction) {
    try {
      const { issueId } = req.params;
      const result = await upvoteService.getUpvoteCount(String(issueId));

      res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }
}