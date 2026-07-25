// mobile/src/services/tokenStorage.ts
import * as SecureStore from 'expo-secure-store';

/**
 * Sole owner of the stored JWT. Kept separate from AuthService so the API
 * client can read the token without importing the API surface back into
 * itself.
 */
export const AUTH_TOKEN_KEY = 'AUTH_TOKEN';

export const saveToken = async (token: string): Promise<void> => {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
};

export const deleteToken = async (): Promise<void> => {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
};
