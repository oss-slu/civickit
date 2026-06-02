import { GetNearbyIssueResponse, Issue } from "@civickit/shared";
import { View, Text, StyleSheet } from "react-native";
import IssueCard from "./IssueCard";
import { borderRadius, colors, spacing, typography } from "../styles";

export default function ExtendedIssueCard({ issue, onPress }: any) {
    const createdAt = new Date(issue.createdAt)
    const updatedAt = new Date(issue.updatedAt)
    return (
        <View style={styles.card}>
            <IssueCard
                issue={issue}
                animated={false}
                onPress={onPress}
            />
            <View style={styles.subtitleRow}>
                <Text style={styles.subtitle}>Reported {createdAt.getMonth() + 1}/{createdAt.getDate()}/{createdAt.getFullYear()}</Text>
                <Text style={styles.subtitle}>Last Updated {updatedAt.getMonth() + 1}/{updatedAt.getDate()}/{updatedAt.getFullYear()}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    subtitle: {
        fontSize: typography.sizeMd,
        color: colors.textSecondary
    },
    subtitleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: spacing.md,
        marginVertical: spacing.xs,
    },
    card: {
        backgroundColor: colors.background,
        borderColor: colors.backgroundSecondary,
        borderRadius: borderRadius.lg + 4,
        borderWidth: 2
    },

})