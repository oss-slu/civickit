//mobile/src/components/StatusBarGraph.tsx
import { useState } from "react";
import { BarChart, PieChart } from "react-native-gifted-charts"
import { IssueStatusArray } from "../types/IssueStatusArray";
import { borderRadius, colors, palette, size, spacing, statusColors, typography } from "../styles/theme";
import { Text, StyleSheet, View } from "react-native"
import { IssueCategoryArray } from "../types/IssueCategoryArray";

const catColors = [
    palette.ckRed,
    palette.ckGreen,
    palette.ckBlue,
    palette.ckYellow,
    palette.ckLightGreen,
    palette.ckDarkRed,
    palette.ckOrange
]

export default function CategoryPieChart({ categoryNumbers }: any) {
    let i = 0;
    const [pieData, setPieData] = useState(
        IssueCategoryArray.map(category => ({
            value: categoryNumbers[category.toUpperCase().replace(" ", "_")],
            color: catColors[i++],
            text: category
        }))
    )

    const renderLegend = (text: string, color: string) => {
        return (
            <View style={{ flexDirection: 'row', marginBottom: 12 }} key={i++}>
                <View
                    style={{
                        height: size.md,
                        width: size.md,
                        marginRight: spacing.sm,
                        borderRadius: borderRadius.md,
                        backgroundColor: color || 'white',
                    }}
                />
                <Text style={{ color: colors.textPrimary, fontSize: typography.sizeMd }}>{text || ''}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <PieChart
                data={pieData}
                isAnimated={true}
            />
            <View style={styles.legend}>
                {
                    pieData.map((value: { color: string, text: string }) =>
                        renderLegend(value.text, value.color)
                    )
                }
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    legend: {
        flexDirection: "row",
        flexWrap: "wrap",
        columnGap: spacing.sm,
        alignItems: "center",
        justifyContent: "center",
        marginTop: spacing.sm
    },
    container: {
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center"
    }
})