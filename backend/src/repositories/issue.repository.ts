// backend/src/repositories/issue.repository.ts
import prisma from "../prisma";
import { CreateIssueDTO, Issue } from '@civickit/shared';

export class IssueRepository {
  async create(data: CreateIssueDTO & { userId: string }) {
    return prisma.issue.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        latitude: data.latitude,
        longitude: data.longitude,
        images: data.images,
        userId: data.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        _count: {
          select: {
            upvotes: true,
            comments: true,
          },
        },
      },
    });
  }

  async findNearby(lat: number, lng: number, radiusMeters: number = 1000): Promise<Issue[]> {
    // Using raw SQL for PostGIS geospatial query
    return prisma.$queryRaw`
      SELECT 
        i.*,
        ST_Distance(
          ST_MakePoint(i.longitude, i.latitude)::geography,
          ST_MakePoint(${lng}, ${lat})::geography
        ) as distance
      FROM "Issue" i
      WHERE ST_DWithin(
        ST_MakePoint(i.longitude, i.latitude)::geography,
        ST_MakePoint(${lng}, ${lat})::geography,
        ${radiusMeters}
      )
      ORDER BY distance ASC
    `;
  }

  async findById(id: string) {
    return prisma.issue.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            upvotes: true,
            comments: true,
          },
        },
      },
    });
  }
}