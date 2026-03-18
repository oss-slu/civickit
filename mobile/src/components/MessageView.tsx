// mobile/src/components/MessageView.tsx
import { ScrollView, View, Text, RefreshControl, StyleSheet } from "react-native"
import { globalStyles, spacing } from "../styles"

export function MessageView({ enableRefresh, onRefresh, refreshing = false, children }: any) {
    if (enableRefresh && onRefresh != null) {
        return (
            <ScrollView contentContainerStyle={styles.container}
                refreshControl={<RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh} />}>
                <Text style={styles.text}>{children}</Text>
            </ScrollView>
        )
    } else {
        // console.log("Refresh was disabled or proper function was not provided")
        return (
            <View style={styles.container}>
                <Text style={styles.text}>{children}</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        ...globalStyles.container,
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        ...globalStyles.heading1,
        marginBottom: spacing.md
    },
});