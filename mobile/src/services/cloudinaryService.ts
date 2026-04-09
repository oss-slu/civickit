// mobile/src/services/cloudinaryService.ts
import ENV from '../config/env';

interface CloudinaryUploadResponse {
    secure_url: string;
    public_id: string;
    [key: string]: any;
}

interface UploadSignature {
    signature: string;
    timestamp: number;
    cloudName: string;
    apiKey: string;
}

// Cache upload signatures briefly to avoid repeated backend requests
let cachedSignature: (UploadSignature & { expiresAt: number }) | null = null;
const SIGNATURE_CACHE_DURATION_MS = 5 * 60 * 1000; // Cache for 5 minutes

// Get a signed upload token from the backend
// This allows secure direct uploads to Cloudinary without exposing credentials
async function getUploadSignature(authToken: string): Promise<UploadSignature> {
    try {
        // Check if cached signature is still valid
        if (cachedSignature && Date.now() < cachedSignature.expiresAt) {
            console.log('Using cached upload signature');
            const { expiresAt, ...signatureData } = cachedSignature;
            return signatureData;
        }

        const startTime = Date.now();
        const response = await fetch(ENV.apiUrl + '/upload/signature', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to get upload signature from server');
        }

        const result = await response.json();
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
export async function uploadImageToCloudinary(
    imageUri: string,
    authToken: string
): Promise<string> {
    try {
        const uploadStartTime = Date.now();
        const timings = {} as any;

        // Step 1: Get signed upload credentials from backend
        const signatureStartTime = Date.now();
        const uploadSignature = await getUploadSignature(authToken);
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

        return data.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
}

// Upload multiple images to Cloudinary in parallel using signed requests
// Returns an array of secure URLs
export async function uploadImagesToCloudinary(
    imageUris: string[],
    authToken: string
): Promise<string[]> {
    try {
        const uploadPromises = imageUris.map(uri => uploadImageToCloudinary(uri, authToken));
        const urls = await Promise.all(uploadPromises);
        return urls;
    } catch (error) {
        console.error('Error uploading images to Cloudinary:', error);
        throw error;
    }
}

