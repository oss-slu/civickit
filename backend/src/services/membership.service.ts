// backend/src/services/membership.service.ts

import { OrgRepository } from '../repositories/org.repository';
import { IssueCategory } from '@civickit/shared';
import { AppError } from '../utils/errors';
import { MembershipRepository } from '../repositories/membership.repository';
import { OrgMembershipDTO } from '@civickit/shared/src/types/api';

export class MembershipService {
  constructor(private membershipRepository: MembershipRepository) { }

  async createMembership(data: OrgMembershipDTO) {
    return this.membershipRepository.create({ ...data });
  }

  async getOrgMemberships(orgId: string) {
    const members = await this.membershipRepository.findByOrganization(orgId);
    if (!members) {
      throw new AppError('Organization not found', 404);
    }

    return members;
  }

  async getMembershipByUserId(userId: string) {
    const member = await this.membershipRepository.findByUser(userId);
    // if (!member) {
    //   throw new AppError('Member not found', 404);
    // }

    return member;
  }

  async getMembershipById(id: string) {
    const org = await this.membershipRepository.findById(id);
    if (!org) {
      throw new AppError('Organization not found', 404);
    }

    return org;
  }

}
