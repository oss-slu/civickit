// mobile/src/screens/IssueDetailScreen.tsx
import { View, Text, StyleSheet } from 'react-native';
import FlashMessage, { showMessage, hideMessage } from "react-native-flash-message";

//pass issue selected state in so it can be disabled
export default function IssueDetailScreen({ route }: any) {
  const issue = route.params.issue

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{issue.title}</Text>
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
});