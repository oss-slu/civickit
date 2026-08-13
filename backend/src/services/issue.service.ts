// backend/src/services/issue.service.ts

import { IssueRepository, NearbyIssue } from '../repositories/issue.repository';
import { CreateIssueDTO, Issue, IssueStatus } from '@civickit/shared';
import { Issue, issueStatus } from '../db/schema';
import { AppError } from '../utils/errors';
import { OrgRepository } from '../repositories/org.repository';
import { AuthRepository } from '../repositories/auth.repository';
import { MembershipRepository } from '../repositories/membership.repository';
import { ImageRepository } from '../repositories/image.repository';
import { Image } from '@civickit/shared/src/types/image';

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
  constructor(private issueRepository: IssueRepository, private imageRepository: ImageRepository) { }

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

  private async getIssueImages(imageIds: string[]) {
    let images: Image[] = []
    for (let i = 0; i < imageIds.length; i++) {
      const image = await this.imageRepository.findById(imageIds[i])
      if (image != null) {
        images[i] = image
      }
    }
    console.log(images)
    return images
  }

  async getNearbyIssues(lat: number, lng: number, radius?: number, limit?: number) {
    const issues = await this.issueRepository.findNearby(lat, lng, radius, limit);
    const newIssues = this.getClaimedByInfo(issues)
    return newIssues
    const issues = await this.issueRepository.findNearby(lat, lng, radius, limit);
    let newIssues: any[] = []
    for (let i = 0; i < issues.length; i++) {
      const images = await this.getIssueImages(issues[i].imageIds)
      const newIssue: any = {
        ...issues[i],
        images: images
      }
      delete newIssue.imageIds
      newIssues[i] = newIssue
    }

    return newIssues
  }

  async getIssueById(id: string) {
    const issue = await this.issueRepository.findById(id);
    if (!issue) {
      throw new AppError('Issue not found', 404);
    }

    const newIssue = (await this.getClaimedByInfo([issue]))[0]

    const images = await this.getIssueImages(issue.imageIds)
    const fullIssue: any = {
      ...issue,
      images: images
    }
    delete fullIssue.imageIds

    // findById already counts upvotes in the same statement that reads the row.
    // This used to issue a second countUpvotes query and return both values.
    return fullIssue;
  }

  async getIssuesByUser(id: string, limit?: number) {
    const issues = await this.issueRepository.findByUser(id, limit);
    let newIssues: any[] = []
    for (let i = 0; i < issues.length; i++) {
      const images = await this.getIssueImages(issues[i].imageIds)
      const newIssue: any = {
        ...issues[i],
        images: images
      }
      delete newIssue.imageIds
      newIssues[i] = newIssue
    }

    return newIssues
  }

  async getIssuesByUserUpvotes(id: string, limit?: number) {
    const issues = await this.issueRepository.findByUpvoter(id, limit);
    let newIssues: any[] = []
    for (let i = 0; i < issues.length; i++) {
      const images = await this.getIssueImages(issues[i].imageIds)
      const newIssue: any = {
        ...issues[i],
        images: images
      }
      delete newIssue.imageIds
      newIssues[i] = newIssue
    }

    return newIssues
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
  //
  // A claim is exclusive -- it is what marks the issue as one organization's to
  // work -- so claiming one that is already held has to fail rather than
  // silently reassign it.
  async claimIssue(issueId: string, claimedById: string) {
    const claimed = await this.issueRepository.claimIssue(issueId, { claimedById });
    if (claimed) {
      return claimed;
    }

    // The conditional update matched nothing. Read back to say why.
    const existing = await this.issueRepository.findById(issueId);
    if (!existing) {
      throw new AppError('Issue not found', 404);
    }

    // Already held by the caller: treat as a no-op rather than an error, so a
    // double-tap on Claim does not surface a failure.
    if (existing.claimedById === claimedById) {
      return existing;
    }

    throw new AppError('Issue is already claimed', 409);
  }

  // release an issue
  // Callers must gate this behind requirePermission('update:release_issue').
  async releaseIssue(issueId: string) {
    return this.issueRepository.releaseIssue(issueId);
  }
}