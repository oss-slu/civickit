import { View, Text, Image, StyleSheet } from "react-native"
import CategoryIcon from "./CategoryIcon"
import { spacing, typography, size, borderRadius, colors, palette } from "../styles"

export const orgColors = [
    palette.ckDarkRed,
    palette.ckBrightBlue,
    palette.ckDarkOrange,
    palette.ckMediumGreen,
    palette.ckDarkYellow,
    palette.ckDarkGreen,
    palette.ckDarkBlue
]

export const orgDisplay = (item: any, organization: any) => {
    return (
        <View style={{ flexDirection: "row", alignItems: "center", columnGap: spacing.sm, paddingHorizontal: spacing.sm }}>
            {item.profilePhoto && <Image source={{ uri: item.profilePhoto.url }} style={styles.orgProfilePic} />}
            <Text style={{ ...styles.optionText }}>
                {item.name} {organization.id == item.id && "(Me)"}

            </Text>
        </View>
    )
}

export const statusDisplay = (item: any) => {
    return (
        <Text style={{ ...styles.optionText, paddingHorizontal: spacing.sm }}>{item.status}</Text>
    )
}

export const categoryDisplay = (item: any) => {
    return (
        <View style={{ flexDirection: "row", alignItems: "center", columnGap: spacing.sm, paddingHorizontal: spacing.sm }}>
            <CategoryIcon category={item.toUpperCase().replace(" ", "_")} />
            <Text style={{ ...styles.optionText }}>{item}</Text>
        </View>
    )
}

export const transformToCompare = (item: any) => {
    return item.id
}

const styles = StyleSheet.create({
    orgProfilePic: {
        width: size.xl,
        height: size.xl,
        borderRadius: borderRadius.full
    },
    optionText: {
        color: colors.textPrimary,
        fontSize: typography.sizeLg
    },
})