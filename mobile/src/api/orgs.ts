// mobile/src/api/orgs.ts
import type { CreateIssueDTO, GetNearbyIssueResponse, Issue, IssueCategory, OrgRole, OrgStatus, OrgTier, OrgType, PostUpdateDTO, User } from '@civickit/shared';
import { apiFetch } from './client';
import { Org } from '@civickit/shared/src/types/org';

export interface Membership {
    userId: string;
    organizationId: string;
    role: OrgRole
}


export function getMembershipByUserId(
    userId: string,
    options: { limit?: number; signal?: AbortSignal } = {},
): Promise<Membership> {
    return apiFetch(`/organizations/${encodeURIComponent(userId)}/getMembershipByUserId`, {
        method: 'GET',
        auth: true
    });
}

export function getOrgByUserId(
    userId: string,
    options: { limit?: number; signal?: AbortSignal } = {},
): Promise<Org> {
    return apiFetch(`/organizations/${encodeURIComponent(userId)}/getOrgByUserId`, {
        method: 'GET',
        auth: true
    });
}

export function getAllActiveOrgs(
    options: { limit?: number; signal?: AbortSignal } = {},
): Promise<Org[]> {
    return apiFetch(`/organizations/active`, {
        method: 'GET',
        auth: true
    });
}
