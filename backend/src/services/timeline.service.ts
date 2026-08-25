// backend/src/services/timeline.service.ts

import { IssueStatus, PostUpdateDTO } from '@civickit/shared';
import { AuthRepository } from '../repositories/auth.repository';
import { PhotoRepository } from '../repositories/photo.repository';
import { TimelineRepository } from '../repositories/timeline.repository';

export class TimelineService {
  constructor(
    private readonly timelineRepository: TimelineRepository,
    private readonly photoRepository: PhotoRepository,
    private readonly authRepository: AuthRepository,
  ) { }

  async postUpdate(data: PostUpdateDTO, issueId: string, userId: string) {
    const { entry, photos } = await this.timelineRepository.createWithPhotos({
      message: data.message,
      status: data.status,
      photos: data.photos,
      createdAt: data.createdAt,
      issueId,
      userId,
    });

    return { ...entry, photos };
  }

  /**
   * Server-authored entries. `entryType` is what the client reads to decide an
   * entry is unattributed -- it replaces matching on the message string, which
   * marked the whole timeline anonymous whenever no match was found.
   */
  async postSystemEntry(
    data: { message: string; status: IssueStatus; createdAt?: Date },
    issueId: string,
    userId: string,
  ) {
    const { entry, photos } = await this.timelineRepository.createWithPhotos({
      ...data,
      entryType: 'SYSTEM_REPORT_SUBMITTED',
      issueId,
      userId,
    });

    return { ...entry, photos };
  }

  /** One photo query for the whole page of entries, then a map lookup. */
  private async attachPhotos<T extends { id: string }>(entries: T[]) {
    const byEntry = await this.photoRepository.findByTimelineEntryIds(entries.map((e) => e.id));
    return entries.map((entry) => ({ ...entry, photos: byEntry.get(entry.id) ?? [] }));
  }

  async getIssueUpdates(issueId: string) {
    return { updates: await this.attachPhotos(await this.timelineRepository.findByIssue(issueId)) };
  }

  async getUserUpdates(userId: string) {
    return { updates: await this.attachPhotos(await this.timelineRepository.findByUser(userId)) };
  }
}
