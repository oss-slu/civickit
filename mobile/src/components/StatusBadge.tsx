// mobile/src/components/StatusBadge.tsx
import { StyleSheet, View, Text } from "react-native"
import { spacing, borderRadius, typography, colors } from "../styles"
import { statusColors } from '../styles/theme';


export default function StatusBadge({ status, style, textStyle }: any) {
    const statusColor = statusColors[status.toLowerCase()] || statusColors.default;

    return (
        <View
            style={{
                ...styles.statusBadge,
                backgroundColor: statusColor.background,
                ...style
            }}
        >
            <Text style={{ ...styles.statusText, color: statusColor.text, ...textStyle }}>
                {status.replace(/_/g, " ")}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    statusText: {
        fontSize: typography.sizeSm,
        fontWeight: typography.weightBold,
        color: colors.textPrimary,
        textAlign: "center"
    },
})