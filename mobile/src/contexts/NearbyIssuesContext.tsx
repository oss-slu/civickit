// mobile/src/contexts/NearbyIssuesContext.tsx
import { QueryObserverResult, RefetchOptions, keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useState } from "react";
import { useLocation } from "./LocationContext";
import { issuesApi, queryKeys } from "../api";

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
        queryKey: queryKeys.issues.nearby({
            lat: location.latitude,
            lng: location.longitude,
            radiusMiles: radius,
        }),
        queryFn: ({ signal }) =>
            issuesApi.getNearbyIssues({
                lat: location.latitude,
                lng: location.longitude,
                radiusMiles: radius,
                signal,
            }),
        // Consumers read `data.issues` directly; keep the last result on screen
        // while a new location or radius loads instead of dropping to undefined.
        placeholderData: keepPreviousData,
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
