//mobile/src/components/CalloutListPopup.tsx

import { View, Text, StyleSheet, ViewStyle, Animated, GestureResponderEvent, useAnimatedValue, ScrollView } from "react-native";
import { borderRadius, colors, globalStyles, size, spacing, typography } from "../styles";
import IssueCard from "./IssueCard";
import IconButton from "./IconButton";
import { CloseXIcon, RightArrowIcon } from "./Icons";
import { GetNearbyIssueResponse, Issue } from "@civickit/shared";
import IssueSquare from "./IssueSquare";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackParams } from "../types/StackParams";


export default function CalloutListPopup({ style, cluster, onClosePress }: any) {

    const navigation = useNavigation<StackNavigationProp<StackParams>>()

    if (cluster != undefined) {
        return (
            <View style={{ ...styles.container, ...style, }}>

                <IconButton style={styles.button}
                    onPress={onClosePress}>
                    <CloseXIcon size={typography.sizeXl} color={colors.textPrimary} />
                </IconButton>

                <ScrollView contentContainerStyle={styles.issueList}
                    horizontal>
                    {cluster.issues.map((issue: any) =>
                        <IssueSquare
                            key={issue.id}
                            issue={issue}
                            animated={true}
                            onPress={() => { navigation.navigate("Issue Details", { issue: issue }) }}
                        />
                    )}
                </ScrollView>



            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        marginLeft: spacing.xs
    },
    button: {
        backgroundColor: colors.background,
        height: size.cardExpanded,
        alignSelf: "center"
    },
    issueList: {
        flexDirection: "row",
        columnGap: spacing.sm,
        flexWrap: "nowrap",
        padding: spacing.sm,
    }
})