// backend/src/controllers/organization.controller.ts
import { Request, Response, NextFunction } from 'express';
import { IssueService } from '../services/issue.service';
import { IssueRepository } from '../repositories/issue.repository';
import { PostUpdateDTO } from '@civickit/shared';
import { TimelineService } from '../services/timeline.service';
import { TimelineRepository } from '../repositories/timeline.repository';
import { OrgRepository } from '../repositories/org.repository';
import { MembershipRepository } from '../repositories/membership.repository';
import { OrgService } from '../services/org.service';
import { MembershipService } from '../services/membership.service';
import { PhotoRepository } from '../repositories/photo.repository';

const orgRepository = new OrgRepository();
const issueRepository = new IssueRepository()
const photoRepository = new PhotoRepository()
const orgService = new OrgService(orgRepository, photoRepository, issueRepository);

const membershipRepository = new MembershipRepository()
const membershipService = new MembershipService(membershipRepository)

export class OrgController {
  async createOrg(req: Request, res: Response, next: NextFunction) {
    try {
      const org = await orgService.createOrg(
        {
          ...req.body,
          //TODO: add in geofence
        }, req.userId!);
      res.status(201).json(org);

    } catch (error) {
      next(error);
    }
  }

  async createMembership(req: Request, res: Response, next: NextFunction) {
    try {

      const membership = await membershipService.createMembership(
        {
          ...req.body,
        }, req.userId!);
      res.status(201).json(membership);

    } catch (error) {
      next(error);
    }
  }

  async getOrgByOrgId(req: Request, res: Response, next: NextFunction) {
    try {
      const org = await orgService.getOrgById(String(req.params.orgId));
      res.json(org);
    } catch (error) {
      next(error);
    }
  }

  async getAllActiveOrgs(req: Request, res: Response, next: NextFunction) {
    try {
      const orgs = await orgService.getAllActiveOrgs();
      res.json(orgs);
    } catch (error) {
      next(error);
    }
  }

  async getOrgByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const org = await orgService.getOrgByUserId(String(req.params.userId));
      res.json(org);
    } catch (error) {
      next(error);
    }
  }

  async getMembershipsByOrgId(req: Request, res: Response, next: NextFunction) {
    try {
      const members = await membershipService.getOrgMemberships(String(req.params.orgId));
      res.json(members);
    } catch (error) {
      next(error);
    }
  }

  async getMembershipByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const org = await membershipService.getMembershipByUserId(String(req.params.userId));
      res.json(org);
    } catch (error) {
      next(error);
    }
  }



}