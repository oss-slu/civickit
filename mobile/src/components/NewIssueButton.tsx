//mobile/src/components/NewIssueButton.tsx
import { Button } from '@react-navigation/elements';
import { globalStyles } from '../styles';
import IssueCreationScreen from '../screens/IssueCreationScreen';
import { TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParams } from '../types/StackParams';

export default function NewIssueButton() {
    const navigation = useNavigation<StackNavigationProp<StackParams>>();

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate("Create Issue", {})}
        >
            <Text style={globalStyles.button}>
                Report New Issue
            </Text>
        </TouchableOpacity>
    )

}
