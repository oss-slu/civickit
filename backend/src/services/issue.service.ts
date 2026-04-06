// backend/src/services/issue.service.ts

import { IssueRepository } from '../repositories/issue.repository';
import { CreateIssueDTO } from '@civickit/shared';

export class IssueService {
  constructor(private issueRepository: IssueRepository) { }

  async createIssue(data: CreateIssueDTO, userId: string) {
    if (!data.title || data.title.length < 3) {
      throw { status: 400, message: 'Title must be at least 3 characters' };
    }
    if (!data.category) {
      throw { status: 400, message: 'Category is required' };
    }
    if (data.latitude === undefined || data.longitude === undefined) {
      throw { status: 400, message: 'Latitude and longitude are required' };
    }

    // Images are already URLs from Cloudinary, provided by the client
    // Just save the issue with the image URLs
    return this.issueRepository.create({ ...data, userId });
  }


  async getNearbyIssues(lat: number, lng: number, radius?: number) {
    return this.issueRepository.findNearby(lat, lng, radius);
  }

  async getIssueById(id: string) {
    const issue = await this.issueRepository.findById(id);
    if (!issue) {
      throw { status: 404, message: 'Issue not found' };
    }
    return issue;
  }
}