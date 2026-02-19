// mobile/src/screens/IssueListScreen.tsx
import { View, Text, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useContext } from 'react';
import { FlatList } from 'react-native';
import React from 'react';
import IssueDetailScreen from './IssueDetailScreen';
import IssueCard from '../components/IssueCard';
import { MessageScreen } from '../components/MessageScreen';
import { userLocation } from '../types/userLocation';
import { LocationContext } from '../types/LocationContext';
import ENV from '../config/env';

export default function IssueListScreen() {
  const [refreshing, setRefreshing] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState()
  const [isIssueSelected, setIsIssueSelected] = useState(false)

  //get contexts from above layer(s)
  const queryClient = useQueryClient()
  const location = useContext(LocationContext) as unknown as userLocation

  //fetch issues from database 
  var { data, isLoading, error, refetch } = useQuery({
    queryKey: ['issues', 'nearby'],
    queryFn: async () => {
      console.log("url: ", ENV.apiUrl)
      const response = await fetch(
        ENV.apiUrl + '/issues/nearby?lat=' +
        location.latitude + '&lng=' + location.longitude + '&radius=5000'
      );
      console.log("fetch", response)
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    }
  }, queryClient);

  console.log(data, isLoading, error)

  //onIssuePress behaviour
  const onIssuePress = (issue: any) => {
    setSelectedIssue(issue)
    setIsIssueSelected(true)
  }

  //TODO: reformat
  //check if still loading
  if (isLoading) {
    return (
      <MessageScreen>Loading...</MessageScreen>
    )
  }

  //check if error has been thrown
  if (error != undefined) {
    return (
      <MessageScreen enableRefresh={true}
        onRefresh={refetch}
        refreshing={refreshing}>
        {String(error)}
      </MessageScreen>
    )
  }

  //check if any data was returned
  if (data.issues.length == 0) {
    return (
      <MessageScreen enableRefresh={true}
        onRefresh={refetch}
        refreshing={refreshing}>
        No issues nearby
      </MessageScreen>
    )
  }

  //check if issue selected
  if (isIssueSelected) {
    return (
      <IssueDetailScreen issue={selectedIssue}
        isIssueSelected={isIssueSelected}
        setIsIssueSelected={setIsIssueSelected}></IssueDetailScreen>
    )
  }

  //display list
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Issues</Text>
      <FlatList
        style={styles.list}
        data={data.issues}
        renderItem={({ item }) => <IssueCard issue={item}
          onPress={() => onIssuePress(item)}
          variant='expanded' />}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing}
          onRefresh={refetch} />}
        extraData={selectedIssue}
      />
    </View>
  );



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

