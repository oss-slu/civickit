// shared/src/types/api.ts
import { IssueCategory, IssueStatus } from "../enums/issue";
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
    status: IssueStatus;
    distance: string
    upvoteCount: number
    author: Pick<User, 'id' | 'name' | 'profileImage'>;
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
