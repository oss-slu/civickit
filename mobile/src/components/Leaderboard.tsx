//mobile/src/components/LeaderBoard.tsx
import { View, Text, FlatList, StyleSheet, ScrollView } from "react-native";
import { borderRadius, colors, spacing } from "../styles";
import IssueCard from "./IssueCard";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackParams } from "../types/StackParams";

export default function Leaderboard({ issues }: any) {

    const navigation = useNavigation<StackNavigationProp<StackParams>>()
    const issueComps = issues.slice(0, 5).map((issue: any, index: any) =>
        <IssueCard
            issue={issue}
            onPress={() => { navigation.navigate("Issue Details", { issue: issue }) }}
            key={index}
        />
    )

    return (
        <View style={styles.list}>
            {issueComps}
        </View>

    )
}

const styles = StyleSheet.create({
    list: {
        rowGap: spacing.xs,
        marginHorizontal: spacing.xs,
    },

})