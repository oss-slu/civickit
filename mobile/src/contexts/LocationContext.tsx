// mobile/src/types/LocationContext.tsx
import { Children, createContext, useContext, useEffect, useState } from "react";
import { userLocation } from "../types/userLocation";
import { Alert } from "react-native";
import * as Location from 'expo-location'
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

// Set in .env.local to test against the seeded St. Louis data from
// anywhere, instead of wherever the device's real GPS says you are.
const DEV_LAT = process.env.EXPO_PUBLIC_DEV_LAT ? parseFloat(process.env.EXPO_PUBLIC_DEV_LAT) : undefined
const DEV_LNG = process.env.EXPO_PUBLIC_DEV_LNG ? parseFloat(process.env.EXPO_PUBLIC_DEV_LNG) : undefined

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

    const handleLocationError = (err: unknown) => {
        console.error('Failed to get location:', err)
        checkForErrors(null, locationServicesEnabled)
    }

    //get user location
    useEffect(() => {
        if (DEV_LAT !== undefined && DEV_LNG !== undefined) {
            setLocation({ latitude: DEV_LAT, longitude: DEV_LNG })
            setLocationServicesEnabled(true)
            checkForErrors({ latitude: DEV_LAT, longitude: DEV_LNG }, true)
            setIsLoading(false)
            return
        }
        checkIfLocationEnabled();
        getCurrentLocation()
            .catch(handleLocationError)
            .then(() => setIsLoading(false))
    }, [])

    const refetch = () => {
        if (DEV_LAT !== undefined && DEV_LNG !== undefined) return
        setIsLoading(true)
        checkIfLocationEnabled();
        getCurrentLocation()
            .catch(handleLocationError)
            .finally(() => setIsLoading(false))
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
            // Without permission, getCurrentPositionAsync() below rejects on iOS --
            // stop here instead of calling it.
            return
        }

        //get lat and long
        const { coords } = await Location.getCurrentPositionAsync()
        // console.log(coords)

        if (coords) {
            const { latitude, longitude } = coords;
            setLocation({ latitude: latitude, longitude: longitude })
            // setLocation({ latitude: 34.7465, longitude: -92.2896 })
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