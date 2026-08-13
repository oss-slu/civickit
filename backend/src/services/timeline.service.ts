// backend/src/services/timeline.service.ts
import { PostUpdateDTO } from '@civickit/shared/src/types/api';
import { TimelineRepository } from '../repositories/timeline.repository';
import { ImageRepository } from '../repositories/image.repository';
import { Image } from '@civickit/shared/src/types/image';
import { AuthRepository } from '../repositories/auth.repository';
import { AuthService } from './auth.service';

export class TimelineService {
  constructor(private readonly timelineRepository: TimelineRepository, private imageRepository: ImageRepository, private readonly authRepository: AuthRepository) { }

  async postUpdate(data: PostUpdateDTO, issueId: string, userId: string) {
    try {
      return await this.timelineRepository.createUpdate({ ...data, issueId, userId });
    } catch (error) {
      throw error;
    }
  }

  private async getUpdateImages(imageIds: string[]) {
    let images: Image[] = []
    for (let i = 0; i < imageIds.length; i++) {
      const image = await this.imageRepository.findById(imageIds[i])
      if (image != null) {
        images[i] = image
      }
    }
    return images
  }


  async getIssueUpdates(issueId: string) {
    const updates = await this.timelineRepository.findByIssue(issueId)

    let newUp: any[] = []
    for (let i = 0; i < updates.length; i++) {
      newUp[i] = {
        ...updates[i],
        userName: (await this.authRepository.findById(updates[i].userId))?.name
      }
    }
    return {
      updates: newUp
    };
  }

  async getUserUpdates(userId: string) {
    const updates = await this.timelineRepository.findByUser(userId)
    const newupdates = updates.map(async (update) => {
      const images = await this.getUpdateImages(update.imageIds)
      const newUp: any = {
        ...update,
        images: images
      }
      delete newUp.imageIds
      return newUp
    })



    let newUp: any[] | any = []
    for (let i = 0; i < updates.length; i++) {
      newUp[i] = {
        ...updates[i],
        username: (await this.authRepository.findById(updates[i].userId))?.name
      }
    }
    return {
      updates: newupdates
    };
  }


}