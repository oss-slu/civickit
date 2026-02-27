// mobile/src/screens/IssueDetailScreen.tsx
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native';

//pass issue selected state in so it can be disabled
export default function IssueDetailScreen({ route }: any) {


  return (
    <View style={styles.container}>
      <Text style={styles.title}>{route.issue.title}</Text>
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