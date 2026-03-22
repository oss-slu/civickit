// mobile/src/components/MapMarker.tsx
import { Callout, Marker } from "react-native-maps";
import { Logo } from "./Logos";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackParams } from "../types/StackParams";
import { Image } from 'expo-image';
import { BrokenIcon, ExclamationPointIcon, LightBulbIcon, LocationPinIcon, SprayPaintIcon, TrafficConeIcon, TrafficLightIcon, TrashIcon } from "./Icons";
import { colors, size, spacing, typography } from "../styles";
import { useState, useEffect } from "react";

export default function Pin({ issue }: any) {
    const navigation = useNavigation<StackNavigationProp<StackParams>>();
    const width = 38;
    const height = 38;

    const [icon, setIcon] = useState(
        <View style={{ ...styles.icon, paddingTop: spacing.xs + 2 }}>
            <ExclamationPointIcon size={typography.sizeLg} color={colors.textPrimary} />
        </View>
    )
    const [pinImage, setPinImage] = useState(
        <Image source={require('../../assets/pins/' + 'REPORTED' + '.svg')}
            style={{ width: width, height: height }}
        />
    )

    //get correct icon and pin
    useEffect(() => {
        if (issue.category == "POTHOLE") {
            setIcon(
                <View style={styles.icon}>
                    <TrafficConeIcon size={size.md} color={colors.textPrimary} />
                </View>
            )
        } else if (issue.category == "STREETLIGHT") {
            setIcon(
                <View style={{ ...styles.icon, paddingTop: spacing.xs + 2 }}>
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
                <View style={{ ...styles.icon, paddingTop: spacing.xs + 1 }}>
                    <TrashIcon size={size.md} color={colors.textPrimary} />
                </View>
            )
        } else if (issue.category == "BROKEN_SIDEWALK") {
            setIcon(
                <View style={{ ...styles.icon, paddingTop: spacing.xs + 1 }}>
                    <BrokenIcon size={size.md} color={colors.textPrimary} />
                </View>
            )
        } else if (issue.category == "TRAFFIC_SIGNAL") {
            setIcon(
                <View style={{ ...styles.icon, paddingTop: spacing.xs + 2 }}>
                    <TrafficLightIcon size={size.md} color={colors.textPrimary} />
                </View>
            )
        }

        if (issue.status == "ACKNOWLEDGED") {

            setPinImage(
                <Image source={require('../../assets/pins/' + 'ACKNOWLEDGED' + '.svg')}
                    style={{ width: width, height: height }} />

            )
        } else if (issue.status == "IN_PROGRESS") {
            setPinImage(
                <Image source={require('../../assets/pins/' + 'IN_PROGRESS' + '.svg')}
                    style={{ width: width, height: height }} />

            )
        } else if (issue.status == "RESOLVED") {
            setPinImage(
                <Image source={require('../../assets/pins/' + 'RESOLVED' + '.svg')}
                    style={{ width: width, height: height }} />
            )
        } else if (issue.status == "COMMUNITY_RESOLVED") {
            setPinImage(
                <Image source={require('../../assets/pins/' + 'COMMUNITY_RESOLVED' + '.svg')}
                    style={{ width: width, height: height }} />
            )
        } else if (issue.status == "CLOSED") {
            setPinImage(
                <Image source={require('../../assets/pins/' + 'CLOSED' + '.svg')}
                    style={{ width: width, height: height }} />
            )
        }
    }, [])

    return (
        <View style={styles.container}>
            {pinImage}
            {icon}
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignContent: "center",
        alignItems: "center",
    },
    icon: {
        position: "absolute",
        paddingTop: spacing.xs
    }
})