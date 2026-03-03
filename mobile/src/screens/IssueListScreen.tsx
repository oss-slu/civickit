// mobile/src/screens/IssueListScreen.tsx
import { View, Text, StyleSheet, RefreshControl } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useContext } from 'react';
import { FlatList } from 'react-native';
import React from 'react';
import IssueCard from '../components/IssueCard';
import { MessageView } from '../components/MessageView';
import { userLocation } from '../types/userLocation';
import { LocationContext } from '../types/LocationContext';
import { Button } from '@react-navigation/elements';
import ENV from '../config/env';
import { useNavigation } from '@react-navigation/native';
import { StackParams } from '../types/StackParams';
import { StackNavigationProp } from '@react-navigation/stack';


export default function IssueListScreen() {
  const [refreshing, setRefreshing] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState()
  const navigation = useNavigation<StackNavigationProp<StackParams>>();

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
    navigation.navigate('IssueDetails', { issue: issue })
  }

  //check if still loading
  if (isLoading) {
    return (
      <MessageView>Loading...</MessageView>
    )
  }

  if (location.latitude == undefined ||
    location.longitude == undefined) {
    return (
      <MessageView enableRefresh={true}
        onRefresh={refetch}
        refreshing={refreshing}>
        Error: Please Reload
      </MessageView>
    )
  }

  //check if error has been thrown
  if (error != undefined) {
    return (
      <MessageView enableRefresh={true}
        onRefresh={refetch}
        refreshing={refreshing}>
        {String(error)}
      </MessageView>
    )
  }

  //check if any data was returned
  if (data.issues.length == 0) {
    return (
      <View>
        <Button style={styles.button} onPress={() => navigation.navigate("CreateIssue", {})}>
          Report New Issue
        </Button>
        <MessageView enableRefresh={true}
          onRefresh={refetch}
          refreshing={refreshing}>
          No issues nearby
        </MessageView>
      </View>

    )
  }

  //display list
  return (
    <View style={styles.container}>
      <Button style={styles.button} onPress={() => navigation.navigate("CreateIssue", {})}>
        Report New Issue
      </Button>

      <Text style={styles.title}>Nearby Issues</Text>
      <FlatList
        style={styles.list}
        data={data.issues}
        renderItem={({ item }) => <IssueCard issue={item}
          onPress={() => navigation.navigate("IssueDetails", { issue: item })}
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
  },
  button: {
    margin: 12,
    alignSelf: 'flex-end'
  }
});
