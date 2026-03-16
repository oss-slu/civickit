// mobile/src/screens/IssueDetailScreen.tsx
import { StaticScreenProps } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';
import { Issue } from '@civickit/shared';

let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
}

type IssueDetailRouteProp = RouteProp<
  { IssueDetails: { issue: Issue } },
  'IssueDetails'
>;

const IssueDetailScreen = () => {
  const route = useRoute<IssueDetailRouteProp>();
  const { issue } = route.params;

  return (
    <MessageView>
      {issue.title}
    </MessageView>
  );
}
