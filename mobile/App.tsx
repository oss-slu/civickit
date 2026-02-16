// mobile/App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import IssueListScreen, { MessageScreen } from './src/screens/IssueListScreen';
import { QueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location'
import { Alert } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  const queryClient = new QueryClient() //may need to move to App.tsx
  const [userLatitude, setUserLatitude] = useState<number>()
  const [userLongitude, setUserLogitude] = useState<number>()
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(false)
  
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
    if(!enabled) {
      Alert.alert('Location not enabled', 
        'Please enabled your Location', [
        {text: 'Cancel'},
        {text: 'OK'}
      ])
    } else {
      setLocationServicesEnabled(enabled)
    }
  }

  const getCurrentLocation = async () => {
    //check permission
    let {status} = await Location.requestForegroundPermissionsAsync()
    if(status !== 'granted'){
      Alert.alert('Permission denied', 
        'Grant permission to use location services',[
          {text: 'Cancel'},
          {text: 'OK'}
        ])
      setLocationServicesEnabled(false)
    } 

    //get lat and long
    const {coords} = await Location.getCurrentPositionAsync()
    // console.log(coords)

    if(coords){
      const {latitude, longitude} = coords;
      setUserLatitude(latitude)
      setUserLogitude(longitude)
    }
  }
  
  if(locationServicesEnabled){
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Issues" 
            component={() => IssueListScreen(queryClient,
                userLatitude, userLongitude
            )} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  } else {
    return (
      <MessageScreen enableRefresh = {true}
        onRefresh = {onRefresh}>
          Location permission denied
      </MessageScreen>
    )
  }

  
}