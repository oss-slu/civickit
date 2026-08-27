// shared/src/types/pushToken.ts
import { IssueCategory, IssueStatus } from "../enums/issue";
import { PhotoMetadataSource } from "../utils/photoMetadata";
import { Org } from "./org";
import { User } from "./user";

export interface PushToken {
    id: string;
    token: string;
    userId: string;
    platform: string;
    createdAt: string;         // ISO string (not Date — safe for JSON)
    lastSeenAt: string;
}