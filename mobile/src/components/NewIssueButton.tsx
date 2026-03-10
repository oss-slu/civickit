//mobile/src/components/NewIssueButton.tsx
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParams } from '../types/StackParams';
import Button from './Button';
import { palette } from '../styles';

export default function NewIssueButton({ isDisabled = false }) {
    const navigation = useNavigation<StackNavigationProp<StackParams>>();

    return (
        <Button
            text="Report New Issue"
            onPress={() => navigation.navigate("Create Issue", {})}
            disabled={isDisabled}
            style={{ backgroundColor: palette.ckRed }}
        >
        </Button>
    )

}
