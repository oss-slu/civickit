// mobile/src/services/cloudinaryService.ts
import { File, UploadType } from 'expo-file-system';
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

        // Step 2: Upload to Cloudinary.
        //
        // This used to build a FormData with React Native's proprietary
        // `{ uri, type, name }` file part and hand it to global fetch. Expo SDK
        // 56 made expo/fetch the global fetch, and it is WinterTC-compliant:
        // it has no concept of a part that names a file on disk, and throws
        // "Unsupported FormDataPart implementation" on one. Expo tests that
        // behavior deliberately, so it is not going to come back.
        //
        // File.upload streams the file from disk in the native layer instead.
        // That matters here beyond just working: uploadPhotos runs these in
        // parallel, and reading each image into a JS Blob to satisfy the
        // spec-compliant FormData would put every photo in memory at once.
        const cloudinaryStartTime = Date.now();
        const uploadUrl = `https://api.cloudinary.com/v1_1/${uploadSignature.cloudName}/image/upload`;

        const uploadResponse = await new File(imageUri).upload(uploadUrl, {
            uploadType: UploadType.MULTIPART,
            fieldName: 'file',
            mimeType: 'image/jpeg',
            parameters: {
                api_key: uploadSignature.apiKey,
                timestamp: uploadSignature.timestamp.toString(),
                signature: uploadSignature.signature,
                folder: 'civickit/issues',
            },
        });

        timings.cloudinaryNetworkMs = Date.now() - cloudinaryStartTime;

        // upload() resolves for any completed response, 2xx or not, and hands
        // back the body as an unparsed string.
        let data: CloudinaryUploadResponse;
        try {
            data = JSON.parse(uploadResponse.body);
        } catch {
            throw new Error(
                `Cloudinary upload failed: HTTP ${uploadResponse.status}, unreadable response`,
            );
        }

        if (uploadResponse.status < 200 || uploadResponse.status >= 300) {
            throw new Error(`Cloudinary upload failed: ${data.error?.message || 'Unknown error'}`);
        }

        timings.totalMs = Date.now() - uploadStartTime;

        console.log(`Single Image Upload Breakdown:`, {
            signature: `${timings.signatureMs}ms`,
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

