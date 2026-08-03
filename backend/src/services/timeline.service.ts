// backend/src/services/timeline.service.ts
import { PostUpdateDTO } from '@civickit/shared/src/types/api';
import { TimelineRepository } from '../repositories/timeline.repository';
import { Prisma } from '@prisma/client';

export class TimelineService {
  constructor(private readonly timelineRepository: TimelineRepository) { }

  async postUpdate(data: PostUpdateDTO, issueId: string, userId: string) {
    try {
      return await this.timelineRepository.createUpdate({ ...data, issueId, userId });
    } catch (error) {
      throw error;
    }
  }

  async getIssueUpdates(issueId: string) {
    const updates = await this.timelineRepository.findByIssue(issueId)

    return {
      updates
    };
  }

  async getUserUpdates(userId: string) {
    const updates = await this.timelineRepository.findByUser(userId)
    return {
      updates
    };
  }


}