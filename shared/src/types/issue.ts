// shared/src/types/issue.ts
import { IssueCategory, IssueStatus } from "../enums/issue";
import { PhotoMetadataSource } from "../utils/photoMetadata";
import { User } from "./user";

export interface Issue {
    id: string;
    title: string;
    description: string;
    category: IssueCategory;
    status: IssueStatus;
    latitude: number;
    longitude: number;
    address: string;
    district?: string;
    subregion?: string;
    name?: string;
    images: string[];          // Cloudinary URLs
    cityRefNumber?: string;
    upvoteCount: number;
    createdAt: string;         // ISO string (not Date — safe for JSON)
    locationSource?: PhotoMetadataSource;
    photoTakenAt?: string;
    photoTakenAtSource?: PhotoMetadataSource;
    author: Pick<User, 'id' | 'name' | 'profileImage'>;
}

export interface Upvote {
    id: string
    user: Pick<User, 'id' | 'name' | 'profileImage'>
    issue: Pick<Issue, 'id' | 'title'>
    createdAt: string
}
