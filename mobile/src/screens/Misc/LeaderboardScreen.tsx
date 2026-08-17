// mobile/src/screens/Stats/LeaderboardScreen.tsx
import { View, Text, FlatList, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { borderRadius, colors, globalStyles, palette, size, spacing, typography } from "../../styles";
import ModalDropdown from "../../components/ModalDropdown";
import { useEffect, useState } from "react";
import { CaretDownIcon, DownArrowIcon, UpArrowIcon } from "../../components/Icons";
import WrapperButton from "../../components/WrapperButton";
import { IssueCategoryArray } from "../../types/IssueCategoryArray";
import { IssueStatusArray } from "../../types/IssueStatusArray";
import CheckList from "../../components/CheckList";
import IssueCard from "../../components/IssueCard";
import { StaticScreenProps, useNavigation } from "@react-navigation/native";
import { GetNearbyIssueResponse } from "@civickit/shared";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackParams } from "../../types/StackParams";
import ExtendedIssueCard from "../../components/ExtendedIssueCard";
import ModalPopUp from "../../components/ModalPopup";
import Header from "../../components/Header";
import Button from "../../components/Button";
import { dbFormatted } from "../../utils/dbValues";

type Props = StaticScreenProps<{
    issues: any[];
    endorsementsOption?: boolean;
    dateReportedOption?: boolean;
    dateUpdatedOption?: boolean;
    distanceOption?: boolean;
}>;

export default function LeaderBoardScreen({ route }: Props) {
    const [sort, setSort] = useState("")
    const [isAscending, setIsAscending] = useState(true)
    const [visibleCategories, setVisibleCategories] = useState(IssueCategoryArray)
    const [visibleStatuses, setVisibleStatuses] = useState(IssueStatusArray)
    const [issues, setIssues] = useState(route.params.issues)
    const [sortOptions, setSortOptions] = useState<string[]>([])
    const [refreshing, setRefreshing] = useState(false)
    const navigation = useNavigation<StackNavigationProp<StackParams>>()
    //seeded with the old hardcoded value so the first frame is no worse than
    //before; Header reports its real height on layout and corrects this
    const [headerOffset, setHeaderOffset] = useState(spacing.xxxl)

    useEffect(() => {
        let arr = []
        if (route.params.endorsementsOption) {
            arr.push("Endorsements")
        }
        if (route.params.dateReportedOption) {
            arr.push("Date Reported")
        }
        if (route.params.dateUpdatedOption) {
            arr.push("Date Updated")
        }
        if (route.params.distanceOption) {
            arr.push("Distance")
        }

        setSortOptions(arr)
        if (arr.length > 0) {
            setSort(arr[0])
        }


    }, [])

    const resetFilter = () => {
        setVisibleCategories(IssueCategoryArray)
        setVisibleStatuses(IssueStatusArray)
    }

    useEffect(() => {
        const visibleIssues = route.params.issues.filter((issue: any) =>
            visibleCategories.map(i => dbFormatted(i)).includes(issue.category) &&
            visibleStatuses.map(i => dbFormatted(i)).includes(issue.status)
        )

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

    }, [sort, isAscending, visibleCategories, visibleStatuses])


    const list = issues.map((item: any, index: number) =>
        <ExtendedIssueCard
            issue={item}
            key={index.toString()}
            onPress={() => { navigation.navigate("Issue Details", { issue: item }) }}
        />
    )

    return (
        <View style={globalStyles.container}>
            <ScrollView
                style={{ ...styles.list, paddingTop: headerOffset + spacing.md }}
                contentContainerStyle={styles.listContainter}>
                {list}
            </ScrollView>
            <Header onBackPress={navigation.goBack}
                setOffset={(i: any) => setHeaderOffset(i)}
                style={styles.header}
            >
                <View style={styles.buttonRow}>
                    {sortOptions.length > 0 &&
                        <View style={styles.outlinedButton}>
                            <ModalDropdown
                                data={sortOptions}
                                onDataSelect={setSort}
                                defaultText={sort}
                                buttonStyle={styles.modalButton}
                                labelSuffix={<CaretDownIcon />} />

                            <WrapperButton style={{ ...styles.modalButton, width: typography.sizeXl }}
                                onPress={() => setIsAscending(!isAscending)}>
                                {isAscending ?
                                    <UpArrowIcon size={typography.sizeXl}
                                        color={colors.textSecondary}
                                    /> :
                                    <DownArrowIcon size={typography.sizeXl}
                                        color={colors.textSecondary}
                                    />}
                            </WrapperButton>
                        </View>
                    }
                    <ModalPopUp
                        buttonBody={
                            <View style={styles.modalButton}>
                                <Text style={styles.modalButton}>Filter</Text>
                                <CaretDownIcon style={styles.modalButton} />
                            </View>
                        }
                        buttonStyle={{
                            ...styles.outlinedButton,
                            borderColor: visibleCategories.length == IssueCategoryArray.length
                                ? colors.backgroundSecondary :
                                palette.ckYellow,
                            paddingVertical: spacing.sm,
                            paddingHorizontal: spacing.md
                        }}>
                        <ScrollView contentContainerStyle={styles.filterBody} style={{ maxHeight: 600 }}>
                            <Button text={"Reset"} onPress={resetFilter} style={styles.resetFilterButton} />

                            <View>
                                <Text style={styles.filterHeading}>Statuses</Text>
                                <CheckList
                                    data={IssueStatusArray}
                                    selectedValues={visibleStatuses}
                                    setSelectedValues={setVisibleStatuses}
                                />
                            </View>

                            <View>
                                <Text style={styles.filterHeading}>Categories</Text>
                                <CheckList
                                    data={IssueCategoryArray}
                                    selectedValues={visibleCategories}
                                    setSelectedValues={setVisibleCategories}
                                />
                            </View>
                        </ScrollView>
                    </ModalPopUp>
                </View>
            </Header>
        </View>
    )
}

const styles = StyleSheet.create({
    list: {
        ...globalStyles.container,
    },
    listContainter: {
        rowGap: spacing.sm
    },
    header: {
        columnGap: spacing.sm,
        borderBottomWidth: 3,
        borderColor: colors.backgroundSecondary
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "center",
        columnGap: spacing.xs,

    },
    headerText: {
        fontSize: typography.sizeLg,
        fontWeight: typography.weightMedium,
        color: colors.textPrimary
    },
    subtitle: {
        fontSize: typography.sizeMd,
        color: colors.textSecondary
    },
    subtitleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: spacing.md,
        marginVertical: spacing.xs,
    },
    card: {
        backgroundColor: colors.background,
        borderColor: colors.backgroundSecondary,
        borderRadius: borderRadius.lg + 4,
        borderWidth: 2
    },
    modalButton: {
        backgroundColor: colors.background,
        color: colors.textSecondary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        columnGap: spacing.xs,
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
    outlinedButton: {
        borderWidth: 4,
        borderColor: colors.backgroundSecondary,
        borderRadius: borderRadius.lg,
        flexDirection: "row",
        backgroundColor: colors.background,
        color: colors.textSecondary,
        paddingRight: spacing.sm
    },
    columnRowText: {
        color: colors.textPrimary,
    },
    rowContainer: {
        flexDirection: "row",
        backgroundColor: colors.backgroundSecondary,
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