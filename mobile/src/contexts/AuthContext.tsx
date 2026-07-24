//mobile/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, saveToken, deleteToken } from '../services/AuthService';
import { User } from '@civickit/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ENV from "../config/env";

interface AuthContextType {
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: User) => void;
    authToken: string | null;
    user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const queryClient = useQueryClient()

    // On mount, check for token to determine if user is logged in
    useEffect(() => {
        (async () => {
            const token = await getToken();
            setAuthToken(token);
            if (token == null) {
                setIsLoading(false); //no stored token: skip user fetch, go to login
            }
        })();
    }, []); //no dependencies bc it runs once on mount to check for token


    const { data, error, refetch } = useQuery({
        queryKey: ['user', authToken],
        enabled: !!authToken,
        queryFn: async () => {
            const response = await fetch(
                ENV.apiUrl + '/auth/user',
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            if (!response.ok) {
                if (response.status == 401 || response.status == 404) {
                    throw new Error('Invalid Token');
                } else {
                    throw new Error("Failed to Fetch")
                }
            }
            return response.json()
        },
    }, queryClient);

    //login store token + update state
    const login = async (token: string) => {
        await saveToken(token);
        setAuthToken(token);
        setIsLoggedIn(true);
    };
    //logout deletes token + updates state
    const logout = async () => {
        await deleteToken();
        setAuthToken(null);
        setUser(null)
        setIsLoggedIn(false);
    };

    if (error != null && isLoading == true) {
        logout()

        console.log(error)
        setIsLoading(false)
    }

    if (data != null && isLoading == true) {
        setUser(data)
        setIsLoggedIn(true)
        setIsLoading(false)

    }



    return (
        <AuthContext.Provider value={{ isLoggedIn, isLoading, authToken, login, logout, setUser, user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};