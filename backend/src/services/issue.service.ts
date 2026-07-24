// backend/src/services/issue.service.ts

import { IssueRepository } from '../repositories/issue.repository';
import { CreateIssueDTO, IssueStatus } from '@civickit/shared';
import { uploadImage } from '../utils/cloudinary';
import { UpvoteRepository } from '../repositories/upvote.repository';
import { is } from 'zod/v4/locales';
import { AppError } from '../utils/errors';

export class IssueService {
  constructor(private issueRepository: IssueRepository, private upvoteRepository: UpvoteRepository) { }

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

    const upvoteCount = await this.upvoteRepository.countUpvotes(issue.id);

    return {
      ...issue,
      upvoteCount,
    };
  }

  async getIssuesByUser(id: string, limit?: number) {
    const issues = await this.issueRepository.findByUser(id, limit);

    return issues.map((issue) => ({ ...issue, upvoteCount: issue._count.upvotes }));
  }

  async getIssuesByUserUpvotes(id: string, limit?: number) {
    const issues = await this.issueRepository.findByUpvoter(id, limit);

    return issues.map((issue) => ({ ...issue, upvoteCount: issue._count.upvotes }));
  }

  // update status tag
  // Callers must gate this behind requirePermission('update:issue_status').
  async updateStatus(id: string, status: IssueStatus) {
    return this.issueRepository.updateStatus(id, { status });
  }
}