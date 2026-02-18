// mobile/App.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IssueListScreen from './IssueListScreen';
import { useEffect, useState, useContext } from 'react';
import * as Location from 'expo-location'
import { Alert } from 'react-native';
import { QueryClient } from '@tanstack/react-query';
import { MessageScreen } from '../components/MessageScreen';
import { userLocation } from '../types/userLocation';
import { UseQueryClientContext } from '../types/UseQueryClientContext';
import { LocationContext } from '../types/LocationContext';

const Stack = createNativeStackNavigator();

export default function IssueListWrapper() {
    const [location, setLocation] = useState<userLocation>()
    const [locationServicesEnabled, setLocationServicesEnabled] = useState(false)
    const queryClient = useContext(UseQueryClientContext) as unknown as QueryClient

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

    if (locationServicesEnabled) {
        if (queryClient != null) {
            return (
                <IssueListContextWrapper queryClient={queryClient} location={location}>
                    <IssueListScreen />
                </IssueListContextWrapper>
            );
        } else {
            return (
                <MessageScreen enableRefresh={true}
                    onRefresh={onRefresh}>
                    Error: query client not found
                </MessageScreen>
            )
        }
    } else {
        return (
            <MessageScreen enableRefresh={true}
                onRefresh={onRefresh}>
                Location permission denied
            </MessageScreen>
        )
    }

}

function IssueListContextWrapper({ queryClient, location, children }: any) {
    return (
        <UseQueryClientContext value={queryClient}>
            <LocationContext value={location}>
                {children}
            </LocationContext>
        </UseQueryClientContext>
    )
}