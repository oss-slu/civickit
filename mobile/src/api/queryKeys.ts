// mobile/src/api/queryKeys.ts

/**
 * Every React Query key in the app is built here so that cache entries can be
 * invalidated by prefix (e.g. `['issues']` clears every issue list) and so two
 * screens fetching the same data actually share a cache entry.
 */
export const queryKeys = {
    currentUser: (token: string | null) => ['user', token] as const,

    issues: {
        all: ['issues'] as const,
        nearby: (params: { lat: number; lng: number; radiusMiles: number }) =>
            ['issues', 'nearby', params] as const,
        byUser: (userId: string | undefined) => ['issues', 'user', userId] as const,
    },

    upvotes: {
        all: ['upvotes'] as const,
        byUser: (userId: string | undefined) => ['upvotes', 'user', userId] as const,
        forIssue: (issueId: string) => ['upvotes', 'issue', issueId] as const,
    },
} as const;
