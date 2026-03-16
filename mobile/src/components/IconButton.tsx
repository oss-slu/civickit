//mobile/src/components/IconButton.tsx
import { globalStyles } from '../styles';
import { TouchableOpacity } from 'react-native';

export default function NewIssueButton({ onPress, style, isDisabled = false, children }: any) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            style={[isDisabled ? globalStyles.disabledbutton : globalStyles.button, style]}
        >
            {children}
        </TouchableOpacity>
    )

}
