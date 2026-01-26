// backend/src/controllers/issue.controller.ts
import { Request, Response, NextFunction } from 'express';
import { IssueService } from '../services/issue.service';
import { IssueRepository } from '../repositories/issue.repository';

const issueRepository = new IssueRepository();
const issueService = new IssueService(issueRepository);

export class IssueController {
  async createIssue(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: Get userId from JWT token (auth middleware)
      const userId = 'temp-user-id'; // Placeholder
      
      const issue = await issueService.createIssue(req.body, userId);
      res.status(201).json(issue);
    } catch (error) {
      next(error);
    }
  }

  async getNearbyIssues(req: Request, res: Response, next: NextFunction) {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radius = req.query.radius ? parseInt(req.query.radius as string) : undefined;

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ error: 'Invalid coordinates' });
      }

      const issues = await issueService.getNearbyIssues(lat, lng, radius);
      res.json({ issues });
    } catch (error) {
      next(error);
    }
  }

  async getIssueById(req: Request, res: Response, next: NextFunction) {
    try {
        const issue = await issueService.getIssueById(req.params.id);
        res.json(issue);
    } catch (error) {
        next(error);
    }
  }
}