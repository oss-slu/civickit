//mobile/src/components/CalloutPopup.tsx

import { View, Text, StyleSheet, ViewStyle, Animated, GestureResponderEvent, useAnimatedValue, TouchableOpacity } from "react-native";
import { borderRadius, colors, globalStyles, palette, spacing, typography } from "../styles";
import IssueCard from "./IssueCard";
import WrapperButton from "./WrapperButton";
import { CloseXIcon, RightArrowIcon } from "./Icons";
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
            <View style={{ ...styles.container, ...style, }}>
                <WrapperButton style={styles.button}
                    onPress={onClosePress}>
                    <CloseXIcon size={typography.sizeXl + 4} color={colors.textPrimary} />
                </WrapperButton>
                <TouchableOpacity style={styles.touchable}
                    onPress={onForwardPress}
                    activeOpacity={0.6}
                >
                    <IssueCard
                        issue={issue}
                        variant="expanded"
                        style={{
                            borderRadius: 0,
                            backgroundColor: colors.background,

                        }}
                        onPress={onForwardPress}
                        animated={false}
                    />
                    <View style={styles.button}
                    >
                        <RightArrowIcon size={typography.sizeXxl} color={colors.textPrimary} />
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        margin: spacing.sm,
        flexDirection: "row",
        alignContent: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
        // ...globalStyles.shadow
        borderWidth: 1,
        borderColor: palette.ckLightGray
    },
    touchable: {
        flexDirection: "row",
        width: "82%",
    },
    button: {
        backgroundColor: colors.background,
        justifyContent: "center"
    }
})