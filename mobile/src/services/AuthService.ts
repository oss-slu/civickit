//mobile/src/services/AuthService.ts
import * as SecureStore from 'expo-secure-store';
import ENV from '../config/env';

//reusable ket used to store/retrieve JWR token from secure storage
export const AUTH_TOKEN_KEY = 'AUTH_TOKEN';

//represents a logged in user
export interface AuthUser {
    id: string;
    name: string;
    email: string;
}
//represents what the backend returns after login/register
export interface AuthResponse {
    token: string;
    user: AuthUser;
}

// Token Storage 
export const saveToken = async (token: string): Promise<void> => {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
};

export const deleteToken = async (): Promise<void> => {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
};

// API Calls
export const registerUser = async (
    name: string,
    email: string,
    password: string
): Promise<AuthResponse> => {
    const response = await fetch(`${ENV.apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });
    const json = await response.json();

    if (!response.ok) {
        // Surface the server's error message (e.g. "Email already in use")
        throw new Error(json?.message ?? 'Registration failed. Please try again.');
    }

    return json as AuthResponse;
};

export const loginUser = async (
    email: string,
    password: string
): Promise<AuthResponse> => {
    const response = await fetch(`${ENV.apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const json = await response.json();
    console.log('Login response:', JSON.stringify(json));

    if (!response.ok) {
        throw new Error(json?.message ?? 'Login failed. Check your credentials.');
    }

    return json as AuthResponse;
};