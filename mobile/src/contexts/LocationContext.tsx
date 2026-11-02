// mobile/src/types/LocationContext.tsx
import { Children, createContext, useContext, useEffect, useState } from "react";
import { userLocation } from "../types/userLocation";
import { Alert } from "react-native";
import * as Location from 'expo-location'
import { getDevLocationOverride } from "../config/devLocation";
import LoadingScreen from "../screens/Misc/LoadingScreen";
import { MessageView } from "../components/MessageView";

interface LocationContextType {
    location: userLocation;
    refetch: () => void;
    isLoading: boolean;
    error: Error | null;
    inBounds: boolean,
    setInBounds: (inBounds: boolean) => void
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export const LocationProvider = ({ children }: any) => {
    const [location, setLocation] = useState<userLocation>()
    const [locationServicesEnabled, setLocationServicesEnabled] = useState(false)
    const permissionErrorMessage = "Location Permission Denied"
    const generalErrorMessage = "Error getting location"
    const [error, setError] = useState<Error | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [inBounds, setInBounds] = useState(false)

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

        //a dev override stands in for the device entirely, so a developer
        //outside the service area still gets a populated feed. Null in release
        //builds and whenever the env vars are unset.
        const override = getDevLocationOverride()
        if (override) {
            setLocation(override)
            checkForErrors(override, true)
            return
        }

        //get lat and long
        const { coords } = await Location.getCurrentPositionAsync()

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
        <LocationContext.Provider value={{ location, refetch, error, isLoading, inBounds, setInBounds }}>
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