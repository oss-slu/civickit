// mobile/src/types/LocationContext.ts
import { Children, createContext, useContext, useEffect, useState } from "react";
import { userLocation } from "../types/userLocation";
import { Alert } from "react-native";
import * as Location from 'expo-location'
import LoadingScreen from "../screens/LoadingScreen";
import ErrorScreen from "../screens/ErrorScreen";
import { MessageView } from "../components/MessageView";

interface LocationContextType {
    location: userLocation;
    refetch: () => void;
    isLoading: boolean;
    error: Error | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export const LocationProvider = ({ children }: any) => {
    const [location, setLocation] = useState<userLocation>()
    const [locationServicesEnabled, setLocationServicesEnabled] = useState(false)
    const permissionErrorMessage = "Location Permission Denied"
    const generalErrorMessage = "Error getting location"
    const [error, setError] = useState<Error | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const checkForErrors = (location: any, locationServicesEnabled: boolean) => {
        if (location != undefined) {
            setError(null)
        } else if (!locationServicesEnabled) {
            setError(new Error(permissionErrorMessage))
        } else {
            setError(new Error(generalErrorMessage))
        }
    }

    //get user location
    useEffect(() => {
        checkIfLocationEnabled();
        getCurrentLocation().then(() => setIsLoading(false))
    }, [])

    const refetch = () => {
        setIsLoading(true)
        checkIfLocationEnabled();
        getCurrentLocation()
        checkForErrors(location, locationServicesEnabled)
    }


    const checkIfLocationEnabled = async () => {
        let enabled = await Location.hasServicesEnabledAsync();
        if (!enabled) {
            Alert.alert('Location not enabled',
                'Please enabled your Location', [
                { text: 'Cancel' },
                { text: 'OK' }
            ])
        } else {
            setLocationServicesEnabled(enabled)
        }
    }

    const getCurrentLocation = async () => {
        //check permission
        let { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
            Alert.alert('Permission denied',
                'Grant permission to use location services', [
                { text: 'Cancel' },
                { text: 'OK' }
            ])
            setLocationServicesEnabled(false)
            checkForErrors(null, false)
        }

        //get lat and long
        const { coords } = await Location.getCurrentPositionAsync()
        // console.log(coords)

        if (coords) {
            const { latitude, longitude } = coords;
            setLocation({ latitude: latitude, longitude: longitude })
            checkForErrors({ latitude: latitude, longitude: longitude }, true)
        }
    }

    if (isLoading) {
        return (
            <LoadingScreen />
        )
    } else if (error != null || location == undefined) {
        return (
            <MessageView enableRefresh={true}
                onRefresh={refetch}
                refreshing={true}>
                {error != null ? error.message : generalErrorMessage}
            </MessageView>
        )
    }
    return (
        <LocationContext.Provider value={{ location, refetch, error, isLoading }}>
            {children}
        </LocationContext.Provider>
    );

}

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('Error: useLocation could not be used');
    }
    return context;
};