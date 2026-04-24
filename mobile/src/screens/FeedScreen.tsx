//mobile/src/screens/FeedScreen.tsx
import { MessageView } from "../components/MessageView";
import { Dimensions, RefreshControl, ScrollView, Text, StyleSheet, View } from "react-native"
import { borderRadius, colors, globalStyles, palette, size, spacing, typography } from "../styles";
import { useNearbyIssues } from "../contexts/NearbyIssuesContext";
import LoadingScreen from "./LoadingScreen";
import React, { useEffect, useState } from "react";
import { BarChart, PieChart } from "react-native-gifted-charts"
import StatusBarGraph from "../components/StatusBarGraph";
import { IssueStatusArray } from "../types/IssueStatusArray";
import { IssueCategoryArray } from "../types/IssueCategoryArray";
import { Issue } from "@civickit/shared";
import CategoryPieChart from "../components/CategoryPieChart";
import ModalDropdown from "../components/ModalDropdown";
import { CaretDownIcon, RefreshIcon, RightArrowIcon } from "../components/Icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "../contexts/LocationContext";
import ENV from '../config/env';
import { FlatList } from "react-native-gesture-handler";
import { GetNearbyIssueResponse } from "@civickit/shared/src/types/api";
import IconButton from "../components/IconButton";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackParams } from "../types/StackParams";
import { radiusOptions } from "../types/RadiusOptions";
import { timeOptions } from "../types/TimeOptions";
import Leaderboard from "../components/Leaderboard";

type record = Record<string, number>;

export default function FeedScreen() {

    const [refreshing, setRefreshing] = useState(false);
    const [radius, setRadius] = useState("1 mile")
    const [time, setTime] = useState("All Time")
    const [statusNumbers, setStatusNumbers] = useState<record>({})
    const [categoryNumbers, setCategoryNumbers] = useState<record>({})
    const [filteredData, setFilteredData] = useState([])
    const queryClient = useQueryClient()
    const location = useLocation().location
    const navigation = useNavigation<StackNavigationProp<StackParams>>()


    async function queryFunction({ queryKey }: any) {
        const [radius] = queryKey
        const response = await fetch(
            ENV.apiUrl + '/issues/nearby?lat=' +
            location.latitude + '&lng=' + location.longitude
            + '&radius=' + parseInt(radius) * 1609.34 //miles -> meters
        );
        if (!response.ok) throw new Error('Failed to fetch');
        return response.json();
    }

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [radius],
        queryFn: queryFunction
    }, queryClient);


    useEffect(() => {
        if (data != undefined) {

            //filter by date
            //currently limited to issues reported in the time frame
            //once functionality to update status is implemented, can expand to include isseus with updates
            let filteredData = []

            const today = new Date()

            if (time == "1 Week") {
                today.setUTCHours(0, 0, 0, 0)
                filteredData = (data.issues.filter((issue: Issue) => {
                    const other = new Date(issue.createdAt)
                    other.setUTCHours(0, 0, 0, 0)
                    if ((today.getTime() - other.getTime()) / 1000 / 60 / 60 / 24 <= 7) {
                        return true
                    }
                    return false
                }))
            } else if (time == "1 Month") {

                filteredData = (data.issues.filter((issue: Issue) => {
                    const other = new Date(issue.createdAt)

                    let lastMonth = (today.getUTCMonth() - 1) % 13

                    if (
                        (other.getUTCMonth() == today.getUTCMonth() && other.getUTCDate() <= today.getUTCDate()) ||
                        (other.getUTCMonth() == lastMonth && other.getUTCDate() >= today.getUTCDate())
                    ) {

                        return true
                    }
                    return false
                }))
            } else if (time == "1 Year") {

                filteredData = (data.issues.filter((issue: Issue) => {
                    const other = new Date(issue.createdAt)

                    let lastYear = (today.getUTCFullYear() - 1)

                    if (
                        (other.getUTCFullYear() == today.getUTCFullYear() && other.getUTCMonth() <= today.getUTCMonth()) ||
                        (other.getUTCFullYear() == lastYear && other.getUTCMonth() >= today.getUTCMonth())
                    ) {

                        return true
                    }
                    return false
                }))
            } else {
                filteredData = data.issues
            }



            //create records
            const newStatusNumbers: record = {}
            const newCategoryNumbers: record = {}

            IssueStatusArray.map((status) =>
                newStatusNumbers[status.toUpperCase().replace(" ", "_")] = 0
            )
            IssueCategoryArray.map((status) => newCategoryNumbers[status.toUpperCase().replace(" ", "_")] = 0)


            filteredData.map((issue: Issue) => {
                newStatusNumbers[issue.status] += 1
                newCategoryNumbers[issue.category] += 1
            })

            filteredData = filteredData.sort((a: GetNearbyIssueResponse, b: GetNearbyIssueResponse) => {
                if (a.upvoteCount > b.upvoteCount) {
                    return -1
                } else if (a.upvoteCount < b.upvoteCount) {
                    return 1
                }
                return 0
            })


            setStatusNumbers(newStatusNumbers)
            setCategoryNumbers(newCategoryNumbers)
            setFilteredData(filteredData)
        }

    }, [data, time])



    //check if still loading
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
                refreshing={refreshing}>
                {String(error)}
            </MessageView>
        )
    }


    //filter by radius (refetch with new radius)
    const handleRadiusChange = (newRadius: any) => {
        setRadius(newRadius)
        setStatusNumbers({})
        setCategoryNumbers({})
        refetch()
    }

    return (
        <FlatList
            ListHeaderComponent={
                <ScrollView
                    style={{ ...globalStyles.container }}
                    refreshControl={<RefreshControl
                        refreshing={refreshing}
                        onRefresh={refetch} />}
                >

                    <View style={styles.buttonRow}>

                        <View style={styles.buttonSection}>
                            <Text style={styles.headerText}>Within</Text>
                            <ModalDropdown
                                data={radiusOptions}
                                onDataSelect={handleRadiusChange}
                                defaultText={radius}
                                buttonStyle={styles.modalButton}
                                labelSuffix={<CaretDownIcon />} />
                        </View>

                        <View style={styles.buttonSection}>
                            {time != "All Time" && <Text style={styles.headerText}>In the last</Text>}
                            <ModalDropdown
                                data={timeOptions}
                                onDataSelect={setTime}
                                defaultText={time}
                                labelSuffix={<CaretDownIcon />}
                                buttonStyle={styles.modalButton} />
                        </View>


                    </View>

                    <IconButton style={{
                        ...styles.modalButton,
                        width: size.xxl * 1.25,
                        alignSelf: "flex-end",
                        position: "absolute",
                        top: spacing.xxl + 8
                    }}
                        onPress={refetch}
                    >
                        <RefreshIcon
                            color={colors.textPrimary}
                            size={typography.sizeXl}
                        />
                    </IconButton>


                    <Text style={{ ...styles.heading }}>
                        Most Upvoted
                    </Text>


                    <View style={{ ...styles.leaderboardContainer }}>
                        <Leaderboard issues={filteredData} />
                    </View>

                    <IconButton style={{
                        ...styles.modalButton,
                        flexDirection: "row",
                        columnGap: spacing.xs,
                    }}
                        onPress={() => { navigation.navigate("Leaderboard", { issues: filteredData }) }}
                    >
                        <Text style={{ fontSize: typography.sizeLg, ...styles.buttonText }}>More</Text>
                        <RightArrowIcon
                            color={colors.textSecondary}
                            size={typography.sizeXl}
                        />
                    </IconButton>

                    <Text style={{ ...styles.heading }}>
                        More Stats
                    </Text>

                    <View style={{
                        ...styles.sectionContainer,
                        backgroundColor: colors.background
                    }}>
                        <CategoryPieChart categoryNumbers={categoryNumbers} />
                    </View>

                    <View style={{ ...styles.sectionContainer }}>
                        <StatusBarGraph statusNumbers={statusNumbers} />
                    </View>

                </ScrollView>
            } data={undefined} renderItem={undefined}

        />
    )
}

const styles = StyleSheet.create({
    heading: {
        ...globalStyles.heading1,
        textAlign: "center",
        marginHorizontal: spacing.md,
        marginVertical: spacing.sm
    },
    leaderboardContainer: {
        margin: spacing.sm,
    },
    sectionContainer: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.lg,
        margin: spacing.sm,
        padding: spacing.sm,
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center"
    },
    buttonRow: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        padding: spacing.sm,
    },
    buttonSection: {
        flexDirection: "row",
        columnGap: spacing.sm,
        justifyContent: "center",
        alignItems: "center"
    },
    buttonText: {
        color: colors.textSecondary
    },
    headerText: {
        fontSize: typography.sizeLg,
        fontWeight: typography.weightMedium,
        color: colors.textPrimary
    },
    modalButton: {
        backgroundColor: colors.background,
        color: colors.textSecondary,
        borderWidth: 4,
        borderColor: colors.backgroundSecondary
    }
})