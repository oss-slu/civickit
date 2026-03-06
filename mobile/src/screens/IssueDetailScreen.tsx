// mobile/src/screens/IssueDetailScreen.tsx
import { StaticScreenProps } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';
import { Issue } from '../components/IssueCard';
import { MessageView } from '../components/MessageView';

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