//mobile/src/components/StatusBarGraph.tsx
import { useEffect, useState } from "react";
import { BarChart, PieChart } from "react-native-gifted-charts"
import { IssueStatusArray } from "../types/IssueStatusArray";
import { borderRadius, colors, spacing, statusColors } from "../styles/theme";
import { Text, StyleSheet } from "react-native"
import { dbFormatted } from "../utils/dbValues";

export default function StatusBarGraph({ statusNumbers }: any) {
    const [barData, setBarData] = useState<any>(undefined)

    useEffect(() => {
        setBarData(IssueStatusArray.map(status => ({
            value: statusNumbers[dbFormatted(status)],
            frontColor: statusColors[dbFormatted(status)].background,
            label: status,
            topLabelComponent: () => (
                <Text style={{
                    color: statusColors[dbFormatted(status)].background
                }}>{statusNumbers[dbFormatted(status)]}</Text>
            )
        })))
    }, [statusNumbers])

    return (
        <BarChart
            noOfSections={3}
            barBorderRadius={borderRadius.md}
            frontColor="lightgray"
            data={barData}
            yAxisThickness={0}
            xAxisThickness={0}
            // isAnimated={true} //- currently causing some rendering problems
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
