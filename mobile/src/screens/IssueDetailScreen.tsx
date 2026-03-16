// mobile/src/screens/IssueDetailScreen.tsx
import { StaticScreenProps } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';
import { Issue } from '@civickit/shared';

type Props = StaticScreenProps<{
  issue: Issue;
}>;

export default function IssueDetailScreen({ route }: Props) {
  const issue = route.params.issue

  return (
    <MessageView>
      {issue.title}
    </MessageView>
  );
}