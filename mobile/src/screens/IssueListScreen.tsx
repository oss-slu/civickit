import { View, Text, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { useState, useContext } from 'react';
import { FlatList } from 'react-native';
import React from 'react';
import IssueDetailScreen from './IssueDetailScreen';
import IssueCard from '../components/IssueCard';
import { QueryClientContext} from '../../App';
import { LocationContext, userLocation } from './IssueListWrapper';

export default function IssueListScreen() {
  const [refreshing, setRefreshing] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState()
  const [isIssueSelected, setIsIssueSelected] = useState(false)

  //get contexts from above layer(s)
  const queryClient = useContext(QueryClientContext) as unknown as QueryClient
  const location = useContext(LocationContext) as unknown as userLocation

  
  
  //fetch issues from database 
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['issues', 'nearby'],
    queryFn: async () => {
      // const url = "https://civickit.loca.lt"
      const url = "http://localhost:3000"
      const response = await fetch(
        url + '/api/issues/nearby?lat=' +
        location?.latitude + '&lng=' + location.longitude + '&radius=5000'
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

  //check if still loading
  if (!isLoading) {
    //check if an error had been thrown
    if (error == undefined) {
      //check if any data was returned
      if (data.issues.length != 0) {

        if (isIssueSelected) {
          return (
            <IssueDetailScreen issue={selectedIssue}
              isIssueSelected={isIssueSelected}
              setIsIssueSelected={setIsIssueSelected}></IssueDetailScreen>
          )
        } else {
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

      } else {
        return (
          <MessageScreen enableRefresh={true}
            onRefresh={refetch}
            refreshing={refreshing}>
            No issues nearby
          </MessageScreen>
        )
      }
    } else {
      return (
        <MessageScreen enableRefresh={true}
          onRefresh={refetch}
          refreshing={refreshing}>
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

export function MessageScreen({ enableRefresh, onRefresh, refreshing = false, children }: any) {
  if (enableRefresh && onRefresh != null) {
    return (
      <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
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