//mobile/src/components/StatusBarGraph.tsx
import { useState } from "react";
import { BarChart, PieChart } from "react-native-gifted-charts"
import { IssueStatusArray } from "../types/IssueStatusArray";
import { borderRadius, colors, spacing, statusColors } from "../styles/theme";
import { Text, StyleSheet } from "react-native"

export default function StatusBarGraph({ statusNumbers }: any) {
    const [barData, setBarData] = useState(
        IssueStatusArray.map(status => ({
            value: statusNumbers[status.toUpperCase().replace(" ", "_")],
            frontColor: statusColors[status.toLowerCase().replace(" ", "_")].background,
            label: status,
            topLabelComponent: () => (
                <Text style={{
                    color: statusColors[status.toLowerCase().replace(" ", "_")].background
                }}>{statusNumbers[status.toUpperCase().replace(" ", "_")]}</Text>
            )
        }))
    )

    return (
        <BarChart
            noOfSections={3}
            barBorderRadius={borderRadius.md}
            frontColor="lightgray"

            data={barData}
            yAxisThickness={0}
            xAxisThickness={0}
            isAnimated={true}
            rotateLabel={true}
            labelsExtraHeight={112}
            labelWidth={120}
            xAxisLabelTextStyle={{
                alignSelf: 'flex-start',
                transform: [{
                    translateX: 28,
                },
                {
                    translateY: 32
                }],
                color: colors.textPrimary
            }}

        />
    )
}
