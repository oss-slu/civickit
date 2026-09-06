//mobile/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, saveToken, deleteToken } from '../services/tokenStorage';
import { User } from '@civickit/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, queryKeys, setUnauthorizedHandler, orgsApi, pushApi } from '../api';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

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
    const [expoPushToken, setExpoPushToken] = useState('');

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

    //On mount, gets push notif token
    useEffect(() => {
        registerForPushNotificationsAsync()
            .then(token => {
                setExpoPushToken(token ?? '')
            })
            .catch((error: any) => setExpoPushToken(`${error}`));
    })

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
        await pushApi.removePushToken(expoPushToken)
        await deleteToken();
        setAuthToken(null);
        setUser(null)
        setRole(null)
        setIsLoggedIn(false);
        setExpoPushToken('')
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

        //register push token
        await pushApi.registerPushToken({
            token: expoPushToken,
            platform: Platform.OS
        })

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

function handleTokenRegistrationError(errorMessage: string) {
    alert(errorMessage);
    throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        handleTokenRegistrationError('Permission not granted to get push token for push notification!');
        return;
    }
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
        handleTokenRegistrationError('Project ID not found');
    }
    try {
        const pushTokenString = (
            await Notifications.getExpoPushTokenAsync({
                projectId,
            })
        ).data;
        // console.log(pushTokenString);
        return pushTokenString;
    } catch (e: unknown) {
        handleTokenRegistrationError(`${e}`);
    }
}
