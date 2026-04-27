//mobile/src/components/LeaderboardScreen.tsx
import { View, Text, FlatList, StyleSheet, ScrollView } from "react-native";
import { borderRadius, colors, globalStyles, palette, size, spacing, typography } from "../styles";
import ModalDropdown from "../components/ModalDropdown";
import { useEffect, useState } from "react";
import { CaretDownIcon, DownArrowIcon, UpArrowIcon } from "../components/Icons";
import IconButton from "../components/IconButton";
import { IssueCategoryArray } from "../types/IssueCategoryArray";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import { IssueStatusArray } from "../types/IssueStatusArray";
import FilterCheckList from "../components/FilterCheckList";
import IssueCard from "../components/IssueCard";
import { TouchableWithoutFeedback } from "@gorhom/bottom-sheet";
import { StaticScreenProps, useNavigation } from "@react-navigation/native";
import { GetNearbyIssueResponse } from "@civickit/shared";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackParams } from "../types/StackParams";

const sortOptions = ["Date Reported", "Date Updated", "Distance", "Upvotes"]
type Props = StaticScreenProps<{
    issues: any[];
}>;

export default function LeaderBoardScreen({ route }: Props) {
    const [sort, setSort] = useState("Upvotes")
    const [isAscending, setIsAscending] = useState(true)
    const [visibleCategories, setVisibleCategories] = useState(IssueCategoryArray)
    const [visibleStatuses, setVisibleSatatuses] = useState(IssueStatusArray)
    const [issues, setIssues] = useState(route.params.issues)
    const navigation = useNavigation<StackNavigationProp<StackParams>>()

    useEffect(() => {
        const visibleIssues = route.params.issues.filter((issue: any) =>
            visibleCategories.map(i => i.toLowerCase()).includes(issue.category.replace(/_/g, " ").toLowerCase()) &&
            visibleStatuses.map(i => i.toUpperCase().replace(/ /g, "_")).includes(issue.status)
        )

        if (sort == "Upvotes") {
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
                console.log(a.distance, b.distance, parseFloat(a.distance) - parseFloat(b.distance))
                return (parseFloat(a.distance) - parseFloat(b.distance)) * (isAscending ? -1 : 1)
            })
        }
        setIssues(visibleIssues)

    }, [sort, isAscending, visibleCategories, visibleStatuses])

    return (
        <FlatList
            ListHeaderComponent={
                <View>

                    <View style={styles.buttonRow}>
                        <View style={styles.outlinedButton}>
                            <ModalDropdown
                                data={sortOptions}
                                onDataSelect={setSort}
                                defaultText={sort}
                                buttonStyle={styles.modalButton}
                                labelSuffix={<CaretDownIcon />} />

                            <IconButton style={{ ...styles.modalButton, width: typography.sizeXl }}
                                onPress={() => setIsAscending(!isAscending)}>
                                {isAscending ?
                                    <UpArrowIcon size={typography.sizeXl}
                                        color={colors.textSecondary}
                                        style={{ width: typography.sizeXl }} /> :
                                    <DownArrowIcon size={typography.sizeXl}
                                        color={colors.textSecondary}
                                        style={{ width: typography.sizeXl }} />}
                            </IconButton>
                        </View>
                        <FilterCheckList
                            data={IssueCategoryArray}
                            setSelectedValues={setVisibleCategories}
                            buttonStyle={{
                                ...styles.outlinedButton,
                                borderColor: visibleCategories.length == IssueCategoryArray.length
                                    ? colors.backgroundSecondary :
                                    palette.ckYellow
                            }}>
                            <View style={styles.modalButton}>
                                <Text style={styles.modalButton}>Category</Text>
                                <CaretDownIcon style={styles.modalButton} />
                            </View>
                        </FilterCheckList>

                        <FilterCheckList
                            data={IssueStatusArray}
                            setSelectedValues={setVisibleSatatuses}
                            buttonStyle={{
                                ...styles.outlinedButton,
                                borderColor: visibleStatuses.length == IssueStatusArray.length
                                    ? colors.backgroundSecondary :
                                    palette.ckYellow
                            }}
                        >
                            <View style={styles.modalButton}>
                                <Text style={styles.modalButton}>Status</Text>
                                <CaretDownIcon style={styles.modalButton} />
                            </View>
                        </FilterCheckList>
                    </View>
                </View>
            }
            data={issues}
            style={styles.list}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => {
                const createdAt = new Date(item.createdAt)
                const updatedAt = new Date(item.updatedAt)
                return (
                    <View style={styles.card}>
                        <IssueCard
                            issue={item}
                            animated={false}
                            onPress={() => { navigation.navigate("Issue Details", { issue: item }) }}
                        />
                        <View style={styles.subtitleRow}>
                            <Text style={styles.subtitle}>Reported {createdAt.getMonth() + 1}/{createdAt.getDate()}/{createdAt.getFullYear()}</Text>
                            <Text style={styles.subtitle}>Last Updated {updatedAt.getMonth() + 1}/{updatedAt.getDate()}/{updatedAt.getFullYear()}</Text>
                        </View>
                    </View>
                )
            }}
            stickyHeaderIndices={[0]}

        />

    )
}

const styles = StyleSheet.create({
    list: {
        marginHorizontal: spacing.xs,
        ...globalStyles.container,
    },
    listContainer: {
        rowGap: spacing.xs,
    },
    buttonRow: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "center",
        columnGap: spacing.xs
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
        columnGap: spacing.xs
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
    },
    columnRowText: {
        color: colors.textPrimary,
    },
    rowContainer: {
        flexDirection: "row",
        backgroundColor: colors.backgroundSecondary,
    }

})