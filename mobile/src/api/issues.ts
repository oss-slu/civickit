// mobile/src/api/issues.ts
import type { CreateIssueDTO, GetNearbyIssueResponse, Issue, User } from '@civickit/shared';
import { apiFetch } from './client';

export const METERS_PER_MILE = 1609.34;

/**
 * Shape actually returned by the issue *list* endpoints. This is deliberately
 * not `Issue` from @civickit/shared: the backend includes the Prisma relation
 * as `user` (not `author`) and adds a `_count`. Reconciling the two is a
 * separate change — this type documents reality in the meantime.
 */
export interface IssueListItem extends Omit<Issue, 'author'> {
    user: Pick<User, 'id' | 'name' | 'profileImage'>;
    _count: { upvotes: number };
}

export interface IssueListResponse<T> {
    issues: T[];
}

export interface UpvoteState {
    upvoted: boolean;
    upvoteCount: number;
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
