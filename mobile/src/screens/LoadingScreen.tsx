//mobile/src/screens/LoadingScreen.tsx
import { View, StyleSheet, Text } from "react-native";
import { colors, globalStyles, spacing, typography } from "../styles";
import { LoopingLogoGif } from "../components/Logos";
import React from "react";
export default function LoadingScreen() {

    return (
        <View style={styles.container}>
            <LoopingLogoGif style={{ width: 300, height: 300 }} />
            <Text style={styles.text}>"Aut viam inveniam aut faciam"</Text>
            <Text style={{ ...styles.text, fontSize: typography.sizeMd }}>"I will either find a way or make one"</Text>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        ...globalStyles.container,
        justifyContent: `flex-start`,
        alignItems: 'center',
        paddingBlockStart: spacing.xxxl * 2
    },
    text: {
        ...globalStyles.heading1,
        color: colors.textSecondary,
        marginVertical: spacing.xs
    },
});