// backend/src/repositories/issue.repository.ts
import prisma from "../prisma";
import { CreateIssueDTO, Issue, IssueStatus } from '@civickit/shared';

export class IssueRepository {
  async create(data: CreateIssueDTO & { userId: string }) {
    return prisma.issue.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        status: data.status,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        district: data.district,
        subregion: data.subregion,
        name: data.name,
        images: data.images,
        locationSource: data.locationSource,
        photoTakenAt: data.photoTakenAt,
        photoTakenAtSource: data.photoTakenAtSource,
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
          },
        },
      },
    });
  }

  // TODO(integration): assert LIMIT + upvoteCount against a real PostGIS database
  async findNearby(lat: number, lng: number, radiusMeters: number = 1000, limit: number = 100): Promise<any[]> {
    // Using raw SQL for PostGIS geospatial query
    return prisma.$queryRaw`
      SELECT
        i.*,
        (SELECT count(*)::int FROM "Upvote" u WHERE u."issueId" = i.id) AS "upvoteCount",
        ST_Distance(
          ST_SetSRID(ST_MakePoint(i.longitude, i.latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        ) as distance
      FROM "Issue" i
      WHERE ST_DWithin(
        ST_SetSRID(ST_MakePoint(i.longitude, i.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ${radiusMeters}
      )
      ORDER BY distance ASC
      LIMIT ${limit}
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
        _count: {
          select: {
            upvotes: true,
          },
        },
      },
    });
  }

  async findByUser(id: string, limit: number = 100) {
    return prisma.issue.findMany({
      where: { userId: id },
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
          },
        },
      },
      take: limit,
    });
  }

  async findByUpvoter(userId: string, limit: number = 100) {
    return prisma.issue.findMany({
      where: { upvotes: { some: { userId } } },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
        _count: { select: { upvotes: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // update issue statuss
  async updateStatus(id: string, data: Partial<{ status: IssueStatus }>) {
    return prisma.issue.update({
      where: { id },
      data,
    });
  }
}
