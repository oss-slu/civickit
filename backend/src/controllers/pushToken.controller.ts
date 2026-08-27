// backend/src/controllers/pushToken.controller.ts
import { Request, Response, NextFunction } from 'express';
import { UpvoteService } from '../services/upvote.service';
import { UpvoteRepository } from '../repositories/upvote.repository';
import { PushTokenService } from '../services/pushToken.service';
import { PushTokenRepository } from '../repositories/pushToken.repository';


const pushTokenService = new PushTokenService(new PushTokenRepository());

export class PushTokenController {
    async registerToken(req: Request, res: Response, next: NextFunction) {
        try {
            const { token, platform } = req.body;
            const userId = String(req.userId);
            const result = await pushTokenService.registerToken(
                {
                    token: String(token),
                    platform: String(platform),
                    userId
                }
            );

            res.status(201).json(result);

        } catch (error: any) {
            if (error.status) {
                return res.status(error.status).json({ message: error.message });
            }
            next(error);
        }
    }

    async removeToken(req: Request, res: Response, next: NextFunction) {
        try {
            const token = String(req.params.token);
            const result = await pushTokenService.removeToken(token);

            res.status(200).json(result);

        } catch (error: any) {
            if (error.status) {
                return res.status(error.status).json({ message: error.message });
            }
            next(error);
        }
    }
}