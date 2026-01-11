// backend/src/services/issue.service.ts

import { IssueRepository } from '../repositories/issue.repository';
import { CreateIssueDTO } from '../types/issue.types';

export class IssueService {
  constructor(private issueRepository: IssueRepository) {}

  async createIssue(data: CreateIssueDTO, userId: string) {
    // TODO: Upload images to Cloudinary here
    // For now, just pass through
    return this.issueRepository.create({ ...data, userId });
  }

  async getNearbyIssues(lat: number, lng: number, radius?: number) {
    return this.issueRepository.findNearby(lat, lng, radius);
  }

  async getIssueById(id: string) {
    const issue = await this.issueRepository.findById(id);
    if (!issue) {
      throw new Error('Issue not found');
    }
    return issue;
  }
}