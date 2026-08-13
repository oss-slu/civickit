// shared/src/types/image.ts
import { PhotoSource } from "../enums/image";
import { PhotoMetadataSource } from "../utils/photoMetadata";
import { User } from "./user";

export interface Image {
    id: string;
    userId: string;
    link: string;
    sourceId?: string | null;
    source?: PhotoSource | null;
    width: number;
    height: number;
    createdAt: Date;
    photoTakenAt?: Date;
    photoTakenAtSource?: string;
}

