import { View, Text, StyleSheet, RefreshControl, TouchableOpacity, Alert, ScrollView, useWindowDimensions } from 'react-native';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { FlatList } from 'react-native';
import React from 'react';
import IssueDetailScreen from './IssueDetailScreen';
import * as Location from 'expo-location'
import IssueCard from '../components/IssueCard';

export default function IssueListScreen() {
  const [refreshing, setRefreshing] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState()
  const [isIssueSelected, setIsIssueSelected] = useState(false)
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(false)
  const [userLatitude, setUserLatitude] = useState<number>()
  const [userLongitude, setUserLogitude] = useState<number>()

  if (navigator.onLine) {
    console.log('Internet connection is available');
  } else {
    console.log('Internet connection is not available');
  }
  
  //get user location
  useEffect(() => {
    checkIfLocationEnabled();
    getCurrentLocation();
  }, [])
  
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
    console.log(coords)

    if(coords){
      const {latitude, longitude} = coords;
      setUserLatitude(latitude)
      setUserLogitude(longitude)
    }
  }
  
  //fetch issues from database 
    //runs even when location is denied to prevent hook errors
  const queryClient = new QueryClient()
  const { data, isLoading, error, refetch } = useQuery({
      queryKey: ['issues', 'nearby'],
      queryFn: async () => {
          console.log("before fetch", userLatitude, userLongitude)
          const response = await fetch(
          'https://application-mock-server.loca.lt/api/issues/nearby?lat=' + 
            userLatitude + '&lng=' + userLongitude + '&radius=5000'
          );
          console.log("fetch", response)
          if (!response.ok) throw new Error('Failed to fetch');
          return response.json();
      } 
  }, queryClient);

  console.log(data, isLoading, error)
  //return error message for location permission denied
  if(!locationServicesEnabled){
    return (
      <MessageScreen enableRefresh = {true}
        onRefresh = {refetch}
        refreshing = {refreshing}>
          Location permission denied
      </MessageScreen>
    )
  }

  //onIssuePress behaviour
  const onIssuePress = (issue:any) => {
    setSelectedIssue(issue)
    setIsIssueSelected(true)
  }

  //check if still loading
  if(!isLoading){
    //check if an error had been thrown
    if(error == undefined){
      //check if any data was returned
      if(data.issues.length != 0){

        if(isIssueSelected){
          return (
            <IssueDetailScreen issue = {selectedIssue}
                isIssueSelected = {isIssueSelected}
                setIsIssueSelected = {setIsIssueSelected}></IssueDetailScreen>
          )
        } else {
          return (
            <View style={styles.container}>
              <Text style={styles.title}>Nearby Issues</Text>
              <FlatList
                style = {styles.list}
                data = {data.issues}
                renderItem = {({item}) => <IssueCard issue = {item}
                                            onPress={() => onIssuePress(item)}
                                            variant='expanded'/>}
                keyExtractor = {(item) => item.id}
                refreshControl= {<RefreshControl refreshing={refreshing} 
                                                  onRefresh={refetch} />}
                extraData={selectedIssue}
              />
            </View>
          );
        }
        
      } else {
        return (
          <MessageScreen enableRefresh = {true}
            onRefresh = {refetch}
            refreshing = {refreshing}>
              No issues nearby
          </MessageScreen>
        )
      }
    }  else {
        return (
        <MessageScreen enableRefresh = {true}
          onRefresh = {refetch}
          refreshing = {refreshing}>
            {String(error)}
        </MessageScreen>
      )
    }   
  } else {
    return (
      <MessageScreen>Loading...</MessageScreen>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  issueTitle: {
    fontSize: 20
  },
  issueInfo: {
    fontSize: 15
  },
  list: {
    width: '80%',
    alignSelf: 'center'
  }
});

export function MessageScreen({enableRefresh, onRefresh, refreshing = false, children}:any) {
  if (enableRefresh && onRefresh != null ){
    return (
      <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
          <Text style={styles.title}>{children}</Text>
      </ScrollView>
    )
  } else {
    console.log("Refresh was disabled or proper function was not provided")
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{children}</Text>
      </View>
    )
  }
}