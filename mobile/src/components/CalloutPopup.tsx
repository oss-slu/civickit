//mobile/src/components/CalloutPopup.tsx

import { View, Text, StyleSheet, ViewStyle, Animated, GestureResponderEvent, useAnimatedValue } from "react-native";
import { borderRadius, colors, globalStyles, spacing, typography } from "../styles";
import IssueCard from "./IssueCard";
import IconButton from "./IconButton";
import { CloseXIcon, RightArrowIcon } from "./Icons";
import { useRef } from "react";
import { GetNearbyIssueResponse, Issue } from "@civickit/shared";

interface CalloutProps {
    style?: any,
    issue: GetNearbyIssueResponse | undefined,
    onClosePress: () => void,
    onForwardPress: () => void
}
export default function CalloutPopup({ style, issue, onClosePress, onForwardPress }: CalloutProps) {

    if (issue != undefined) {
        return (
            <View style={{ ...style, ...styles.container }}>
                <IconButton style={styles.button}
                    onPress={onClosePress}>
                    <CloseXIcon size={typography.sizeXl} color={colors.textPrimary} />
                </IconButton>
                <IssueCard
                    issue={issue}
                    variant="expanded"
                    style={{
                        borderRadius: 0,
                        backgroundColor: colors.background
                    }}
                    animated={false}
                />
                <IconButton style={styles.button}
                    onPress={onForwardPress}>
                    <RightArrowIcon size={typography.sizeXxl} color={colors.textPrimary} />
                </IconButton>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        margin: spacing.sm,
        flexDirection: "row",
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg
    },
    button: {
        backgroundColor: colors.background,
    }
})