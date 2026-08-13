// shared/src/types/api.ts
import { IssueCategory, IssueStatus } from "../enums/issue";
import { BoundarySource, OrgRole, OrgStatus, OrgTier, OrgType } from "../enums/organization";
import { PhotoMetadataSource } from "../utils/photoMetadata";
import { Org } from "./org";
import { User } from "./user";

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface CreateIssueDTO {
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
    images?: string[];
    locationSource?: PhotoMetadataSource;
    photoTakenAt?: string;
    photoTakenAtSource?: PhotoMetadataSource;
}

export interface CreateOrgDTO {
    name: string;
    slug: string;
    type: OrgType;
    status: OrgStatus;
    tier: OrgTier;
    categoryScope: IssueCategory[];
    boundarySource?: BoundarySource;
    boundaryRef?: string;
    boundarySyncedAt?: Date;
}

export interface OrgMembershipDTO {
    userId: string;
    organizationId: string;
    role: OrgRole;
}

export interface PostUpdateDTO {
    message: string;
    status: IssueStatus;
    images?: string[];
    createdAt?: Date;
}

export interface GetNearbyIssueResponse {
    title: string;
    description: string;
    category: IssueCategory;
    latitude: number;
    longitude: number;
    address: string;
    district?: string;
    subregion?: string;
    name?: string;
    images: string[];
    id: string;
    createdAt: string;
    locationSource?: PhotoMetadataSource;
    photoTakenAt?: string;
    photoTakenAtSource?: PhotoMetadataSource;
    status: IssueStatus;
    distance: string
    upvoteCount: number
    author: Pick<User, 'id' | 'name' | 'profileImage'>;
    claimedById: string;
    claimedByUser?: Pick<User, 'id' | 'name' | 'profileImage'>;
    claimedByOrg?: Pick<Org, 'id' | 'name' | 'profileImage'>;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User
}

export interface CreateAuthDTO {
    email: string;
    password: string;
    name: string;
}
