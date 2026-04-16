//mobile/src/screens/FeedScreen.tsx
import { MessageView } from "../components/MessageView";
import { Dimensions, RefreshControl, ScrollView, Text, StyleSheet, View } from "react-native"
import { borderRadius, colors, globalStyles, palette, spacing } from "../styles";
import { useNearbyIssues } from "../contexts/NearbyIssuesContext";
import LoadingScreen from "./LoadingScreen";
import React, { useState } from "react";
import { BarChart, PieChart } from "react-native-gifted-charts"
import StatusBarGraph from "../components/StatusBarGraph";
import { IssueStatusArray } from "../types/IssueStatusArray";
import { IssueCategoryArray } from "../types/IssueCategoryArray";
import { Issue } from "@civickit/shared";
import CategoryPieChart from "../components/CategoryPieChart";

type record = Record<string, number>;

export default function FeedScreen() {

    const { data, isLoading, error, refetch } = useNearbyIssues()
    const [refreshing, setRefreshing] = useState(false);

    const statusNumbers: record = {};
    IssueStatusArray.map((status) => statusNumbers[status.toUpperCase().replace(" ", "_")] = 0)

    const catgegoryNumbers: record = {};
    IssueCategoryArray.map((status) => catgegoryNumbers[status.toUpperCase().replace(" ", "_")] = 0)

    data.issues.map((issue: Issue) => {
        statusNumbers[issue.status] += 1
        catgegoryNumbers[issue.category] += 1
    })

    //at a glance section (In the last month...)
    //  num issues reported in last month
    //  num issues addressed in some way (in progress and onwards)
    //  most common problem reported 

    //status bar graph
    //categroy pie chart
    //leaderboard

    if (isLoading) {
        return (
            <LoadingScreen />
        )
    }

    //check if error has been thrown
    if (error != null) {
        return (
            <MessageView enableRefresh={true}
                onRefresh={refetch}
                refreshing={true}>
                {String(error)}
            </MessageView>
        )
    }


    return (
        <ScrollView style={{ ...globalStyles.container }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} />}>
            <View style={{ ...styles.sectionContainer }}>
                <StatusBarGraph statusNumbers={statusNumbers} />
            </View>

            <View style={{
                ...styles.sectionContainer,
                backgroundColor: colors.background
            }}>
                <CategoryPieChart categoryNumbers={catgegoryNumbers} />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    sectionContainer: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.lg,
        margin: spacing.sm,
        padding: spacing.sm,
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center"
    }
})