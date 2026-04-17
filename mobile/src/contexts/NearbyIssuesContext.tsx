// mobile/src/contexts/NearbyIssuesContext.ts
import { QueryObserverResult, RefetchOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useState } from "react";
import { useLocation } from "./LocationContext";
import { userLocation } from "../types/userLocation";
import ENV from '../config/env';
import LoadingScreen from "../screens/LoadingScreen";
import { View, Text } from "react-native";

interface NearbyIssuesContextType {
    data: any;
    isLoading: boolean;
    error: Error | null;
    refetch?: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<any, Error>>;
}

const NearbyIssuesContext = createContext<NearbyIssuesContextType | undefined>(undefined);

export const NearbyIssuesProvider = ({ children }: any) => {

    const queryClient = useQueryClient()
    const location = useLocation().location
    const [radius, setRadius] = useState<number>(1)

    //fetch issues from database 
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['issues', 'nearby'],
        queryFn: async () => {
            console.log("url: ", ENV.apiUrl)
            const response = await fetch(
                ENV.apiUrl + '/issues/nearby?lat=' +
                location.latitude + '&lng=' + location.longitude
                + '&radius=' + radius * 1609.34 //1 mile
            );
            // console.log("fetch", response)
            if (!response.ok) throw new Error('Failed to fetch');
            return response.json();
        }
    }, queryClient);

    return (
        <NearbyIssuesContext.Provider value={{ data, isLoading, error, refetch }}>
            {children}
        </NearbyIssuesContext.Provider>
    );

};

export const useNearbyIssues = () => {
    const context = useContext(NearbyIssuesContext);
    if (!context) {
        throw new Error('useNearbyIssues must be used within an QueryClientProvider and LocationProvider');
    }
    return context;
}