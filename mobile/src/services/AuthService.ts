//mobile/src/services/AuthService.ts
import { User } from '@civickit/shared';
import { api, ApiError } from './apiClient';

// Token Storage (re-exported so existing imports keep working)
export { AUTH_TOKEN_KEY, saveToken, getToken, deleteToken } from './tokenStorage';

//represents a logged in user
export interface AuthUser {
    id: string;
    name: string;
    email: string;
}
//represents what the backend returns after login/register
export interface AuthResponse {
    token: string;
    user: User;
}

// API Calls
export const registerUser = async (
    name: string,
    email: string,
    password: string
): Promise<AuthResponse> => {
    try {
        return await api<AuthResponse>('/auth/register', {
            method: 'POST',
            body: { name, email, password },
            token: null,
        });
    } catch (error) {
        if (error instanceof ApiError && error.body?.message == undefined) {
            throw new Error('Registration failed. Please try again.');
        }
        throw error;
    }
};

export const loginUser = async (
    email: string,
    password: string
): Promise<AuthResponse> => {
    try {
        return await api<AuthResponse>('/auth/login', {
            method: 'POST',
            body: { email, password },
            token: null,
        });
    } catch (error) {
        if (error instanceof ApiError && error.body?.message == undefined) {
            throw new Error('Login failed. Check your credentials.');
        }
        throw error;
    }
};
