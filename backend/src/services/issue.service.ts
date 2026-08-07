// backend/src/services/issue.service.ts

import { IssueRepository } from '../repositories/issue.repository';
import { CreateIssueDTO, IssueStatus } from '@civickit/shared';
import { issueStatus } from '../db/schema';
import { AppError } from '../utils/errors';

/** Checked against the database enum, so the two cannot drift apart. */
function isIssueStatus(value: unknown): value is IssueStatus {
  return (
    typeof value === 'string' &&
    (issueStatus.enumValues as readonly string[]).includes(value)
  );
}

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

  async getNearbyIssues(lat: number, lng: number, radius?: number, limit?: number) {
    return this.issueRepository.findNearby(lat, lng, radius, limit);
  }

  async getIssueById(id: string) {
    const issue = await this.issueRepository.findById(id);
    if (!issue) {
      throw new AppError('Issue not found', 404);
    }

    // findById already counts upvotes in the same statement that reads the row.
    // This used to issue a second countUpvotes query and return both values.
    return issue;
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
}