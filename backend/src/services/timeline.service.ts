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
      const update = await this.timelineRepository.createUpdate({ ...data, issueId, userId });
      const extendedUpdates = await this.getExtendedInfo([update])
      return extendedUpdates[0]
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

  private async getExtendedInfo(entries: any[]) {
    let newUp: any[] = []
    for (let i = 0; i < entries.length; i++) {
      newUp[i] = {
        ...entries[i],
        images: (await this.getUpdateImages(entries[i].imageIds)),
        userName: (await this.authRepository.findById(entries[i].userId))?.name
      }
      delete newUp[i].imageIds
    }
    return newUp
  }


  async getIssueUpdates(issueId: string) {
    const updates = await this.timelineRepository.findByIssue(issueId)
    return { updates: await this.getExtendedInfo(updates) }

  }

  async getUserUpdates(userId: string) {
    const updates = await this.timelineRepository.findByUser(userId)
    return { updates: await this.getExtendedInfo(updates) }
  }


}