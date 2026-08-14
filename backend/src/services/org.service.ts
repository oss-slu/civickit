// backend/src/services/org.service.ts

import { OrgRepository } from '../repositories/org.repository';
import { IssueCategory } from '@civickit/shared';
import { AppError } from '../utils/errors';
import { CreateOrgDTO } from '@civickit/shared/src/types/api';
import { MembershipRepository } from '../repositories/membership.repository';
import { Org } from '@civickit/shared/src/types/org';
import { ImageRepository } from '../repositories/image.repository';
import { IssueService } from './issue.service';
import { IssueRepository } from '../repositories/issue.repository';
import { AuthRepository } from '../repositories/auth.repository';

const membershipRepository = new MembershipRepository()
const authRepository = new AuthRepository()

export class OrgService {
  constructor(private orgRepository: OrgRepository,
    private imageRepository: ImageRepository,
    private issueRepository: IssueRepository) { }

  async createOrg(data: CreateOrgDTO, adminId: string) {
    return this.orgRepository.create({ ...data, adminId: adminId });
  }

  private async getOrgWithImage(org: any) {
    if (org.profileImageId != null) {
      const image = await this.imageRepository.findById(org.profileImageId)
      const fullOrg: any = {
        ...org,
        profileImage: image
      }
      delete fullOrg.profileImageId
      return fullOrg
    }
    return org
  }

  async getOrgById(id: string) {
    const org = await this.orgRepository.findById(id);
    if (!org) {
      throw new AppError('Organization not found', 404);
    }

    return await this.getOrgWithImage(org);
  }

  async getOrgByUserId(userId: string) {
    const membership = await membershipRepository.findByUser(userId)
    if (!membership) {
      throw new AppError('Member not found', 404);
    }

    const org = await this.orgRepository.findById(membership.organizationId);
    if (!org) {
      throw new AppError('Organization not found', 404);
    }

    return await this.getOrgWithImage(org);
  }


  async findOrgsForIssue(lat: number, lng: number, category: IssueCategory) {
    if (lat === undefined || lng === undefined) {
      throw new AppError('Latitude and longitude are required', 400);
    }
    const orgs = await this.orgRepository.findOrgsForIssue(lat, lng, category);
    let extOrgs: any[] = []
    for (let i = 0; i < orgs.length; i++) {
      extOrgs[i] = await this.getOrgWithImage(orgs[i])
    }
    return extOrgs
  }

  async findIssuesForOrg(organizationId: string) {
    if (!organizationId) {
      throw new AppError('organizationId is required', 400);
    }
    const issueService = new IssueService(this.issueRepository, this.imageRepository, this.orgRepository, authRepository, membershipRepository)
    const issues = await this.orgRepository.findIssuesForOrg(organizationId);
    const extIssues = await issueService.getExtendedIssueInfo(issues)
    return extIssues
  }
}
