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
import { CaretDownIcon } from "../components/Icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "../contexts/LocationContext";
import ENV from '../config/env';

type record = Record<string, number>;
const radiusOptions = ["1 mile", "5 miles", "10 miles", "25 miles", "50 miles"]
const timeOptions = ["1 Week", "1 Month", "1 Year", "All Time"]

export default function FeedScreen() {

    const [refreshing, setRefreshing] = useState(false);
    const [radius, setRadius] = useState("1 mile")
    const [time, setTime] = useState("All Time")
    const [statusNumbers, setStatusNumbers] = useState<record>({})
    const [categoryNumbers, setCategoryNumbers] = useState<record>({})

    const queryClient = useQueryClient()
    const location = useLocation().location

    async function queryFunction({ queryKey }: any) {
        const [radius] = queryKey
        console.log(radius)
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

            const newStatusNumbers: record = {}
            const newCategoryNumbers: record = {}

            IssueStatusArray.map((status) =>
                newStatusNumbers[status.toUpperCase().replace(" ", "_")] = 0
            )
            IssueCategoryArray.map((status) => newCategoryNumbers[status.toUpperCase().replace(" ", "_")] = 0)


            data.issues.map((issue: Issue) => {
                newStatusNumbers[issue.status] += 1
                newCategoryNumbers[issue.category] += 1
            })


            setStatusNumbers(newStatusNumbers)
            setCategoryNumbers(newCategoryNumbers)
        }

    }, [data])

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

    // console.log(new Date(), data.issues[0].createdAt)

    //filter by date

    const handleRadiusChange = (newRadius: any) => {
        setRadius(newRadius)
        setStatusNumbers({})
        setCategoryNumbers({})
        refetch()
    }




    //at a glance section (In the last month...)
    //  num issues reported in last month
    //  num issues addressed in some way (in progress and onwards)
    //  most common problem reported 

    //status bar graph
    //categroy pie chart
    //leaderboard


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

            <View style={styles.butonRow}>

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


            <View style={{ ...styles.sectionContainer }}>
                <StatusBarGraph statusNumbers={statusNumbers} />
            </View>

            <View style={{
                ...styles.sectionContainer,
                backgroundColor: colors.background
            }}>
                <CategoryPieChart categoryNumbers={categoryNumbers} />
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
    },
    butonRow: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-evenly"
    },
    buttonSection: {
        flexDirection: "row",
        columnGap: spacing.sm,
        justifyContent: "center",
        alignItems: "center"
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