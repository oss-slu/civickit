// mobile/src/components/Pin.tsx
import { View, StyleSheet } from "react-native";
import { BrokenIcon, ExclamationPointIcon, LightBulbIcon, LocationPinIcon, SprayPaintIcon, TrafficConeIcon, TrafficLightIcon, TrashIcon } from "./Icons";
import { colors, size, typography } from "../styles";
import { useState, useEffect } from "react";
import Svg, { Path } from "react-native-svg";
import { statusColors } from "../styles/theme";

export default function Pin({ issue }: any) {
    const statusColor = statusColors[issue.status.toLowerCase()] || statusColors.default;

    const [icon, setIcon] = useState(
        <View style={styles.icon}>
            <ExclamationPointIcon size={typography.sizeLg} color={colors.textPrimary} />
        </View>
    )

    //get correct icon
    useEffect(() => {
        if (issue.category == "POTHOLE") {
            setIcon(
                <View style={styles.icon}>
                    <TrafficConeIcon size={size.md} color={colors.textPrimary} />
                </View>
            )
        } else if (issue.category == "STREETLIGHT") {
            setIcon(
                <View style={styles.icon}>
                    <LightBulbIcon size={size.md} color={colors.textPrimary} />
                </View>
            )
        } else if (issue.category == "GRAFFITI") {
            setIcon(
                <View style={styles.icon}>
                    <SprayPaintIcon size={size.md} color={colors.textPrimary} />
                </View>
            )
        } else if (issue.category == "ILLEGAL_DUMPING") {
            setIcon(
                <View style={styles.icon}>
                    <TrashIcon size={size.md} color={colors.textPrimary} />
                </View>
            )
        } else if (issue.category == "BROKEN_SIDEWALK") {
            setIcon(
                <View style={styles.icon}>
                    <BrokenIcon size={size.md} color={colors.textPrimary} />
                </View>
            )
        } else if (issue.category == "TRAFFIC_SIGNAL") {
            setIcon(
                <View style={styles.icon}>
                    <TrafficLightIcon size={size.md} color={colors.textPrimary} />
                </View>
            )
        } else {
            setIcon(
                <View style={styles.icon}>
                    <ExclamationPointIcon size={typography.sizeLg} color={colors.textPrimary} />
                </View>
            )
        }

    }, [issue])

    return (
        <View style={styles.container}>
            <Svg width="100%" height="100%" viewBox="0 0 210 210">
                <Path
                    d="M180.647 750.96c-4.544 39.094-75.732 127.582-75.732 127.582S33.078 790.379 29.184 750.96c-4.77-48.27 33.906-78.575 75.731-78.575 41.826 0 81.557 28.46 75.732 78.575z"
                    fill={statusColor.background}
                    stroke={statusColor.stroke}
                    strokeWidth={11}
                    transform="translate(0 -670.454)" />
            </Svg>
            {icon}
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignContent: "center",
        alignItems: "center",
        width: 37,
        height: 38
    },
    icon: {
        position: "absolute",
        top: 1,
        width: 27,
        height: 27,
        alignItems: "center",
        justifyContent: "center"
    }
})