// mobile/src/services/cloudinaryService.ts
import type { CreatePhotoDTO, PhotoMetadataSource } from '@civickit/shared';
import { uploadApi } from '../api';
import type { UploadSignature } from '../api/upload';

interface CloudinaryUploadResponse {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    [key: string]: any;
}

/**
 * What Cloudinary tells us about a stored asset. Its width and height are
 * post-upload and orientation-normalized, which is why nothing downstream has
 * to interpret an EXIF Orientation tag.
 */
export interface UploadedPhoto {
    url: string;
    publicId: string;
    width: number;
    height: number;
}

/** A locally selected photo, with the metadata only the device can supply. */
export interface PendingPhoto {
    uri: string;
    photoTakenAt: string;
    photoTakenAtSource: PhotoMetadataSource;
}

// Cache upload signatures briefly to avoid repeated backend requests
let cachedSignature: (UploadSignature & { expiresAt: number }) | null = null;
const SIGNATURE_CACHE_DURATION_MS = 5 * 60 * 1000; // Cache for 5 minutes

// Get a signed upload token from the backend
// This allows secure direct uploads to Cloudinary without exposing credentials
async function getUploadSignature(): Promise<UploadSignature> {
    try {
        // Check if cached signature is still valid
        if (cachedSignature && Date.now() < cachedSignature.expiresAt) {
            console.log('Using cached upload signature');
            const { expiresAt, ...signatureData } = cachedSignature;
            return signatureData;
        }

        const startTime = Date.now();
        const result = await uploadApi.getUploadSignature();
        const elapsed = Date.now() - startTime;

        // Cache the signature with expiration time
        cachedSignature = {
            ...result,
            expiresAt: Date.now() + SIGNATURE_CACHE_DURATION_MS,
        };

        console.log(`Signature Request: ${elapsed}ms (network + parse)`);
        return result;
    } catch (error) {
        console.error('Error getting upload signature:', error);
        throw error;
    }
}


// Upload an image directly to Cloudinary from the mobile app using a signed request
// Returns the secure URL of the uploaded image
export async function uploadImageToCloudinary(imageUri: string): Promise<UploadedPhoto> {
    try {
        const uploadStartTime = Date.now();
        const timings = {} as any;

        // Step 1: Get signed upload credentials from backend
        const signatureStartTime = Date.now();
        const uploadSignature = await getUploadSignature();
        timings.signatureMs = Date.now() - signatureStartTime;

        // Step 2: Create FormData with signed credentials
        const formDataStartTime = Date.now();
        // In React Native, we can pass the URI directly to FormData
        const formData = new FormData();
        formData.append('file', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'photo.jpg',
        } as any);
        formData.append('api_key', uploadSignature.apiKey);
        formData.append('timestamp', uploadSignature.timestamp.toString());
        formData.append('signature', uploadSignature.signature);
        formData.append('folder', 'civickit/issues');
        timings.formDataMs = Date.now() - formDataStartTime;

        // Step 3: Upload to Cloudinary
        const cloudinaryStartTime = Date.now();
        const uploadUrl = `https://api.cloudinary.com/v1_1/${uploadSignature.cloudName}/image/upload`;

        const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        });

        timings.cloudinaryNetworkMs = Date.now() - cloudinaryStartTime;

        if (!uploadResponse.ok) {
            const error = await uploadResponse.json();
            throw new Error(`Cloudinary upload failed: ${error.error?.message || 'Unknown error'}`);
        }

        const data: CloudinaryUploadResponse = await uploadResponse.json();
        timings.totalMs = Date.now() - uploadStartTime;

        console.log(`Single Image Upload Breakdown:`, {
            signature: `${timings.signatureMs}ms`,
            formData: `${timings.formDataMs}ms`,
            cloudinaryNetwork: `${timings.cloudinaryNetworkMs}ms`,
            total: `${timings.totalMs}ms`,
        });

        return {
            url: data.secure_url,
            publicId: data.public_id,
            width: data.width,
            height: data.height,
        };
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
}

/**
 * Uploads in parallel and returns objects that are already the `photos` array
 * of the create-issue body.
 *
 * Metadata travels with each photo rather than in a second array zipped by
 * index: Promise.all preserves order, but pairing across two lists breaks
 * silently the moment a count differs, attaching one photo's timestamp to
 * another photo.
 */
export async function uploadPhotos(photos: PendingPhoto[]): Promise<CreatePhotoDTO[]> {
    try {
        return await Promise.all(
            photos.map(async (photo) => {
                const uploaded = await uploadImageToCloudinary(photo.uri);
                return {
                    ...uploaded,
                    photoTakenAt: photo.photoTakenAt,
                    photoTakenAtSource: photo.photoTakenAtSource,
                };
            }),
        );
    } catch (error) {
        console.error('Error uploading photos to Cloudinary:', error);
        throw error;
    }
}

