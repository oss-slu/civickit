// shared/src/types/issue.ts
import { IssueCategory, IssueStatus } from "../enums/issue";
import { PhotoMetadataSource } from "../utils/photoMetadata";
import { Org } from "./org";
import { Photo } from "./photo";
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
    photos: Photo[];
    cityRefNumber?: string;
    upvoteCount: number;
    createdAt: string;         // ISO string (not Date — safe for JSON)
    locationSource?: PhotoMetadataSource;
    photoTakenAt?: string;
    photoTakenAtSource?: PhotoMetadataSource;
    author: Pick<User, 'id' | 'name'>;
    claimedById: string;
    claimedByUser?: Pick<User, 'id' | 'name'>;
    claimedByOrg?: Pick<Org, 'id' | 'name' | 'profilePhoto'>;
}

export interface Upvote {
    id: string
    user: Pick<User, 'id' | 'name'>
    issue: Pick<Issue, 'id' | 'title'>
    createdAt: string
}
