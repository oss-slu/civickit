// backend/src/services/timeline.service.ts
import { PostUpdateDTO } from '@civickit/shared/src/types/api';
import { TimelineRepository } from '../repositories/timeline.repository';
import { AuthRepository } from '../repositories/auth.repository';
import { AuthService } from './auth.service';

const authRepository = new AuthRepository()
const authService = new AuthService(authRepository)
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

    let newUp: any[] = []
    for (let i = 0; i < updates.length; i++) {
      newUp[i] = {
        ...updates[i],
        userName: (await authRepository.findById(updates[i].userId))?.name
      }
    }

    return {
      updates: newUp
    };
  }

  async getUserUpdates(userId: string) {
    const updates = await this.timelineRepository.findByUser(userId)


    let newUp: any[] | any = []
    for (let i = 0; i < updates.length; i++) {
      newUp[i] = {
        ...updates[i],
        username: (await authRepository.findById(updates[i].userId))?.name
      }
    }

    return {
      updates: newUp
    };
  }


}