// backend/src/services/issue.service.ts

import { IssueRepository } from '../repositories/issue.repository';
import { CreateIssueDTO } from '@civickit/shared';
import { uploadImage } from '../utils/cloudinary';

export class IssueService {
  constructor(private issueRepository: IssueRepository) { }

  async createIssue(data: CreateIssueDTO, userId: string, files?: Express.Multer.File[]) {
    let uploadedImages: string[] = [];

    // Upload images to Cloudinary if provided
    if (files && files.length > 0) {
      try {
        uploadedImages = await Promise.all(files.map(file => uploadImage(file.buffer)));
      } catch (error) {
        console.error('Cloudinary upload failed:', error);
        throw new Error('Image upload failed');
      }
    }

    if (!data.title || data.title.length < 3) {
      throw { status: 400, message: 'Title must be at least 3 characters' };
    }
    if (!data.category) {
      throw { status: 400, message: 'Category is required' };
    }
    if (data.latitude === undefined || data.longitude === undefined) {
      throw { status: 400, message: 'Latitude and longitude are required' };
    }

    // Save issue with image metadata
    return this.issueRepository.create({ ...data, userId, images: uploadedImages });
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