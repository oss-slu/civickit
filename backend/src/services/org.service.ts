// backend/src/services/org.service.ts

import { OrgRepository } from '../repositories/org.repository';
import { IssueCategory } from '@civickit/shared';
import { AppError } from '../utils/errors';
import { CreateOrgDTO } from '@civickit/shared/src/types/api';
import { MembershipRepository } from '../repositories/membership.repository';
import { Org } from '@civickit/shared/src/types/org';
import { PhotoRepository } from '../repositories/photo.repository';
import { IssueService } from './issue.service';
import { IssueRepository } from '../repositories/issue.repository';
import { AuthRepository } from '../repositories/auth.repository';

const membershipRepository = new MembershipRepository()
const authRepository = new AuthRepository()

export class OrgService {
  /**
   * Built once here rather than per call. The previous version constructed a
   * new IssueService inside findIssuesForOrg using module-level singletons,
   * while the rest of the class used injected repositories.
   */
  private readonly issueService: IssueService;

  constructor(private orgRepository: OrgRepository,
    private photoRepository: PhotoRepository,
    private issueRepository: IssueRepository) {
    this.issueService = new IssueService(
      issueRepository, photoRepository, orgRepository, authRepository, membershipRepository,
    );
  }

  async createOrg(data: CreateOrgDTO, adminId: string) {
    return this.orgRepository.create({ ...data, adminId: adminId });
  }

  /** One shape either way -- profilePhoto is always present, null when unset. */
  private async getOrgWithPhoto<T extends { profilePhotoId?: string | null }>(org: T) {
    const { profilePhotoId, ...rest } = org;
    const profilePhoto = profilePhotoId
      ? (await this.photoRepository.findById(profilePhotoId)) ?? null
      : null;

    return { ...rest, profilePhoto };
  }

  async getOrgById(id: string) {
    const org = await this.orgRepository.findById(id);
    if (!org) {
      throw new AppError('Organization not found', 404);
    }

    return await this.getOrgWithPhoto(org);
  }

  async getAllActiveOrgs() {
    let orgs = await this.orgRepository.findAllActive();
    for (let i = 0; i < orgs.length; i++) {
      orgs[i] = await this.getOrgWithPhoto(orgs[i]);
    }

    return orgs
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

    return await this.getOrgWithPhoto(org);
  }


  async findOrgsForIssue(lat: number, lng: number, category: IssueCategory) {
    if (lat === undefined || lng === undefined) {
      throw new AppError('Latitude and longitude are required', 400);
    }
    // OrgMatch selects id, name, type and categoryScope only -- it carries no
    // profile photo id, so the per-org lookup that used to run here was a
    // no-op on every row.
    return this.orgRepository.findOrgsForIssue(lat, lng, category);
  }

  async findIssuesForOrg(organizationId: string) {
    if (!organizationId) {
      throw new AppError('organizationId is required', 400);
    }
    const issues = await this.orgRepository.findIssuesForOrg(organizationId);
    return this.issueService.getExtendedIssueInfo(issues)
  }
}
