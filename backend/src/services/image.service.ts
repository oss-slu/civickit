// backend/src/services/image.service.ts

import { IssueRepository } from '../repositories/issue.repository';
import { CreateIssueDTO, IssueStatus, PhotoSource } from '@civickit/shared';
import { issueStatus } from '../db/schema';
import { AppError } from '../utils/errors';
import { ImageRepository } from '../repositories/image.repository';
import { createImageDTO } from '@civickit/shared/src/types/api';

export class ImageService {
  constructor(private imageRepository: ImageRepository) { }

  async createImage(data: createImageDTO, userId: string) {

    return this.imageRepository.create({ ...data, userId });
  }


  async getImageById(id: string) {
    const image = await this.imageRepository.findById(id);
    if (!image) {
      throw new AppError('Image not found', 404);
    }
    return image;
  }

  async updateImageSource(id: string, source: PhotoSource, sourceId: string) {
    return this.imageRepository.updateSource(id, { source: source, sourceId: sourceId })
  }


}