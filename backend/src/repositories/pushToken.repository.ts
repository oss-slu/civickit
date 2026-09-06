// backend/src/repositories/pushToken.repository.ts

import { and, count, eq } from 'drizzle-orm';
import db from '../db';
import { RecordNotFoundError } from '../db/errors';
import { pushTokens, upvotes } from '../db/schema';
import { PushTokenDTO } from '@civickit/shared/src/types/api';

export class PushTokenRepository {
    async createPushToken(data: PushTokenDTO) {
        const [pushToken] = await db.insert(pushTokens).values({
            userId: data.userId,
            token: data.token,
            platform: data.platform
        }).returning();

        return pushToken;
    }

    async updateToken(data: PushTokenDTO) {
        const [updated] = await db
            .update(pushTokens)
            .set({ ...data, lastSeenAt: new Date() })
            .where(eq(pushTokens.token, data.token))
            .returning();

        if (!updated) {
            throw new RecordNotFoundError('Issue not found');
        }

        return updated;
    }

    async deletePushToken(token: string) {
        const [deleted] = await db
            .delete(pushTokens)
            .where(eq(pushTokens.token, token))
            .returning();

        // Deleting nothing is not an error in Postgres, where Prisma raised P2025.
        // pushToken.service.ts still needs to answer 404, so the absence is raised here.
        if (!deleted) {
            throw new RecordNotFoundError('Push Token does not exist');
        }

        return deleted;
    }



    async findByUser(id: string) {
        return db.select().from(pushTokens).where(eq(pushTokens.userId, id));
    }
}