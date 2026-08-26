// backend/src/services/issue.service.ts

import { IssueRepository } from '../repositories/issue.repository';
import { CreateIssueDTO, IssueStatus } from '@civickit/shared';
import { Issue, issueStatus } from '../db/schema';
import { AppError } from '../utils/errors';
import { OrgRepository } from '../repositories/org.repository';
import { AuthRepository } from '../repositories/auth.repository';
import { MembershipRepository } from '../repositories/membership.repository';
import { PhotoRepository } from '../repositories/photo.repository';
import { Photo } from '../db/schema';

/** Checked against the database enum, so the two cannot drift apart. */
function isIssueStatus(value: unknown): value is IssueStatus {
  return (
    typeof value === 'string' &&
    (issueStatus.enumValues as readonly string[]).includes(value)
  );
}


export type IssueWithPhotos<T = unknown> = T & { photos: Photo[] };

export class IssueService {
  constructor(private issueRepository: IssueRepository,
    private photoRepository: PhotoRepository,
    private orgRepository: OrgRepository,
    private authRepository: AuthRepository,
    private membershipRepository: MembershipRepository) { }

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

    const { issue, photos } = await this.issueRepository.createWithPhotos({
      ...data,
      userId,
      status: 'REPORTED',
    });

    return { ...issue, photos };
  }

  /**
   * Still one lookup per claimed issue. Unlike the photo N+1 this only runs for
   * issues someone has claimed, so it is left for a follow-up -- see
   * docs/design-decisions/photo-storage.md.
   */
  private async getClaimedByInfo<T extends { id: string; claimedById?: string | null }>(
    issues: T[],
  ) {
    const newIssues = []
    for (const issue of issues) {
      let user = null
      let org = null
      if (issue.claimedById != null) {
        user = await this.authRepository.findById(String(issue.claimedById))
        const membershipOrgId = (
          await this.membershipRepository.findByUser(String(issue.claimedById))
        )?.organizationId
        org = await this.orgRepository.findById(String(membershipOrgId))
      }

      newIssues.push({
        ...issue,
        claimedByUser: user ? { name: user.name, id: user.id } : null,
        claimedByOrg: org
          ? {
            name: org.name,
            id: org.id,
            profilePhoto: org.profilePhotoId
              ? (await this.photoRepository.findById(org.profilePhotoId)) ?? null
              : null,
          }
          : null,
      })
    }
    return newIssues
  }

  /**
   * One query for every issue's photos, then a map lookup. The version this
   * replaced ran one query per photo inside a loop over issues -- a 100-issue
   * feed at three photos each was 300 sequential round trips.
   */
  async attachPhotos<T extends { id: string }>(issues: T[]): Promise<IssueWithPhotos<T>[]> {
    const byIssue = await this.photoRepository.findOriginalsByIssueIds(issues.map((i) => i.id))
    return issues.map((issue) => ({ ...issue, photos: byIssue.get(issue.id) ?? [] }))
  }

  /** Claim attribution plus photos, in that order. */
  async getExtendedIssueInfo<T extends { id: string; claimedById?: string | null }>(
    issues: T[],
  ) {
    return this.attachPhotos(await this.getClaimedByInfo(issues))
  }


  async getNearbyIssues(lat: number, lng: number, radius?: number, limit?: number) {
    const issues = await this.issueRepository.findNearby(lat, lng, radius, limit);
    return await this.getExtendedIssueInfo(issues)
  }

  async getIssueById(id: string) {
    const issue = await this.issueRepository.findById(id);
    if (!issue) {
      throw new AppError('Issue not found', 404);
    }
    const newIssues = await this.getExtendedIssueInfo([issue])

    return newIssues[0]
  }

  async getIssuesByUser(id: string, limit?: number) {
    const issues = await this.issueRepository.findByUser(id, limit);
    return await this.getExtendedIssueInfo(issues)
  }

  async getIssuesByUserUpvotes(id: string, limit?: number) {
    const issues = await this.issueRepository.findByUpvoter(id, limit);
    return await this.getExtendedIssueInfo(issues)
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

    const issue = await this.issueRepository.updateStatus(id, { status });
    const newIssues = await this.getExtendedIssueInfo([issue])
    return newIssues[0]
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
      const newIssues = await this.getExtendedIssueInfo([claimed])
      return newIssues[0]
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
    const issues = await this.issueRepository.releaseIssue(issueId);
    const newIssues = await this.getExtendedIssueInfo([issues])
    return newIssues[0]
  }
}