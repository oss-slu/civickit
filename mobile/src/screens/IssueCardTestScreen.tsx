// mobile/src/screens/IssueCardTestScreen.tsx
import React from 'react';
import { View, ScrollView } from 'react-native';
import IssueCard, { Issue } from '../components/IssueCard';

const mockIssue: Issue = {
  id: '1',
  title: 'Large pothole on Main Street',
  category: 'pothole',
  status: 'reported',
  distance: 1.2,
  upvoteCount: 3,
  images: [],
};

export default function IssueCardTestScreen() {
  return (
    <ScrollView>
      <View style={{ marginTop: 40 }}>
        <IssueCard
          issue={mockIssue}
          variant="compact"
          onPress={() => console.log('Compact pressed')}
        />

        <IssueCard
          issue={mockIssue}
          variant="expanded"
          onPress={() => console.log('Expanded pressed')}
        />
      </View>
    </ScrollView>
  );
}
