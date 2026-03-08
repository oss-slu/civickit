// mobile/src/screens/IssueDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { StaticScreenProps, useRoute, RouteProp } from '@react-navigation/native';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, FlatList, Image, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { Issue } from '../components/IssueCard';
import { formatDistanceToNow } from 'date-fns';

type IssueDetailRouteProp = RouteProp<{ IssueDetail: { issueId: string } }>;
type Props = StaticScreenProps<{ issue: Issue; }>;

const IssueDetailScreen = () => {
  const route = useRoute<IssueDetailRouteProp>();
  const { issueId } = route.params;
  const [issue, setIssue] = useState<Issue | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/issues/${issueId}`)
      .then(res => res.json())
      .then(data => setIssue(data));
  }, [issueId]);

  if (!issue) return <ActivityIndicator />;

  return (
    <ScrollView>
      <FlatList
        horizontal
        data={issue.images}
        renderItem={({ item }) => <Image source={{ uri: item }} style={{ width: 300, height: 200 }} />}
      />
      <Text style={styles.title}>{issue.title}</Text>
      {/* <Badge color={categoryColors[issue.category]}>{issue.category}</Badge> */}
      <Text>{issue.description}</Text>
      <MapView
        style={{ height: 200 }}
        initialRegion={{
          latitude: issue.latitude,
          longitude: issue.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker coordinate={{ latitude: issue.latitude, longitude: issue.longitude }} />
      </MapView>
      <Text>Reported {formatDistanceToNow(new Date(issue.createdAt))} ago</Text>
      {/* <Button onPress={handleUpvote}>↑ {issue.upvoteCount}</Button> */}
    </ScrollView>
  );
};

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
});

// type Props = StaticScreenProps<{
//   issue: Issue;
// }>;

// export default function IssueDetailScreen({ route }: Props) {
//   const issue = route.params.issue

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>{issue.title}</Text>
//     </View>
//   );
// }