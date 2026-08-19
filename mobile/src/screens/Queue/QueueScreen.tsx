//mobile/src/screens/Queue/QueueScreen.tsx

import { RefreshControl, ScrollView, View, StyleSheet, Text, TextInput, Dimensions } from "react-native";
import { useNearbyIssues } from "../../contexts/NearbyIssuesContext";
import LoadingScreen from "../Misc/LoadingScreen";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackParams } from "../../types/StackParams";
import { useCallback, useEffect, useState } from "react";
import { borderRadius, colors, globalStyles, palette, size, spacing, typography } from "../../styles";
import Header from "../../components/Header";
import ModalPopUp from "../../components/ModalPopup";
import { CaretDownIcon, CloseXIcon, DownArrowIcon, FilterIcon, SearchIcon, UpArrowIcon } from "../../components/Icons";
import CheckList from "../../components/CheckList";
import ModalDropdown from "../../components/ModalDropdown";
import WrapperButton from "../../components/WrapperButton";
import { IssueStatusArray } from "../../types/IssueStatusArray";
import { useAuth } from "../../contexts/AuthContext";
import { GetNearbyIssueResponse } from "@civickit/shared";
import ExtendedIssueCard from "../../components/ExtendedIssueCard";
import Button from "../../components/Button";

export default function QueueScreen() {
    const { data, isLoading, isFetching, error, refetch } = useNearbyIssues()
    const [issues, setIssues] = useState([])
    const [refreshing, setRefreshing] = useState(false)
    const navigation = useNavigation<StackNavigationProp<StackParams>>()
    const [headerOffset, setHeaderOffset] = useState(spacing.xxxl)
    const { organization, user } = useAuth()
    const [sort, setSort] = useState("Endorsements")
    const [isAscending, setIsAscending] = useState(true)
    const sortOptions = ["Endorsements", "Date Reported", "Date Updated", "Distance"]


    const claimOptions = ["My Claims", `${organization.name}'s Claims`]
    const [visibleClaimers, setVisibleClaimers] = useState(claimOptions)
    const [search, setSearch] = useState("")

    const width = Dimensions.get("window").width
    const [textboxWdith, setTextboxWidth] = useState(width - spacing.sm * 7 - typography.sizeXl * 2)

    //TODO replace with formatted function when merged
    const orgCategories = organization.categoryScope.map((cat: any) => cat.toLowerCase().replace("_", " "))
    const [visibleCategories, setVisibleCategories] = useState(orgCategories)

    const queueStatuses = IssueStatusArray.filter((status: any) => !status.includes("Resolved") && status != "Closed")
    const [visibleStatuses, setVisibleStatuses] = useState(queueStatuses)
    const resetFilter = () => {
        setVisibleCategories(orgCategories)
        setVisibleStatuses(queueStatuses)
    }


    useEffect(() => {
        if (data.issues != null) {
            const visibleIssues = data.issues.filter((issue: any) => {
                if (issue.claimedById == null) {
                    return false
                }
                if (!visibleCategories.map((i: any) => i.toLowerCase()).includes(issue.category.replace(/_/g, " ").toLowerCase())) {
                    return false
                }
                if (!visibleStatuses.map((i: any) => i.toLowerCase()).includes(issue.status.replace(/_/g, " ").toLowerCase())) {
                    return false
                }

                if (search.length > 0) {
                    if (!issue.title.toLowerCase().includes(search.toLowerCase()) && !issue.description.toLowerCase().includes(search.toLowerCase())) {
                        return false
                    }

                }

                if (visibleClaimers.includes("My Claims")) {
                    if (issue.claimedById == user?.id) {
                        return true
                    }
                }

                if (visibleClaimers.includes(`${organization.name}'s Claims`)) {
                    if (issue.claimedByOrg.id == organization?.id && issue.claimedById != user?.id) {
                        return true
                    }
                }


                return false
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
            } else if (sort == "Date Updated") {
                visibleIssues.sort((a: any, b: any) => {
                    const aDate = new Date(a.updatedAt)
                    const bDate = new Date(b.updatedAt)

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
    }, [data, sort, isAscending, visibleCategories, visibleStatuses, visibleClaimers, search])


    useFocusEffect(
        useCallback(() => {
            if (refetch) {
                refetch()
            }
        }, [])
    )

    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        try {
            await refetch?.()
        } finally {
            setRefreshing(false)
        }
    }, [refetch])

    const compareArrs = (arr1: any, arr2: any) => {
        if (arr1.length != arr2.length) {
            return false
        }

        for (let i = 0; i < arr1.length; i++) {
            if (!arr1.includes(arr2[i])) {
                return false
            }
            if (!arr2.includes(arr1[i])) {
                return false
            }
        }
        return true
    }

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
        <View style={{ ...globalStyles.container, padding: 0, paddingHorizontal: spacing.sm }}>
            <ScrollView
                refreshControl={<RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh} />}
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
                <Text style={styles.headerText}>Your Queue</Text>
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
                                <Text style={{ fontSize: styles.modalButton.fontSize, fontWeight: styles.modalButton.fontWeight }}>Filter</Text>
                            </View>
                        }
                        buttonStyle={{
                            ...styles.modalButton,
                            borderColor: (visibleCategories.length == orgCategories.length &&
                                compareArrs(visibleStatuses, queueStatuses) &&
                                visibleClaimers.length == claimOptions.length
                            )
                                ? colors.backgroundSecondary :
                                palette.ckYellow,
                            paddingVertical: spacing.sm,
                            paddingHorizontal: spacing.sm,
                            borderWidth: 4
                        }}>
                        <ScrollView contentContainerStyle={styles.filterBody} style={{ maxHeight: 600 }}>
                            <Button text={"Reset"} onPress={resetFilter} style={styles.resetFilterButton} />

                            <View>
                                <Text style={styles.filterHeading}>Claims</Text>
                                <CheckList
                                    data={claimOptions}
                                    selectedValues={visibleClaimers}
                                    setSelectedValues={setVisibleClaimers}
                                    checkBoxColor={palette.ckLightGreen}
                                />
                            </View>
                            <View>
                                <Text style={styles.filterHeading}>Categories</Text>
                                <CheckList
                                    data={orgCategories}
                                    selectedValues={visibleCategories}
                                    setSelectedValues={setVisibleCategories}
                                    checkBoxColor={palette.ckDarkBlue}
                                />
                            </View>
                            <View>
                                <Text style={styles.filterHeading}>Statuses</Text>
                                <CheckList
                                    data={IssueStatusArray}
                                    selectedValues={visibleStatuses}
                                    setSelectedValues={setVisibleStatuses}
                                    checkBoxColor={palette.ckYellow}
                                />
                            </View>


                        </ScrollView>
                    </ModalPopUp>


                </View>

                <View style={styles.searchBar}>
                    <SearchIcon color={styles.searchBar.color} size={typography.sizeXl} />

                    <View style={{
                        flexDirection: "row", columnGap: spacing.xs,
                        backgroundColor: colors.backgroundSecondary,
                        borderRadius: borderRadius.full, marginRight: spacing.sm,
                    }}>
                        <TextInput style={{
                            ...globalStyles.textBox,
                            fontSize: styles.searchBar.fontSize,
                            flexGrow: 1, width: textboxWdith
                        }}
                            placeholder="Search..."
                            placeholderTextColor={colors.textSecondary}
                            value={search}
                            onChangeText={setSearch}
                        />
                        {search.length != 0 &&
                            <WrapperButton style={{ backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.full, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm }}
                                onPress={() => setSearch("")}>
                                <CloseXIcon color={styles.searchBar.color} size={typography.sizeXl} />
                            </WrapperButton>}
                    </View>
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
        // borderColor: colors.backgroundSecondary,
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
    searchBar: {
        flexDirection: "row",
        columnGap: spacing.xs,
        fontSize: typography.sizeLg,
        alignItems: "center",
        alignContent: "center",
        width: "100%",
        color: colors.textPrimary,

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
        width: "100%",
    },
    filterHeading: {
        fontWeight: typography.weightMedium,
        fontSize: typography.sizeMd
    },

    filterBody: {
        flexDirection: "column",
        rowGap: spacing.lg,
        justifyContent: "center"
    },

    resetFilterButton: {
        fontSize: typography.sizeMd,
        alignSelf: "flex-start",
        paddingHorizontal: spacing.lg,
        position: "absolute",
        right: 0
    },
})
