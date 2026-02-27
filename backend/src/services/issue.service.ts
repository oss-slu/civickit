// backend/src/services/issue.service.ts

import { IssueRepository } from '../repositories/issue.repository';
import { CreateIssueDTO } from '../types/issue.types';
import { uploadImage } from '../utils/cloudinary';

export class IssueService {
  constructor(private issueRepository: IssueRepository) { }

  async createIssue(data: CreateIssueDTO, userId: string, files?: Express.Multer.File[]) {
    let uploadedImages: string[] = [];

    // Upload images to Cloudinary if provided
    if (files && files.length > 0) {
      try {
        uploadedImages = await Promise.all(
          files.map(file =>
            uploadImage(file.buffer, file.originalname)
          )
        );
      } catch (error) {
        console.error('Cloudinary upload failed:', error);
        throw new Error('Image upload failed');
      }
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
      throw new Error('Issue not found');
    }
    return issue;
  }
}