// backend/src/services/pushToken.service.ts
import { RecordNotFoundError } from '../db/errors';
import { PushTokenRepository } from '../repositories/pushToken.repository';
import { PushTokenDTO } from '@civickit/shared/src/types/api';

export class PushTokenService {
    constructor(private readonly pushTokenRepository: PushTokenRepository) { }

    async registerToken(data: PushTokenDTO) {
        try {
            const token = await this.pushTokenRepository.createPushToken(data);
            return token
        } catch (error: any) {
            //update pushtoken in case token didn't get unregistered
            if (error.cause != null && error.cause.constraint == 'PushToken_token_unique') {
                try {
                    const token = await this.pushTokenRepository.updateToken(data);
                    return token
                } catch (error) {
                    throw error
                }
            } else {
                throw error;
            }
        }
    }

    async removeToken(token: string) {
        try {
            const result = await this.pushTokenRepository.deletePushToken(token);
            return result
        } catch (error) {
            // Deleting no rows raises nothing in Postgres, where Prisma reported
            // P2025, so the repository raises this in its place.
            if (error instanceof RecordNotFoundError) {
                throw { status: 404, message: 'Push Token does not exist' };
            }
            throw error;
        }
    }
}