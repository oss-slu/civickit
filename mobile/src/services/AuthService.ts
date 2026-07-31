//mobile/src/services/AuthService.ts
import type { LoginResponse } from '@civickit/shared';
import * as authApi from '../api/auth';

export { AUTH_TOKEN_KEY, saveToken, getToken, deleteToken } from './tokenStorage';

//represents what the backend returns after login/register
export type AuthResponse = LoginResponse;

/**
 * Registration signs the user in server-side and returns the same payload as
 * login, so there is no need for a follow-up login request.
 */
export const registerUser = (
    name: string,
    email: string,
    password: string,
): Promise<AuthResponse> => authApi.register(name, email, password);

export const loginUser = (email: string, password: string): Promise<AuthResponse> =>
    authApi.login(email, password);
