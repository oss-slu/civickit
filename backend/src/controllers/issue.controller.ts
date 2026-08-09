// backend/src/controllers/issue.controller.ts
import { Request, Response, NextFunction } from 'express';
import { IssueService } from '../services/issue.service';
import { IssueRepository } from '../repositories/issue.repository';
import { PostUpdateDTO } from '@civickit/shared';
import { TimelineService } from '../services/timeline.service';
import { TimelineRepository } from '../repositories/timeline.repository';

const issueRepository = new IssueRepository();
const issueService = new IssueService(issueRepository);
const timelineService = new TimelineService(new TimelineRepository());

// Parses an optional `limit` query param, clamped to [1, 200], defaulting to 100.
function parseLimit(raw: unknown): number {
  const DEFAULT_LIMIT = 100;
  const MIN_LIMIT = 1;
  const MAX_LIMIT = 200;

  if (typeof raw !== 'string' || raw.length === 0) {
    return DEFAULT_LIMIT;
  }

  const parsed = parseInt(raw, 10);
  if (isNaN(parsed)) {
    return DEFAULT_LIMIT;
  }

  return Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, parsed));
}

export class IssueController {
  async createIssue(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!
      const latitude = parseFloat(req.body.latitude);
      const longitude = parseFloat(req.body.longitude);

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: 'Invalid coordinates' });
      }
      const issue = await issueService.createIssue(
        {
          ...req.body,
          latitude: parseFloat(req.body.latitude),
          longitude: parseFloat(req.body.longitude),
        }, userId);
      res.status(201).json(issue);

      // Seed the issue's timeline. Posted after the response, as on main --
      // see "Known gaps" in plans/013 before changing that ordering.
      const reported: PostUpdateDTO = {
        message: "Report Submitted",
        createdAt: new Date(issue.createdAt),
        status: issue.status,
        images: issue.images
      }
      await timelineService.postUpdate(reported, String(issue.id), userId);

      const photoTaken: PostUpdateDTO = {
        message: "Photo Taken",
        createdAt: issue.photoTakenAt != null ? issue.photoTakenAt : issue.createdAt,
        status: issue.status,
        images: issue.images
      }
      await timelineService.postUpdate(photoTaken, String(issue.id), userId);
    } catch (error) {
      next(error);
    }
  }

  async getNearbyIssues(req: Request, res: Response, next: NextFunction) {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radius = req.query.radius ? parseInt(req.query.radius as string) : undefined;
      const limit = parseLimit(req.query.limit);

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ error: 'Invalid coordinates' });
      }

      const issues = await issueService.getNearbyIssues(lat, lng, radius, limit);
      res.json({ issues });
    } catch (error) {
      next(error);
    }
  }

  async getIssueById(req: Request, res: Response, next: NextFunction) {
    try {
      const issue = await issueService.getIssueById(String(req.params.id));
      res.json(issue);
    } catch (error) {
      next(error);
    }
  }

  async getIssuesByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseLimit(req.query.limit);
      const issues = await issueService.getIssuesByUser(String(req.query.id), limit);
      res.json({ issues });
    } catch (error) {
      next(error);
    }
  }

  async getIssuesByUserUpvotes(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseLimit(req.query.limit);
      const issues = await issueService.getIssuesByUserUpvotes(String(req.query.id), limit);
      res.json({ issues });
    } catch (error) {
      next(error);
    }
  }


  // update issue status
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const issue = await issueService.updateStatus(String(req.params.issueId), req.body.status);
      res.json(issue);
    } catch (error) {
      next(error);
    }
  }

  // claim issue
  async claimIssue(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!
      const issue = await issueService.claimIssue(String(req.params.issueId), userId);
      res.json(issue);
    } catch (error) {
      next(error);
    }
  }

  //release issue
  async releaseIssue(req: Request, res: Response, next: NextFunction) {
    try {
      const issue = await issueService.releaseIssue(String(req.params.issueId));
      res.json(issue);
    } catch (error) {
      next(error);
    }
  }
}