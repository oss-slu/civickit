// backend/src/services/issue.service.ts

import { IssueRepository } from '../repositories/issue.repository';
import { CreateIssueDTO, IssueStatus } from '@civickit/shared';
import { Issue, issueStatus } from '../db/schema';
import { AppError } from '../utils/errors';
import { OrgRepository } from '../repositories/org.repository';
import { AuthRepository } from '../repositories/auth.repository';
import { MembershipRepository } from '../repositories/membership.repository';

/** Checked against the database enum, so the two cannot drift apart. */
function isIssueStatus(value: unknown): value is IssueStatus {
  return (
    typeof value === 'string' &&
    (issueStatus.enumValues as readonly string[]).includes(value)
  );
}


const orgRepository = new OrgRepository()
const authRepository = new AuthRepository()
const membershipRepository = new MembershipRepository()

export class IssueService {
  constructor(private issueRepository: IssueRepository) { }

  async createIssue(data: CreateIssueDTO, userId: string) {
    if (!data.title || data.title.length < 3) {
      throw new AppError('Title must be at least 3 characters', 400);
    }
    if (!data.category) {
      throw new AppError('Category is required', 400);
    }
    if (data.latitude === undefined || data.longitude === undefined) {
      throw new AppError('Latitude and longitude are required', 400);
    }

    // Images are already URLs from Cloudinary, provided by the client
    // Just save the issue with the image URLs
    return this.issueRepository.create({ ...data, userId, status: 'REPORTED' });
  }

  private async getClaimedByInfo(issues: Issue[]) {
    let newIssues: any[] = []
    for (let i = 0; i < issues.length; i++) {
      let user = null
      let org = null
      if (issues[i].claimedById != null) {
        user = await authRepository.findById(String(issues[i].claimedById))
        const membershipOrgId = (await membershipRepository.findByUser(String(issues[i].claimedById)))?.organizationId
        org = await orgRepository.findById(String(membershipOrgId))
      }
      newIssues[i] = {
        ...issues[i],
        claimedByUser: {
          name: user?.name,
          id: user?.id,
          profileImage: user?.profileImage
        },
        claimedByOrg: {
          name: org?.name,
          id: org?.id,
          profileImage: org?.profileImage
        },
      }
    }
    return newIssues
  }

  async getNearbyIssues(lat: number, lng: number, radius?: number, limit?: number) {
    const issues = await this.issueRepository.findNearby(lat, lng, radius, limit);
    const newIssues = this.getClaimedByInfo(issues)
    return newIssues
  }

  async getIssueById(id: string) {
    const issue = await this.issueRepository.findById(id);
    if (!issue) {
      throw new AppError('Issue not found', 404);
    }

    const newIssue = (await this.getClaimedByInfo([issue]))[0]

    // findById already counts upvotes in the same statement that reads the row.
    // This used to issue a second countUpvotes query and return both values.
    return newIssue;
  }

  async getIssuesByUser(id: string, limit?: number) {
    return this.issueRepository.findByUser(id, limit);
  }

  async getIssuesByUserUpvotes(id: string, limit?: number) {
    return this.issueRepository.findByUpvoter(id, limit);
  }

  // update status tag
  // Callers must gate this behind requirePermission('update:issue_status').
  async updateStatus(id: string, status: IssueStatus) {
    // The route has no body validation, so this is the only thing standing
    // between `PATCH {}` and the database. An absent status used to reach the
    // ORM as an empty patch, which Prisma treated as a no-op update and
    // answered 200 -- reporting success for a request that changed nothing.
    if (!isIssueStatus(status)) {
      throw new AppError('A valid status is required', 400);
    }

    return this.issueRepository.updateStatus(id, { status });
  }

  // claim an issue
  // Callers must gate this behind requirePermission('update:claim_issue').
  async claimIssue(issueId: string, claimedById: string) {
    return this.issueRepository.claimIssue(issueId, { claimedById });
  }

  // release an issue
  // Callers must gate this behind requirePermission('update:release_issue').
  async releaseIssue(issueId: string) {
    return this.issueRepository.releaseIssue(issueId);
  }
}