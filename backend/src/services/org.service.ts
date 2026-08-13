// backend/src/services/org.service.ts

import { OrgRepository } from '../repositories/org.repository';
import { IssueCategory } from '@civickit/shared';
import { AppError } from '../utils/errors';
import { CreateOrgDTO } from '@civickit/shared/src/types/api';
import { MembershipRepository } from '../repositories/membership.repository';

const membershipRepository = new MembershipRepository()

export class OrgService {
  constructor(private orgRepository: OrgRepository) { }

  async createOrg(data: CreateOrgDTO, adminId: string) {
    return this.orgRepository.create({ ...data, adminId: adminId });
  }

  async getOrgById(id: string) {
    const org = await this.orgRepository.findById(id);
    if (!org) {
      throw new AppError('Organization not found', 404);
    }

    return org;
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

    return org;
  }


  async findOrgsForIssue(lat: number, lng: number, category: IssueCategory) {
    if (lat === undefined || lng === undefined) {
      throw new AppError('Latitude and longitude are required', 400);
    }
    return this.orgRepository.findOrgsForIssue(lat, lng, category);
  }

  async findIssuesForOrg(organizationId: string) {
    if (!organizationId) {
      throw new AppError('organizationId is required', 400);
    }
    return this.orgRepository.findIssuesForOrg(organizationId);
  }
}
