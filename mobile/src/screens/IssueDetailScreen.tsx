// mobile/src/screens/IssueDetailScreen.tsx
import { StaticScreenProps } from '@react-navigation/native';
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