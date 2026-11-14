// mobile/src/api/orgs.ts
import type { OrgRole } from '@civickit/shared';
import type { Org } from '@civickit/shared/src/types/org';
import { apiFetch } from './client';

export interface Membership {
    userId: string;
    organizationId: string;
    role: OrgRole
}

// Both read the caller from the token. null means a plain reporter with no org.

export function getMyMembership(
    options: { signal?: AbortSignal } = {},
): Promise<Membership | null> {
    return apiFetch('/organizations/me/membership', {
        method: 'GET',
        auth: true,
        signal: options.signal,
    });
}

export function getMyOrg(
    options: { signal?: AbortSignal } = {},
): Promise<Org | null> {
    return apiFetch('/organizations/me', {
        method: 'GET',
        auth: true,
        signal: options.signal,
    });
}
