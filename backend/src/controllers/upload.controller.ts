// backend/src/controllers/upload.controller.ts
import { Request, Response, NextFunction } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class UploadController {
    /**
     * Generate a signed upload token for direct Cloudinary uploads from mobile
     * The token is time-limited and can be revoked if needed
     */
    async getUploadSignature(req: Request, res: Response, next: NextFunction) {
        try {
            const timestamp = Math.floor(Date.now() / 1000);

            // Create signature for secure upload
            // Only sign over parameters that will be sent in the upload
            const signature = cloudinary.utils.api_sign_request(
                {
                    timestamp,
                    folder: 'civickit/issues',
                },
                process.env.CLOUDINARY_API_SECRET!
            );

            res.json({
                signature,
                timestamp,
                cloudName: process.env.CLOUDINARY_CLOUD_NAME,
                apiKey: process.env.CLOUDINARY_API_KEY,
            });
        } catch (error) {
            next(error);
        }
    }
}
