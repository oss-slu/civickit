// mobile/src/components/Cluster.tsx
import { View, StyleSheet, Text } from "react-native";
import { colors, size, spacing, typography } from "../styles";
import { useState, useEffect } from "react";
import Svg, { Path, Circle } from "react-native-svg";
import { palette, statusColors } from "../styles/theme";
import { IssueStatusArray } from "../types/IssueStatusArray";
import { PieChart } from "react-native-gifted-charts";


type record = Record<string, number>;

export default function Cluster({ issues }: any) {

    const [fontSize, setFontSize] = useState(typography.sizeXl)
    const [pieData, setPieData] = useState<any>([])

    useEffect(() => {
        if (issues.length >= 10000) {
            setFontSize(typography.sizeXs)
        } else if (issues.length >= 1000) {
            setFontSize(typography.sizeSm)
        } else {
            setFontSize(typography.sizeLg)
        }
    }, [issues.length])

    useEffect(() => {
        const newStatusNumbers: record = {}
        IssueStatusArray.map((status) =>
            newStatusNumbers[status.toUpperCase().replace(" ", "_")] = 0
        )
        issues.map((issue: any) => {
            newStatusNumbers[issue.status] += 1
        })


        setPieData(IssueStatusArray.map(status => ({
            value: newStatusNumbers[status.toUpperCase().replace(" ", "_")],
            color: statusColors[status.toLowerCase().replace(" ", "_")].background,
            text: newStatusNumbers[status.toUpperCase().replace(" ", "_")],
            category: status
        })))

    }, [issues])


    const styles = StyleSheet.create({
        container: {
            flex: 1,
            alignContent: "center",
            alignItems: "center",
            justifyContent: "center",
            width: 38,
            height: 38
        },
        number: {
            // position: "absolute",
            fontSize: fontSize,
            fontWeight: typography.weightBold,
            color: colors.textPrimary,
            flexWrap: "nowrap",
            zIndex: 3
        }
    })


    return (
        <View style={styles.container}>
            <View style={{ position: "absolute", zIndex: 1 }}>
                <PieChart
                    data={pieData}
                    radius={19}
                />
            </View>
            <Svg width="100%" height="100%" viewBox="0 0 100 100" style={{ position: "absolute", zIndex: 2 }}>
                <Circle cx="50" cy="50" r="40" stroke="blue" strokeWidth="0" fill={palette.ckLightGray} />
            </Svg>
            <Text style={{ ...styles.number }}>{issues.length}</Text>

        </View>

    )
}

