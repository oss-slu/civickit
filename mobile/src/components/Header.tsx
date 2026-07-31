import { View, Text, StyleSheet } from "react-native";
import WrapperButton from "./WrapperButton";
import { LeftArrowIcon } from "./Icons";
import { colors, spacing, typography } from "../styles";
import { useState } from "react";

export default function Header({ title, onBackPress, lineNum, setOffset, style, children, canGoBack = true }: any) {

    const [numLines, setNumLine] = useState(lineNum)

    const calculateHeight = (lines: any) => {
        let thisHeight = 0
        lines.forEach((element: any) => {
            thisHeight += element.height
        });
        if (setOffset != undefined) {
            setOffset(thisHeight)
        }

        setNumLine(lines.length)

    }



    return (
        <View style={{ ...styles.header, alignItems: numLines > 1 ? "flex-start" : "center", ...style }}>
            {canGoBack &&
                <WrapperButton style={styles.backButton}
                    onPress={onBackPress}>
                    <LeftArrowIcon color={styles.backArrow.color} size={styles.backArrow.fontSize} />
                </WrapperButton>
            }
            {title &&
                <Text style={styles.title}
                    ellipsizeMode="tail"
                    numberOfLines={lineNum}
                    onTextLayout={(e) => calculateHeight(e.nativeEvent.lines)}>{title}</Text>
            }
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        position: "absolute",
        top: 0,
        flexDirection: "row",
        backgroundColor: colors.background,
        width: "100%",
        padding: spacing.xs,
        paddingHorizontal: spacing.md,
        columnGap: spacing.sm,
        paddingVertical: spacing.sm,
        flexWrap: "nowrap",
    },
    title: {
        color: colors.textPrimary,
        fontSize: typography.sizeXl,
        paddingHorizontal: spacing.sm,
        fontWeight: typography.weightMedium,
        flexWrap: "nowrap",
        flex: 1,
        justifyContent: "center",

    },
    backArrow: {
        fontSize: typography.sizeXxl,
        color: colors.textPrimary,
    },
    backButton: {
        backgroundColor: colors.background,
        borderColor: colors.backgroundSecondary,
        // borderWidth: 2,
        paddingHorizontal: spacing.xs * 3,
        paddingVertical: spacing.xs,
    }
})