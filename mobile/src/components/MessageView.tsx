import { ScrollView, View, Text, RefreshControl } from "react-native"
import { globalStyles } from "../styles"

export function MessageView({ enableRefresh, onRefresh, refreshing = false, children }: any) {
    if (enableRefresh && onRefresh != null) {
        return (
            <ScrollView contentContainerStyle={globalStyles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <Text style={globalStyles.bodyText}>{children}</Text>
            </ScrollView>
        )
    } else {
        console.log("Refresh was disabled or proper function was not provided")
        return (
            <View style={globalStyles.container}>
                <Text style={globalStyles.heading1}>{children}</Text>
            </View>
        )
    }
}
