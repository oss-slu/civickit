import { View, Text, StyleSheet } from 'react-native';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FlatList } from 'react-native';

export default function IssueListScreen() {

  const queryClient = new QueryClient()

  const { data, isLoading, error, refetch } = useQuery({
      queryKey: ['issues', 'nearby'],
      queryFn: async () => {
          const response = await fetch(
          'http://localhost:3000/api/issues/nearby?lat=38.6270&lng=-90.1994&radius=5000'
          );
          if (!response.ok) throw new Error('Failed to fetch');
          return response.json();
      } 
  }, queryClient);

  type IssueProps = {title: String};
  const Issue = ({title}: IssueProps) => (
    <View >
      <Text style={styles.issueTitle}>{title}</Text>
    </View>
  )
  
  if(!isLoading){
    console.log(data, error)
    if(error == undefined){
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Nearby Issues</Text>
          <FlatList
            data = {data.issues}
            renderItem = {({item}) => <Issue title = {item.title}/>}
            keyExtractor = {(item) => item.id}
          />
        </View>
      );
    }  else {
        return (
        <View style={styles.container}>
          <Text style={styles.title}>{String(error)}</Text>
        </View>
      )
    }    
  } else {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading</Text>
      </View>
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
  }
});