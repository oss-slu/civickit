// backend/src/controllers/timeline.controller.ts
import { Request, Response, NextFunction } from 'express';
import { TimelineService } from '../services/timeline.service';
import { TimelineRepository } from '../repositories/timeline.repository';
import { IssueController } from './issue.controller';
import { IssueService } from '../services/issue.service';
import { IssueRepository } from '../repositories/issue.repository';
import { PhotoRepository } from '../repositories/photo.repository';
import { AuthRepository } from '../repositories/auth.repository';
import { OrgRepository } from '../repositories/org.repository';
import { MembershipRepository } from '../repositories/membership.repository';

const photoRepository = new PhotoRepository()
const issueRepository = new IssueRepository()
const timelineRepository = new TimelineRepository()
const orgRepository = new OrgRepository()
const authRepository = new AuthRepository()
const membershipRepository = new MembershipRepository()


const issueService = new IssueService(
  issueRepository, photoRepository, orgRepository, authRepository, membershipRepository,
);
const timelineService = new TimelineService(timelineRepository, photoRepository, authRepository);


export class TimelineController {

  async postUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const { issueId } = req.params;
      const userId = String(req.userId);

      //update status of issue
      await issueService.updateStatus(String(req.params.issueId), req.body.status);
      //add an entry to the timeline
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