import { StaticScreenProps } from "@react-navigation/native";
import { MessageView } from "../components/MessageView";
import { ErrorIcon } from "../components/Icons";
import { View, Text, StyleSheet } from "react-native";
import { colors, globalStyles, size, spacing, typography } from "../styles";
import { Logo, LogoPlusText } from "../components/Logos";

type Props = StaticScreenProps<{
    errorMessage: string;
}>;

export default function ErrorScreen({ route }: Props) {
    const errorMessage = route.params.errorMessage;

    return (
        <View style={styles.container}>
            <Text style={styles.text}>{errorMessage}</Text>
            <ErrorIcon color={colors.textPrimary}
                size={size.xxl} />
            <LogoPlusText />
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        ...globalStyles.container,
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        ...globalStyles.heading1,
        fontSize: typography.sizeXxl,
        marginBottom: spacing.md
    },
});