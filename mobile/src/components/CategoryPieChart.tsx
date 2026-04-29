//mobile/src/components/StatusBarGraph.tsx
import { useEffect, useState } from "react";
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
    let i = 0
    const [pieData, setPieData] = useState<any>([])
    const [focused, setFocused] = useState<any>()
    const [total, setTotal] = useState(1)

    useEffect(() => {
        i = 0;
        setPieData(IssueCategoryArray.map(category => ({
            value: categoryNumbers[category.toUpperCase().replace(" ", "_")],
            color: catColors[i++],
            text: categoryNumbers[category.toUpperCase().replace(" ", "_")],
            category: category
        })))

    }, [categoryNumbers])

    useEffect(() => {
        let localTotal = 0;
        if (pieData.length != 0) {
            const values = pieData.map((value: any) => parseInt(value.value))
            const maxInd = values.indexOf(Math.max(...values))
            setFocused(pieData[maxInd])
        }

        pieData.map((item: any) => {
            localTotal += item.value
        })
        setTotal(localTotal)
    }, [pieData])

    const renderLegend = (category: string, color: string) => {
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
                <Text style={{ color: colors.textPrimary, fontSize: typography.sizeMd }}>{category || ''}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Issues by Category</Text>

            <PieChart
                data={pieData}
                donut
                isAnimated
                centerLabelComponent={() => {
                    if (focused != undefined) {
                        return (
                            <View style={styles.center}>
                                <Text style={styles.centerLabels}>{focused.category}</Text>
                                <Text style={styles.centerLabels}>{focused.value} issues</Text>
                                <Text style={styles.centerLabels}>{(focused.value / total * 100).toFixed(1)}%</Text>
                            </View>
                        )
                    }

                }}
                sectionAutoFocus
                focusOnPress
                innerRadius={60}
                onPress={(item: any) => setFocused(item)}
            />
            <View style={styles.legend}>
                {
                    pieData.map((value: { value: number, color: string, text: string, category: string }) => {
                        // console.log(value)
                        if (value.value > 0) {
                            return renderLegend(value.category, value.color)
                        }
                    }
                    )
                }
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    title: {
        color: colors.textPrimary,
        fontSize: typography.sizeLg,
        fontWeight: typography.weightBold,
        alignSelf: "flex-start",
        marginBottom: spacing.md
    },
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
        alignItems: "center",
        width: "100%"
    },
    center: {
        width: "100%",
        alignContent: "center",
        justifyContent: "center",
        textAlign: "center",
        alignItems: "center"
    },
    centerLabels: {
        fontSize: typography.sizeMd,
        color: colors.textPrimary,
        fontWeight: typography.weightMedium,
    }
})