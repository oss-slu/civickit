// mobile/src/api/issues.ts
import type { PushToken } from '@civickit/shared';
import { apiFetch } from './client';


export interface PushTokenRequest {
    token: string;
    platform: string;
}

export function registerPushToken(data: PushTokenRequest): Promise<PushToken> {
    return apiFetch('/push-tokens/', { method: 'POST', body: data, auth: true });
}

export function removePushToken(token: string): Promise<PushToken[]> {
    console.log("api")
    console.log(token)
    return apiFetch(`/push-tokens/${encodeURIComponent(token)}`, {
        method: 'DELETE',
        auth: true,
    });
}