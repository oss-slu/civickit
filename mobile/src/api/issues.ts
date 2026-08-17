// mobile/src/api/issues.ts
import type { CreateIssueDTO, GetNearbyIssueResponse, Issue, PostUpdateDTO, User, Image } from '@civickit/shared';
import { apiFetch } from './client';

export const METERS_PER_MILE = 1609.34;

/**
 * Shape actually returned by the issue *list* endpoints. This is deliberately
 * not `Issue` from @civickit/shared: the backend names the author relation
 * `user`, not `author`. Reconciling the two is a separate change — this type
 * documents reality in the meantime.
 *
 * `upvoteCount` comes from Issue. The endpoints used to also carry a Prisma
 * `_count: { upvotes }` alongside it, which nothing ever read.
 */
export interface IssueListItem extends Omit<Issue, 'author'> {
    user: Pick<User, 'id' | 'name' | 'profileImageId'>;
}

export interface IssueListResponse<T> {
    issues: T[];
}

export interface TimelineListResponse<T> {
    updates: T[];
}


export interface UpvoteState {
    upvoted: boolean;
    upvoteCount: number;
}

export interface TimelineEntry {
    createdAt: Date;
    issueId: string;
    userId: string;
    message: string;
    status: string;
    userName: string;
    images: Image[];
}

export interface NearbyIssuesParams {
    lat: number;
    lng: number;
    /** Search radius in miles; converted to the meters the API expects. */
    radiusMiles: number;
    limit?: number;
    signal?: AbortSignal;
}

export function getNearbyIssues({
    lat,
    lng,
    radiusMiles,
    limit,
    signal,
}: NearbyIssuesParams): Promise<IssueListResponse<GetNearbyIssueResponse>> {
    return apiFetch('/issues/nearby', {
        query: {
            lat,
            lng,
            radius: radiusMiles * METERS_PER_MILE,
            limit,
        },
        signal,
    });
}

export function getIssuesByUser(
    userId: string,
    options: { limit?: number; signal?: AbortSignal } = {},
): Promise<IssueListResponse<IssueListItem>> {
    return apiFetch('/issues/user', {
        query: { id: userId, limit: options.limit },
        signal: options.signal,
    });
}

export function getIssuesUpvotedByUser(
    userId: string,
    options: { limit?: number; signal?: AbortSignal } = {},
): Promise<IssueListResponse<IssueListItem>> {
    return apiFetch('/issues/userUpvotes', {
        query: { id: userId, limit: options.limit },
        signal: options.signal,
    });
}

export function createIssue(issue: Omit<CreateIssueDTO, 'status'>): Promise<Issue> {
    return apiFetch('/issues/', { method: 'POST', body: issue, auth: true });
}

export function getUpvoteState(issueId: string, signal?: AbortSignal): Promise<UpvoteState> {
    return apiFetch(`/issues/${encodeURIComponent(issueId)}/upvote`, { auth: true, signal });
}

export function getIssueById(issueId: string, signal?: AbortSignal): Promise<Issue> {
    return apiFetch(`/issues/${encodeURIComponent(issueId)}/`, { auth: true, signal });
}

export function addUpvote(issueId: string): Promise<UpvoteState> {
    return apiFetch(`/issues/${encodeURIComponent(issueId)}/upvote`, {
        method: 'POST',
        auth: true,
    });
}

export function removeUpvote(issueId: string): Promise<UpvoteState> {
    return apiFetch(`/issues/${encodeURIComponent(issueId)}/upvote`, {
        method: 'DELETE',
        auth: true,
    });
}

export function addTimelineEntry(issueId: string, timelineEntry: PostUpdateDTO): Promise<TimelineEntry> {

    return apiFetch(`/issues/${encodeURIComponent(issueId)}/update`, {
        method: 'POST',
        body: timelineEntry,
        auth: true,
    });
}

export function getTimelineEntries(
    issueId: string,
    options: { limit?: number; signal?: AbortSignal } = {},
): Promise<TimelineListResponse<TimelineEntry[]>> {
    return apiFetch(`/issues/${encodeURIComponent(issueId)}/updates`, {
        method: 'GET',
        auth: true
    });
}

export function claimIssue(issueId: string): Promise<Issue> {
    return apiFetch(`/issues/${encodeURIComponent(issueId)}/claim`, {
        method: 'POST', auth: true
    });
}

export function updateIssue(issueId: string, update: PostUpdateDTO): Promise<TimelineEntry> {
    return apiFetch(`/issues/${encodeURIComponent(issueId)}/update`, { method: 'POST', body: update, auth: true });
}

export function releaseIssue(issueId: string): Promise<Issue> {
    return apiFetch(`/issues/${encodeURIComponent(issueId)}/release`, {
        method: 'POST', auth: true
    });
}
