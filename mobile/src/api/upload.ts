// mobile/src/api/upload.ts
import { apiFetch } from './client';

export interface UploadSignature {
    signature: string;
    timestamp: number;
    cloudName: string;
    apiKey: string;
}

/** Short-lived credentials for uploading straight to Cloudinary from the device. */
export function getUploadSignature(): Promise<UploadSignature> {
    return apiFetch('/upload/signature', { method: 'POST', auth: true });
}
