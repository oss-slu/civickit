import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { IssueStatusArray } from "../types/IssueStatusArray";
import { borderRadius, colors, spacing, statusColors, typography } from "../styles/theme";

type StatusNumbers = Record<string, number>;

type StatusRow = {
    key: string;
    label: string;
    value: number;
    ratio: number;
    color: string;
};

export default function StatusSummaryCard({ statusNumbers }: { statusNumbers: StatusNumbers }) {
    const rows = useMemo<StatusRow[]>(() => {
        const values = IssueStatusArray.map((status) => {
            const key = status.toUpperCase().replace(/ /g, "_");
            const colorKey = status.toLowerCase().replace(/ /g, "_");
            const value = statusNumbers?.[key] ?? 0;

            return {
                key,
                label: status,
                value,
                color: statusColors[colorKey].background,
            };
        });

        const maxValue = Math.max(...values.map((row) => row.value), 0);

        return values.map((row) => ({
            ...row,
            ratio: maxValue > 0 ? row.value / maxValue : 0,
        }));
    }, [statusNumbers]);

    const total = rows.reduce((sum, row) => sum + row.value, 0);

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Issues by Status</Text>
                <Text style={styles.total}>{total} total</Text>
            </View>

            <View style={styles.rows}>
                {rows.map((row) => (
                    <View key={row.key} style={styles.row}>
                        <View style={styles.labelRow}>
                            <View style={[styles.dot, { backgroundColor: row.color }]} />
                            <Text style={styles.label}>{row.label}</Text>
                            <Text style={styles.value}>{row.value}</Text>
                        </View>

                        <View style={styles.track}>
                            <View
                                style={[
                                    styles.fill,
                                    {
                                        width: `${Math.max(row.ratio * 100, row.value > 0 ? 8 : 0)}%`,
                                        backgroundColor: row.color,
                                    },
                                ]}
                            />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        rowGap: spacing.md,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        columnGap: spacing.sm,
    },
    title: {
        color: colors.textPrimary,
        fontSize: typography.sizeLg,
        fontWeight: typography.weightBold,
    },
    total: {
        color: colors.textSecondary,
        fontSize: typography.sizeMd,
        fontWeight: typography.weightMedium,
    },
    rows: {
        rowGap: spacing.md,
    },
    row: {
        rowGap: spacing.xs,
    },
    labelRow: {
        flexDirection: "row",
        alignItems: "center",
        columnGap: spacing.sm,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: borderRadius.full,
        flexShrink: 0,
    },
    label: {
        flex: 1,
        color: colors.textPrimary,
        fontSize: typography.sizeMd,
        fontWeight: typography.weightMedium,
    },
    value: {
        color: colors.textSecondary,
        fontSize: typography.sizeMd,
        fontWeight: typography.weightBold,
        minWidth: 28,
        textAlign: "right",
    },
    track: {
        width: "100%",
        height: 12,
        backgroundColor: colors.background,
        borderRadius: borderRadius.full,
        overflow: "hidden",
    },
    fill: {
        height: "100%",
        borderRadius: borderRadius.full,
    },
});
