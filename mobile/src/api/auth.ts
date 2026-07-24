// mobile/src/api/auth.ts
import type { LoginResponse, User } from '@civickit/shared';
import { apiFetch } from './client';

export function login(email: string, password: string): Promise<LoginResponse> {
    return apiFetch('/auth/login', { method: 'POST', body: { email, password } });
}

export function register(name: string, email: string, password: string): Promise<LoginResponse> {
    return apiFetch('/auth/register', { method: 'POST', body: { name, email, password } });
}

/**
 * `token` is passed explicitly by AuthProvider, which holds the token in state
 * before the rest of the app is allowed to render.
 */
export function getCurrentUser(token?: string | null, signal?: AbortSignal): Promise<User> {
    return apiFetch('/auth/user', { auth: true, token, signal });
}
