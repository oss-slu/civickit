// filepath: backend/src/utils/cloudinary-upload.ts
/**
 * Cloudinary Upload Utilities
 * 
 * Helper functions for uploading images to Cloudinary.
 */

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image buffer to Cloudinary
 */
export async function uploadImageToCloudinary(
    imageBuffer: Buffer,
    options?: {
        folder?: string;
        publicId?: string;
    }
): Promise<string> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: options?.folder || 'civickit/seeds',
                resource_type: 'image',
                public_id: options?.publicId,
                transformation: [
                    { quality: 'auto', fetch_format: 'auto' },
                ],
            },
            (error, result) => {
                if (error || !result) {
                    return reject(error || new Error('Upload failed'));
                }
                resolve(result.secure_url);
            }
        ).end(imageBuffer);
    });
}

/**
 * Upload an image file from disk to Cloudinary
 */
export async function uploadImageFile(
    filePath: string,
    options?: {
        folder?: string;
        publicId?: string;
    }
): Promise<string> {
    const imageBuffer = fs.readFileSync(filePath);
    return uploadImageToCloudinary(imageBuffer, options);
}

/**
 * Upload multiple images from an array of file paths
 */
export async function uploadMultipleImages(
    filePaths: string[],
    options?: {
        folder?: string;
    }
): Promise<string[]> {
    const results = await Promise.all(
        filePaths.map(async (filePath, index) => {
            const fileName = path.basename(filePath, path.extname(filePath));
            return uploadImageFile(filePath, {
                folder: options?.folder,
                publicId: `${fileName}_${Date.now()}_${index}`,
            });
        })
    );
    return results;
}

/**
 * Delete an image from Cloudinary by URL
 */
export async function deleteImageFromCloudinary(imageUrl: string): Promise<void> {
    // Extract public ID from URL
    const match = imageUrl.match(/civickit\/(.+)$/);
    if (match) {
        const publicId = match[1].replace(/\/[^/]+$/, ''); // Remove file extension
        await cloudinary.uploader.destroy(publicId);
    }
}