// mobile/src/screens/IssueListWrapper.tsx
import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location'
import { Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { MessageView } from '../components/MessageView';
import { userLocation } from '../types/userLocation';
import { LocationContext } from '../types/LocationContext';
import MapViewScreen from './MapViewScreen';
import LoadingScreen from './LoadingScreen';
import HomeScreen from './HomeScreen';

export default function HomeScreenWrapper() {
    const [location, setLocation] = useState<userLocation>()
    const [locationServicesEnabled, setLocationServicesEnabled] = useState(false)
    const queryClient = useQueryClient();

    //get user location
    useEffect(() => {
        checkIfLocationEnabled();
        getCurrentLocation();
    }, [])

    //try to get location again upon refresh
    const onRefresh = () => {
        checkIfLocationEnabled();
        getCurrentLocation();
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
        }

        //get lat and long
        const { coords } = await Location.getCurrentPositionAsync()
        // console.log(coords)

        if (coords) {
            const { latitude, longitude } = coords;
            setLocation({ latitude: latitude, longitude: longitude })
        }
    }

    if (locationServicesEnabled
        && location?.latitude != undefined
        && location?.longitude != undefined) {
        if (queryClient != null) {
            return (
                <IssueListContextWrapper queryClient={queryClient} location={location}>
                    <HomeScreen />
                </IssueListContextWrapper>
            );
        } else {
            return (
                <MessageView enableRefresh={true}
                    onRefresh={onRefresh}>
                    Error: query client not found
                </MessageView>
            )
        }
    } else if (!locationServicesEnabled) {
        return (
            <MessageView enableRefresh={true}
                onRefresh={onRefresh}>
                Location permission denied
            </MessageView>
        )
    } else {
        return (
            <LoadingScreen />
        )
    }

}

//Check for future use
function IssueListContextWrapper({ location, children }: any) {
    return (
        <LocationContext.Provider value={location}>
            {children}
        </LocationContext.Provider>
    )
}
