// shared/src/types/photo.ts
import { PhotoMetadataSource } from "../utils/photoMetadata";

export interface Photo {
    id: string;
    userId: string;
    url: string;
    /** Cloudinary asset id. Null for anything not uploaded to Cloudinary. */
    publicId?: string | null;
    width?: number | null;
    height?: number | null;
    photoTakenAt?: string | null;
    photoTakenAtSource?: PhotoMetadataSource | null;
    position: number;
    createdAt: string;
}
