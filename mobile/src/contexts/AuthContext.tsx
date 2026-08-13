//mobile/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, saveToken, deleteToken } from '../services/tokenStorage';
import { User } from '@civickit/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, queryKeys, setUnauthorizedHandler, orgsApi } from '../api';

type Role = "REPORTER" | "ORG_MEMBER" | "ORG_ADMIN" | "ADMIN"
interface AuthContextType {
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: User) => void;
    authToken: string | null;
    user: User | null;
    role: Role | null
    organization: any
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<Role | null>(null)
    const [organization, setOrganization] = useState<any>(null)
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

    //get user role
    useEffect(() => {
        const getOrgRole = async (userId: string) => {
            const membership = await orgsApi.getMembershipByUserId(userId)
            if (!membership) {
                setRole("REPORTER")
            } else {
                setRole(membership.role)
            }
        }

        const getOrgByUserId = async (userId: any) => {
            setOrganization(await orgsApi.getOrgByUserId(userId))
        }

        if (user != null) {
            if (user.role == "REPORTER") {
                getOrgRole(user.id)
                getOrgByUserId(user.id)
            } else if (user.role == "ADMIN") {
                setRole("ADMIN")
            }


        }


    }, [user])

    //logout deletes token + updates state
    const logout = async () => {
        await deleteToken();
        setAuthToken(null);
        setUser(null)
        setRole(null)
        setIsLoggedIn(false);
        queryClient.clear();
    };

    // Any 401 from the API — including a token that expires mid-session —
    // tears down auth state instead of leaving a signed-in shell that 401s.
    useEffect(() => {
        setUnauthorizedHandler(() => { void logout(); });
        return () => setUnauthorizedHandler(null);
    }, []);

    const { data, error } = useQuery({
        queryKey: queryKeys.currentUser(authToken),
        enabled: !!authToken,
        queryFn: ({ signal }) => authApi.getCurrentUser(authToken, signal),
    }, queryClient);

    //login store token + update state
    const login = async (token: string) => {
        await saveToken(token);
        setAuthToken(token);
        setIsLoggedIn(true);
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
        <AuthContext.Provider value={{ isLoggedIn, isLoading, authToken, login, logout, setUser, user, role, organization }}>
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
