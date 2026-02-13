import { View, Text, StyleSheet, RefreshControl, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { FlatList } from 'react-native';
import React from 'react';
import IssueDetailScreen from './IssueDetailScreen';
import * as Location from 'expo-location'
// import { getDistance } from 'geolib';

export default function IssueListScreen() {
  const [refreshing, setRefreshing] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState()
  const [isIssueSelected, setIsIssueSelected] = useState(false)
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(false)
  const [userLatitude, setUserLatitude] = useState<number>()
  const [userLongitude, setUserLogitude] = useState<number>()
  
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
          const response = await fetch(
          'http://localhost:3000/api/issues/nearby?lat=' + 
            userLatitude + '&lng=' + userLongitude + '&radius=500'
          );
          console.log("fetch", response)
          if (!response.ok) throw new Error('Failed to fetch');
          return response.json();
      } 
  }, queryClient);

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

  //Flatlist item setup
  type IssueProps = {title: String,
                      category: String,
                      latitude: number,
                      longitude: number,
                      upvoteCount: number
                    onPress: () => void};
  const Issue = ({title, category,
                  latitude, longitude,
                   upvoteCount, onPress}: IssueProps) => (
    <TouchableOpacity onPress={onPress}>
      <View>
        <Text style={styles.issueTitle}>{title}</Text>
        <Text style={styles.issueInfo}>{category}</Text>
        <Text style={styles.issueInfo}>{latitude}, {longitude}</Text>
        <Text style={styles.issueInfo}>{upvoteCount}</Text>
      </View>
    </TouchableOpacity>
  )
  
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
                data = {data.issues}
                renderItem = {({item}) => <Issue title = {item.title}
                                            category={item.category} 
                                            latitude={item.latitude}
                                            longitude={item.longitude}
                                            upvoteCount={item.upvoteCount}
                                            onPress={() => onIssuePress(item)}/>}
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
            There was an error
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
  }
});

export function MessageScreen({enableRefresh, onRefresh, refreshing = false, children}:any) {
  if (enableRefresh && onRefresh != null ){
    return (
      <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
          <Text style={styles.title}>No issues nearby</Text>
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