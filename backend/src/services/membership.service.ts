// backend/src/services/membership.service.ts

import { OrgRepository } from '../repositories/org.repository';
import { IssueCategory } from '@civickit/shared';
import { AppError } from '../utils/errors';
import { MembershipRepository } from '../repositories/membership.repository';
import { OrgMembershipDTO } from '@civickit/shared/src/types/api';
import { isForeignKeyViolation, isUniqueViolation } from '../db/errors';

export class MembershipService {
  constructor(private membershipRepository: MembershipRepository) { }

  // Granting membership -- including ORG_ADMIN -- is the organization's
  // privilege boundary, so the caller must already administer the organization
  // being written to. The check is scoped to data.organizationId: administering
  // one org must not confer write access to any other.
  async createMembership(data: OrgMembershipDTO, callerId: string) {
    if (!callerId) {
      throw new AppError('Not authenticated', 401);
    }
    if (!data.organizationId) {
      throw new AppError('organizationId is required', 400);
    }
    if (!data.userId) {
      throw new AppError('userId is required', 400);
    }

    const callerMembership = await this.membershipRepository.findByUserAndOrg(
      callerId,
      data.organizationId,
    );

    // One message for both "not a member" and "member but not admin" so the
    // response does not confirm whether an organization exists or who is in it.
    if (!callerMembership || callerMembership.role !== 'ORG_ADMIN') {
      throw new AppError('Only organization admins can manage memberships', 403);
    }

    try {
      return await this.membershipRepository.create({ ...data });
    } catch (error) {
      // The ids are well-formed but one of them names nothing. Postgres only
      // finds out at the foreign key, so the shape of the failure is the same
      // whether it was the user or the organization.
      if (isForeignKeyViolation(error)) {
        throw new AppError('User or organization not found', 404);
      }
      // OrgMembership_userId_organizationId_key. Note this makes createMembership
      // strictly an add: it cannot change the role of someone already in the org.
      if (isUniqueViolation(error)) {
        throw new AppError('User is already a member of this organization', 409);
      }
      throw error;
    }
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
