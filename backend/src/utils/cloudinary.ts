// backend/src/utils/cloudinary.ts

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(fileBuffer: Buffer, filename: string): Promise<string> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: 'civickit/issues',
                resource_type: 'image',
                transformation: {
                    quality: 'auto',
                    fetch_format: 'auto',
                },
            },
            (error, result) => {
                if (error || !result) {
                    return reject(error || new Error('Upload failed'));
                }

                resolve(result!.secure_url);
            }
        ).end(fileBuffer);
    });
}