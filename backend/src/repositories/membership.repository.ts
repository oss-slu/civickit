// backend/src/repositories/issue.repository.ts

import { CreateIssueDTO, IssueStatus } from '@civickit/shared';
import { and, desc, eq, exists, getTableColumns, sql } from 'drizzle-orm';
import db, { first } from '../db';
import { RecordNotFoundError } from '../db/errors';
import { Issue, orgMemberships, upvotes, users } from '../db/schema';
import { OrgMembershipDTO } from '@civickit/shared/src/types/api';


export class MembershipRepository {

  async create(data: OrgMembershipDTO) {
    const [inserted] = await db
      .insert(orgMemberships)
      .values({
        userId: data.userId,
        organizationId: data.organizationId,
        role: data.role,
      })
      .returning({ id: orgMemberships.id });

    // Re-read so create returns the same shape as findById.
    return (await this.findById(inserted.id))!;
  }

  async findById(id: string) {
    return db.select().from(orgMemberships).where(eq(orgMemberships.id, id));
  }

  async findByUser(id: string) {
    return first(
      await db.select().from(orgMemberships).where(eq(orgMemberships.userId, id))
    )

  }
  async findByOrganization(id: string) {
    return db.select().from(orgMemberships).where(eq(orgMemberships.organizationId, id));
  }
}
