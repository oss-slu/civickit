// shared/src/types/api.ts
import { PhotoSource } from "../enums/image";
import { IssueCategory, IssueStatus } from "../enums/issue";
import { BoundarySource, OrgRole, OrgStatus, OrgTier, OrgType } from "../enums/organization";
import { PhotoMetadataSource } from "../utils/photoMetadata";
import { Org } from "./org";
import { User } from "./user";
import { Photo } from "./photo";

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
    photos?: CreatePhotoDTO[];
    locationSource?: PhotoMetadataSource;
}

export interface CreatePhotoDTO {
    url: string;
    publicId?: string;
    width?: number;
    height?: number;
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
    photos?: CreatePhotoDTO[];
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
    photos: Photo[];
    id: string;
    createdAt: string;
    locationSource?: PhotoMetadataSource;
    photoTakenAt?: string;
    photoTakenAtSource?: PhotoMetadataSource;
    status: IssueStatus;
    distance: string
    upvoteCount: number
    author: Pick<User, 'id' | 'name'>;
    claimedById: string;
    claimedByUser?: Pick<User, 'id' | 'name'>;
    claimedByOrg?: Pick<Org, 'id' | 'name' | 'profilePhoto'>;
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
