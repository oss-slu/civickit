import { ScrollView, View, Text, StyleSheet, RefreshControl } from "react-native"

export function MessageScreen({ enableRefresh, onRefresh, refreshing = false, children }: any) {
    if (enableRefresh && onRefresh != null) {
        return (
            <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <Text style={styles.title}>{children}</Text>
            </ScrollView>
        )
    } else {
        console.log("Refresh was disabled or proper function was not provided")
        return (
            <View style={styles.container}>
                <Text style={styles.title}>{children}</Text>
            </View>
        )
    }
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
    }
});
