// mobile/src/contexts/NearbyIssuesContext.tsx
import { QueryObserverResult, RefetchOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useState } from "react";
import { useLocation } from "./LocationContext";
import { userLocation } from "../types/userLocation";
import { api } from '../services/apiClient';
import LoadingScreen from "../screens/Misc/LoadingScreen";
import { View, Text } from "react-native";

interface NearbyIssuesContextType {
    data: any;
    isLoading: boolean;
    isFetching: boolean;
    error: Error | null;
    refetch?: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<any, Error>>;
}

const NearbyIssuesContext = createContext<NearbyIssuesContextType | undefined>(undefined);

export const NearbyIssuesProvider = ({ children }: any) => {

    const queryClient = useQueryClient()
    const location = useLocation().location
    const [radius, setRadius] = useState<number>(5)

    //fetch issues from database 
    const { data, isLoading, isFetching, error, refetch } = useQuery({
        queryKey: ['issues', 'nearby'],
        queryFn: () => api('/issues/nearby', {
            params: {
                lat: location.latitude,
                lng: location.longitude,
                radius: radius * 1609.34 //miles -> meters
            }
        })
    }, queryClient);

    return (
        <NearbyIssuesContext.Provider value={{ data, isLoading, isFetching, error, refetch }}>
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