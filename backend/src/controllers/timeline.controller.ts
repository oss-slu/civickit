// backend/src/controllers/timeline.controller.ts
import { Request, Response, NextFunction } from 'express';
import { TimelineService } from '../services/timeline.service';
import { TimelineRepository } from '../repositories/timeline.repository';


const timelineService = new TimelineService(new TimelineRepository());

export class TimelineController {

  async postUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const { issueId } = req.params;
      const userId = String(req.userId);
      console.log("in controller", req.body)
      const result = await timelineService.postUpdate(req.body, String(issueId), userId);

      res.status(201).json(result);

    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      }
      next(error);
    }
  }

  async getIssueUpdates(req: Request, res: Response, next: NextFunction) {
    try {
      const { issueId } = req.params;
      const result = await timelineService.getIssueUpdates(String(issueId));

      res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  async getUserUpdates(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const result = await timelineService.getUserUpdates(String(userId));

      res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }


}