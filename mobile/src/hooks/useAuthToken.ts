//mobile/src/hooks/useAuthToken.ts
import { useEffect, useState } from 'react';
import { getToken } from '../services/AuthService';

/**
 * Checks SecureStore on mount and returns whether a token exists.
 * Use this in your root navigator to decide whether to show auth screens
 * or send the user straight to IssueList.
 *
 * Usage in AppNavigator / App.tsx:
 *
 *   const { isLoggedIn, isLoading } = useAuthToken();
 *
 *   if (isLoading) return <SplashScreen />;
 *
 *   return isLoggedIn
 *     ? <MainStack />   // IssueList etc.
 *     : <AuthStack />;  // Login / Register
 */


export function useAuthToken() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        (async () => {
            const token = await getToken();
            setIsLoggedIn(!!token);
            setIsLoading(false);
        })();
    }, [refresh]);
    /*useEffect(() => {
        (async () => {
            try {
                const token = await getToken();
                setIsLoggedIn(!!token);
            } catch {
                setIsLoggedIn(false);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);*/

    return { isLoggedIn, isLoading, refreshAuth: () => setRefresh(r => r + 1) };
}