//mobile/src/screens/Dispatch/DispatchScreen.tsx

import { RefreshControl, ScrollView, View, StyleSheet, Text } from "react-native";
import { useNearbyIssues } from "../../contexts/NearbyIssuesContext";
import LoadingScreen from "../Misc/LoadingScreen";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackParams } from "../../types/StackParams";
import { useActionState, useCallback, useEffect, useState } from "react";
import IssueCard from "../../components/IssueCard";
import { borderRadius, colors, globalStyles, palette, size, spacing, typography } from "../../styles";
import Header from "../../components/Header";
import ModalPopUp from "../../components/ModalPopup";
import { CaretDownIcon, CheckMarkIcon, DownArrowIcon, FilterIcon, UpArrowIcon } from "../../components/Icons";
import CheckList from "../../components/CheckList";
import ModalDropdown from "../../components/ModalDropdown";
import WrapperButton from "../../components/WrapperButton";
import { IssueCategoryArray } from "../../types/IssueCategoryArray";
import { IssueStatusArray } from "../../types/IssueStatusArray";
import { useAuth } from "../../contexts/AuthContext";
import { GetNearbyIssueResponse } from "@civickit/shared";
import ExtendedIssueCard from "../../components/ExtendedIssueCard";
import Button from "../../components/Button";

export default function DispatchScreen() {
    const { data, isLoading, isFetching, error, refetch } = useNearbyIssues()
    const [issues, setIssues] = useState([])
    const [refreshing, setRefreshing] = useState(false)
    const navigation = useNavigation<StackNavigationProp<StackParams>>()
    const [headerOffset, setHeaderOffset] = useState(spacing.xxxl)
    const { organization } = useAuth()
    const [sort, setSort] = useState("Endorsements")
    const [isAscending, setIsAscending] = useState(true)
    const sortOptions = ["Endorsements", "Date Reported", "Distance"]

    //TODO replace with formatted function when merged
    const orgCategories = organization.categoryScope.map((cat: any) => cat.toLowerCase().replace("_", " "))
    const [visibleCategories, setVisibleCategories] = useState(orgCategories)

    useEffect(() => {
        if (data.issues != null) {
            const visibleIssues = data.issues.filter((issue: any) => {
                if (issue.claimedById != null) {
                    return false
                }
                if (!visibleCategories.map((i: any) => i.toLowerCase()).includes(issue.category.replace(/_/g, " ").toLowerCase())) {
                    return false
                }
                return true
            })

            if (sort == "Endorsements") {
                visibleIssues.sort((a: GetNearbyIssueResponse, b: GetNearbyIssueResponse) => {
                    return (a.upvoteCount - b.upvoteCount) * (isAscending ? -1 : 1)
                })
            } else if (sort == "Date Reported") {
                visibleIssues.sort((a: GetNearbyIssueResponse, b: GetNearbyIssueResponse) => {
                    const aDate = new Date(a.createdAt)
                    const bDate = new Date(b.createdAt)

                    if (aDate.getTime() < bDate.getTime()) {
                        return 1 * (isAscending ? 1 : -1)
                    } else if (aDate.getTime() > bDate.getTime()) {
                        return -1 * (isAscending ? 1 : -1)
                    }
                    return 0
                })
            } else if (sort == "Distance") {
                visibleIssues.sort((a: GetNearbyIssueResponse, b: GetNearbyIssueResponse) => {
                    // console.log(a.distance, b.distance, parseFloat(a.distance) - parseFloat(b.distance))
                    return (parseFloat(a.distance) - parseFloat(b.distance)) * (isAscending ? -1 : 1)
                })
            }

            setIssues(visibleIssues)
        }
    }, [data, sort, isAscending, visibleCategories])

    useFocusEffect(
        useCallback(() => {
            if (refetch) {
                refetch()
            }
        }, [])
    )

    if (isLoading) {
        return <LoadingScreen />
    } else if (error) {
        navigation.navigate('Error', { errorMessage: "There was an Error" })
    }

    const issueList = issues.map((issue: any,) => {
        return <ExtendedIssueCard issue={issue} key={issue.id}
            onPress={() => navigation.navigate("Issue Details", { issue: issue })} />
    })

    return (
        <View style={{ ...globalStyles.container, padding: 0 }}>
            <ScrollView
                refreshControl={<RefreshControl
                    refreshing={refreshing}
                    onRefresh={refetch} />}
                style={{ ...styles.list, paddingTop: headerOffset + spacing.sm }}
                contentContainerStyle={styles.listContainter}
            >
                {issueList}
            </ScrollView>
            <Header
                setOffset={(i: any) => setHeaderOffset(i)}
                style={styles.header}
                canGoBack={false}
            >
                <Text style={styles.headerText}>Unclaimed Issues in Your Area</Text>

                <View style={styles.buttonRow}>
                    <View style={styles.buttonContainer}>
                        <ModalDropdown
                            data={sortOptions}
                            onDataSelect={setSort}
                            defaultText={sort}
                            buttonStyle={styles.modalButton}
                            labelSuffix={<CaretDownIcon />} />

                        <WrapperButton style={{ backgroundColor: colors.backgroundSecondary, width: typography.sizeXl }}
                            onPress={() => setIsAscending(!isAscending)}>
                            {isAscending ?
                                <UpArrowIcon size={typography.sizeXl}
                                    color={colors.textPrimary}
                                /> :
                                <DownArrowIcon size={typography.sizeXl}
                                    color={colors.textPrimary}
                                />}

                        </WrapperButton>
                    </View>

                    <ModalPopUp
                        buttonBody={
                            <View style={{ ...styles.modalButton, columnGap: spacing.sm }}>
                                <FilterIcon color={colors.textPrimary} size={typography.sizeLg} />
                                <Text style={{ fontSize: styles.modalButton.fontSize, fontWeight: styles.modalButton.fontWeight }}>Categories</Text>
                            </View>
                        }
                        buttonStyle={{
                            ...styles.modalButton,
                            borderColor: visibleCategories.length == orgCategories.length
                                ? colors.backgroundSecondary :
                                palette.ckYellow,
                            paddingVertical: spacing.sm,
                            paddingHorizontal: spacing.sm,
                            borderWidth: 4
                        }}>
                        <View>
                            <Text style={styles.label}>Categories {organization.name} serves</Text>
                            <CheckList
                                data={orgCategories}
                                selectedValues={visibleCategories}
                                setSelectedValues={setVisibleCategories}
                            />
                        </View>
                    </ModalPopUp>
                </View>
            </Header>
        </View>
    )
}


const styles = StyleSheet.create({
    header: {
        rowGap: spacing.sm,
        marginTop: spacing.sm,
        flexDirection: "column",
        borderColor: colors.backgroundSecondary,
        alignItems: "flex-start",
        width: "100%",
    },
    headerText: {
        color: colors.textPrimary,
        fontSize: typography.sizeXl,
        paddingHorizontal: spacing.sm,
        fontWeight: typography.weightMedium,
        flex: 1,
        justifyContent: "center",
    },
    list: {
        ...globalStyles.container,
    },
    listContainter: {
        rowGap: spacing.sm,
        paddingBottom: spacing.xxxl * 2
    },
    buttonContainer: {
        flexDirection: "row",
        backgroundColor: colors.backgroundSecondary,
        paddingHorizontal: spacing.xs,
        paddingRight: spacing.sm,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
        alignItems: "center"
    },
    label: {
        fontSize: typography.sizeLg,
        color: colors.textPrimary,
        fontWeight: typography.weightRegular,
    },
    modalButton: {
        backgroundColor: colors.backgroundSecondary,
        color: colors.textPrimary,
        flexDirection: "row",
        fontSize: typography.sizeLg,
        fontWeight: typography.weightMedium,
        columnGap: spacing.xs,
        paddingVertical: 0,
        paddingHorizontal: spacing.sm,
        alignItems: "center",
        borderRadius: borderRadius.lg
    },
    buttonRow: {
        flexDirection: "row",
        columnGap: spacing.xs,
        justifyContent: "flex-start",
        width: "100%",
    },
})