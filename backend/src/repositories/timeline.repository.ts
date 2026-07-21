// backend/src/repositories/timeline.repository.ts
import { PostUpdateDTO } from "@civickit/shared/src/types/api";
import prisma from "../prisma";

export class TimelineRepository {
  async createUpdate(data: PostUpdateDTO & { issueId: string, userId: string }) {
    return prisma.timelineEntry.create({
      data: {
        message: data.message,
        status: data.status,
        images: data.images,
        userId: data.userId,
        issueId: data.issueId
      },
    });
  }

  async findByIssue(id: string) {
    return prisma.timelineEntry.findMany({
      where: { issueId: id },
    });
  }

  async findByUser(id: string) {
    return prisma.timelineEntry.findMany({
      where: { userId: id },
    });
  }

}

