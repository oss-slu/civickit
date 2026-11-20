//mobile/src/screens/ProfileScreen.tsx
import WrapperButton from "../../components/WrapperButton";
import { MessageView } from "../../components/MessageView";
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from "react-native"
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { palette, colors, globalStyles, size, spacing, typography, borderRadius } from "../../styles";
import { useAuth } from "../../contexts/AuthContext";
import { AccountIcon, EditIcon, RightArrowIcon, SettingsIcon, TrashIcon, UserIcon } from "../../components/Icons";
import Button from "../../components/Button";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackParams } from "../../types/StackParams";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from "expo-image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { issuesApi, queryKeys } from "../../api";
import LoadingScreen from "../Misc/LoadingScreen";
import Header from "../../components/Header";
import Leaderboard from "../../components/Leaderboard";
import CategoryPieChart from "../../components/CategoryPieChart";
import { IssueCategoryArray } from "../../types/IssueCategoryArray";
import { User } from "@civickit/shared";

export default function ProfileScreen({ route }: any) {
    const { logout } = useAuth();
    const { user } = useAuth();
    const { role } = useAuth();
    const { organization } = useAuth();
    const queryClient = useQueryClient()
    const [refreshing, setRefreshing] = useState(false);
    //seeded with the old hardcoded value so the first frame is no worse than
    //before; Header reports its real height on layout and corrects this
    const [headerOffset, setHeaderOffset] = useState(spacing.xxxl)

    // const [categoryNumbers, setCategoryNumbers] = useState<User>();

    /*
     * Role Based Access Control 
     */

    const isResponder =
        role === "ORG_MEMBER" ||
        role === "ORG_ADMIN";


    let dateJoined = new Date()

    if (user != null) {
        dateJoined = new Date(user.createdAt)
    }

    const navigation = useNavigation<StackNavigationProp<StackParams>>();

    const issuesQuery = useQuery({
        queryKey: queryKeys.issues.byUser(user?.id),
        enabled: !!user?.id,
        queryFn: ({ signal }) => issuesApi.getIssuesByUser(user!.id, { signal }),
    }, queryClient);

    const upvotesQuery = useQuery({
        queryKey: queryKeys.upvotes.byUser(user?.id),
        enabled: !!user?.id,
        queryFn: ({ signal }) => issuesApi.getIssuesUpvotedByUser(user!.id, { signal }),
    }, queryClient);

    const claimedIssuesQuery = useQuery({
        queryKey: ['issues', 'claimedByUser', user?.id],
        enabled: !!user?.id,
        queryFn: ({ signal }) => issuesApi.getIssuesClaimedByUser(user!.id, { signal }),
    }, queryClient);

    const claimedIssues = claimedIssuesQuery.data?.issues ?? [];
    const claimedIssuesCount = claimedIssuesQuery.data?.issues?.length ?? 0;
    const claimedCategoryNumbers: Record<string, number> = {};

    IssueCategoryArray.forEach((category) => {
        claimedCategoryNumbers[
            category.toUpperCase().replace(" ", "_")
        ] = 0;
    });

    claimedIssues.forEach((issue) => {
        claimedCategoryNumbers[issue.category] += 1;
    });

    const refetchQueries = () => {
        issuesQuery.refetch()
        upvotesQuery.refetch()
        claimedIssuesQuery.refetch()
    }

    useFocusEffect(
        useCallback(() => {
            refetchQueries()
        }, [])
    )

    // loading / error handling
    if (!isResponder && (issuesQuery.isLoading || upvotesQuery.isLoading)) {
        return <LoadingScreen />
    }

    if (!isResponder && issuesQuery.error != null) {
        return (
            <MessageView enableRefresh={true}
                onRefresh={issuesQuery.refetch}
                refreshing={refreshing}>
                {String(issuesQuery.error)}
            </MessageView>
        )
    }

    if (!isResponder && upvotesQuery.error != null) {
        return (
            <MessageView enableRefresh={true}
                onRefresh={upvotesQuery.refetch}
                refreshing={refreshing}>
                {String(upvotesQuery.error)}
            </MessageView>
        )
    }

    // Both queries stay disabled until the user id is known, so data can still
    // be absent here without either query having errored.
    if (!isResponder && issuesQuery.data == null || upvotesQuery.data == null) {
        return <LoadingScreen />
    }

    // profile screen
    return (
        <View style={[globalStyles.container, { padding: 0 }]}>
            <ScrollView contentContainerStyle={[styles.container, { paddingTop: headerOffset + spacing.md }]}
                refreshControl={<RefreshControl
                    refreshing={refreshing}
                    onRefresh={refetchQueries} />}
            >

                {/* REPORTER VIEW */}
                {!isResponder && (
                    <View style={styles.stats}>

                        <AccountIcon size={size.imageMd} color={palette.ckMediumGray} />

                        {issuesQuery.data!.issues.length == 0 ?
                            <Text style={styles.statsText}>You haven't reported anything yet</Text> :
                            <View style={styles.statRow}>
                                <Text style={styles.statsText}>Issues Reported: {issuesQuery.data!.issues.length}</Text>
                                <View style={styles.leaderboardContainer}>
                                    <Leaderboard issues={issuesQuery.data!.issues.reverse()} number={3} />
                                </View>

                                {issuesQuery.data!.issues.length > 3 &&
                                    <WrapperButton style={{
                                        ...styles.button,
                                        flexDirection: "row",
                                        columnGap: spacing.xs,
                                    }}
                                        onPress={() => {
                                            navigation.navigate("My Issues", {
                                                issues: issuesQuery.data!.issues, endorsementsOption: true,
                                                dateReportedOption: true, dateUpdatedOption: true, distanceOption: false,
                                            })
                                        }}
                                    >
                                        <Text style={{ fontSize: styles.button.fontSize, color: styles.button.color }}>More</Text>
                                        <RightArrowIcon
                                            color={styles.button.color}
                                            size={typography.sizeXl}
                                        />
                                    </WrapperButton>
                                }
                            </View>
                        }
                        {upvotesQuery.data.issues.length == 0 ?
                            <Text style={styles.statsText}>You haven't endorsed anything yet</Text> :
                            <View style={styles.statRow}>
                                <Text style={styles.statsText}>Issues Endorsed: {upvotesQuery.data.issues.length}</Text>
                                <View style={styles.leaderboardContainer}>
                                    <Leaderboard issues={upvotesQuery.data.issues.reverse()} number={3} />
                                </View>
                                {upvotesQuery.data.issues.length > 3 &&
                                    <WrapperButton style={{
                                        ...styles.button,
                                        flexDirection: "row",
                                        columnGap: spacing.xs,
                                    }}
                                        onPress={() => {
                                            navigation.navigate("My Endorsements", {
                                                issues: upvotesQuery.data.issues, endorsementsOption: true,
                                                dateReportedOption: true, dateUpdatedOption: true, distanceOption: false,
                                            })
                                        }}
                                    >
                                        <Text style={{ fontSize: styles.button.fontSize, color: styles.button.color }}>More</Text>
                                        <RightArrowIcon
                                            color={styles.button.color}
                                            size={typography.sizeXl}
                                        />
                                    </WrapperButton>
                                }
                            </View>
                        }

                        <Text style={styles.statsText}>Joined {dateJoined.toLocaleDateString()}</Text>
                        <Button text="Logout" onPress={logout} style={[styles.logoutButton]} />

                    </View>
                )}

                {/* RESPONDER VIEW */}
                {isResponder && (
                    <View style={styles.responderContainer}>

                        {/* TOP CONTENT */}
                        <View style={styles.responderTopContent}>

                            {/* ACCOUNT INFORMATION */}
                            <View style={styles.responderInfo}>
                                <AccountIcon size={size.imageSm} color={palette.ckMediumGray} />

                                <View style={styles.responderInfoBox}>
                                    <Text style={styles.responderTitle}>
                                        {user?.name ?? "Responder"}
                                    </Text>

                                    <Text style={styles.organizationText}>
                                        {organization?.name ?? "Organization"}
                                    </Text>

                                    <Text style={styles.roleText}>
                                        {role === "ORG_ADMIN"
                                            ? "Organization Admin"
                                            : "Organization Member"}
                                    </Text>

                                    <Text style={styles.roleText}>Joined {dateJoined.toLocaleDateString()}</Text>
                                </View>

                                <View style={styles.logoutBox}>
                                    <Button text="Logout" onPress={logout} style={[styles.logoutButton]} />
                                </View>
                            </View>


                            {/* RESPONDER STATISTICS */}
                            <View style={styles.responderStats}>

                                <View style={styles.statBox}>
                                    <Text style={styles.statNumber}>
                                        {claimedIssuesCount}
                                    </Text>

                                    <Text style={styles.statLabel}>
                                        Issues Claimed
                                    </Text>
                                </View>

                                <View style={styles.statBox}>
                                    <Text style={styles.statNumber}>
                                        {/* to be updated once updating is pushed */}
                                        0
                                    </Text>

                                    <Text style={styles.statLabel}>
                                        Issues Resolved
                                    </Text>
                                </View>

                                <View style={styles.statBox}>
                                    <Text style={styles.statNumber}>
                                        {/* to be updated once updating is pushed */}
                                        --
                                    </Text>

                                    <Text style={styles.statLabel}>
                                        Avg. Response Time
                                    </Text>
                                </View>
                            </View>

                            {/* CATEGORY PIE CHART */}
                            <CategoryPieChart categoryNumbers={claimedCategoryNumbers} />
                        </View>

                        {/* CLAIMED ISSUES */}
                        <View style={styles.responderActions}>

                            <WrapperButton
                                style={styles.claimedIssuesButton}
                                onPress={() => {
                                    navigation.navigate("My Claimed Issues", {
                                        issues: claimedIssuesQuery.data?.issues ?? [], endorsementsOption: true,
                                        dateReportedOption: true, dateUpdatedOption: true, distanceOption: false,
                                    })
                                }}
                            >
                                <Text style={styles.claimedIssuesButtonText}>
                                    Claimed Issues
                                </Text>

                                <RightArrowIcon
                                    color={colors.textContrast}
                                    size={typography.sizeXl}
                                />
                            </WrapperButton>

                        </View>



                    </View>
                )}

            </ScrollView>

            <Header
                title={user?.name}
                setOffset={(i: any) => setHeaderOffset(i)}
                onBackPress={navigation.goBack}>
                <WrapperButton style={{ ...styles.settingsButton, flexDirection: "row", columnGap: spacing.sm, alignSelf: "flex-end" }}
                    onPress={() => navigation.navigate("Settings", {})}>
                    <SettingsIcon color={styles.settingsButton.color} size={typography.sizeXl} />
                    <Text style={{ color: styles.settingsButton.color, fontSize: styles.settingsButton.fontSize, fontWeight: typography.weightMedium }}>Settings</Text>
                </WrapperButton>
            </Header>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        // ...globalStyles.container,
        alignItems: 'center',
        rowGap: spacing.sm,
        paddingTop: spacing.xxxl,
        paddingBottom: spacing.lg,
        flexGrow: 1
    },
    button: {
        backgroundColor: colors.background,
        color: colors.textSecondary,
        fontSize: typography.sizeLg,
        paddingVertical: spacing.xs,
        borderWidth: 4,
        borderColor: colors.backgroundSecondary,
        paddingHorizontal: spacing.md,
        width: "100%"
    },
    settingsButton: {
        ...globalStyles.button,
        backgroundColor: colors.background,
        borderWidth: 4,
        borderColor: colors.backgroundSecondary,
        fontSize: typography.sizeLg,
        color: colors.textSecondary
    },
    logoutButton: {
        ...globalStyles.button,
        backgroundColor: palette.ckRed,
        fontSize: typography.sizeMd,
        color: colors.textContrast
    },
    statsText: {
        fontSize: typography.sizeLg,
        color: colors.textPrimary,
        fontWeight: typography.weightMedium
    },
    stats: {
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        paddingHorizontal: spacing.md,
        rowGap: spacing.sm,
    },
    statRow: {
        flexDirection: "column",
        alignItems: "flex-start",
        width: "100%",
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
        padding: spacing.sm,
        rowGap: spacing.sm
    },
    profilePicContainer: {

    },
    leaderboardContainer: {
        width: "100%",
    },

    responderContainer: {
        width: "100%",
        flex: 1,
        paddingHorizontal: spacing.md,
        justifyContent: "space-between",
    },

    accountInfo: {
        alignItems: "center",
        rowGap: spacing.xs,
        paddingVertical: spacing.sm,
    },

    responderTitle: {
        fontSize: typography.sizeXl,
        fontWeight: typography.weightBold,
        color: colors.textPrimary,
        textAlign: "center",
    },

    organizationText: {
        fontSize: typography.sizeLg,
        fontWeight: typography.weightMedium,
        color: colors.textSecondary,
        textAlign: "center",
    },

    roleText: {
        fontSize: typography.sizeMd,
        color: colors.textSecondary,
        textAlign: "center",
    },

    responderTopContent: {
        width: "100%",
        rowGap: spacing.md,
    },

    responderInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        columnGap: spacing.xs,
    },

    responderInfoBox: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xs,
    },

    logoutBox: {
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
        padding: spacing.sm,
    },

    responderStats: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        columnGap: spacing.xs,
    },

    statBox: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xs,
    },

    statNumber: {
        fontSize: typography.sizeXl,
        fontWeight: typography.weightBold,
        color: colors.textPrimary,
    },

    statLabel: {
        fontSize: typography.sizeSm,
        color: colors.textSecondary,
        textAlign: "center",
    },

    responderActions: {
        width: "100%",
        rowGap: spacing.sm,
    },

    claimedIssuesButton: {
        ...globalStyles.button,
        backgroundColor: palette.ckGreen,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        columnGap: spacing.sm,
        paddingVertical: spacing.sm,
    },

    claimedIssuesButtonText: {
        fontSize: typography.sizeLg,
        fontWeight: typography.weightMedium,
        color: palette.ckLight,
    },
})