import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native';

//pass issue selected state in so it can be disabled
export default function IssueDetailScreen({issue, 
                                isIssueSelected, setIsIssueSelected}:any) {
    const onBackPress = () => {
        setIsIssueSelected(false)
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{issue.title}</Text>
            <Button onPress={onBackPress} 
                    title = "Back"></Button>
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