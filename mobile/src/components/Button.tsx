//mobile/src/components/Button.tsx
import { globalStyles } from '../styles';
import { TouchableOpacity, Text } from 'react-native';

export default function Button({ text, onPress, style, isDisabled = false }: any) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
        >
            <Text style={[isDisabled ? globalStyles.disabledbutton : globalStyles.button, style]}>
                {text}
            </Text>
        </TouchableOpacity>
    )

}
