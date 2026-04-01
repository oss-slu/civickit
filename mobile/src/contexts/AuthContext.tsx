//mobile/src/contexts/AuthContext.tsx
import React, {createContext, useContext, useEffect, useState} from 'react';
import {getToken, saveToken, deleteToken} from '../services/AuthService';

interface AuthContextType {
    isLoggedIn: boolean;
    isLoading: boolean;
    authToken: string | null;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [authToken, setAuthToken] = useState<string | null>(null);

    // On mount, check for token to determine if user is logged in
    useEffect(() => {
        (async () => {
            const token = await getToken();
            setAuthToken(token);
            setIsLoggedIn(!!token);
            setIsLoading(false);
        }) ();
    }, []); //no dependencies bc it runs once on mount to check for token

    //login store token + update state
    const login = async (token:string) => {
        await saveToken(token);
        setAuthToken(token);
        setIsLoggedIn(true);
    };
    //logout deletes token + updates state
    const logout = async () => {
        await deleteToken();
        setAuthToken(null);
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, isLoading, authToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if( !context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};