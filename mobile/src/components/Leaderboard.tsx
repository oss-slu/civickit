//mobile/src/components/LeaderBoard.tsx
import { View, Text, FlatList, StyleSheet, ScrollView } from "react-native";
import { borderRadius, colors, spacing } from "../styles";
import IssueCard from "./IssueCard";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackParams } from "../types/StackParams";

export default function Leaderboard({ issues }: any) {

    const navigation = useNavigation<StackNavigationProp<StackParams>>()

    return (
        <FlatList
            data={issues.slice(0, 5)}
            style={styles.list}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => {
                return (
                    <IssueCard
                        issue={item}
                        onPress={() => { navigation.navigate("Issue Details", { issue: item }) }}
                    />
                )
            }}
        />

    )
}

const styles = StyleSheet.create({
    list: {
        rowGap: spacing.xs,
        marginHorizontal: spacing.xs,
    },
    listContainer: {
        rowGap: spacing.sm
    },
    buttonRow: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-evenly",
        paddingBottom: spacing.sm,
        backgroundColor: colors.background,
    },
    modalButton: {
        backgroundColor: colors.background,
        color: colors.textSecondary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        columnGap: spacing.xs
    },
    outlinedButton: {
        borderWidth: 4,
        borderColor: colors.backgroundSecondary,
        borderRadius: borderRadius.lg,
        flexDirection: "row",
        backgroundColor: colors.background,
        color: colors.textSecondary,
    },
    columnRowText: {
        color: colors.textPrimary,
    },
    rowContainer: {
        flexDirection: "row",
        backgroundColor: colors.backgroundSecondary,
    }

})