//mobile/src/services/tokenStorage.ts
import * as SecureStore from 'expo-secure-store';

//reusable key used to store/retrieve JWT token from secure storage
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
