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
import ENV from '../../config/env';
import LoadingScreen from "../Misc/LoadingScreen";
import Header from "../../components/Header";
import Leaderboard from "../../components/Leaderboard";

export default function ProfileScreen({ route }: any) {
    const { logout } = useAuth();
    const { user } = useAuth();
    const queryClient = useQueryClient()
    const [refreshing, setRefreshing] = useState(false);
    let dateJoined = new Date()

    if (user != null) {
        dateJoined = new Date(user.createdAt)
    }

    const navigation = useNavigation<StackNavigationProp<StackParams>>();
    const issuesQuery = useQuery({
        queryKey: ['issues', 'user'],
        queryFn: async () => {
            const response = await fetch(
                ENV.apiUrl + '/issues/user?id=' +
                user?.id
            );


            if (!response.ok) throw new Error('Failed to fetch');
            return response.json()
        }
    }, queryClient);

    const upvotesQuery = useQuery({
        queryKey: ['upvotes', 'user'],
        queryFn: async () => {
            const response = await fetch(
                ENV.apiUrl + '/issues/userUpvotes?id=' +
                user?.id
            );


            if (!response.ok) throw new Error('Failed to fetch');
            return response.json()
        }
    }, queryClient);

    const refetchQueries = () => {
        issuesQuery.refetch()
        upvotesQuery.refetch()
    }


    useFocusEffect(
        useCallback(() => {
            refetchQueries()
        }, [])
    )

    if (issuesQuery.isLoading || upvotesQuery.isLoading) {
        return <LoadingScreen />
    }

    if (issuesQuery.error != null) {
        return (
            <MessageView enableRefresh={true}
                onRefresh={issuesQuery.refetch}
                refreshing={refreshing}>
                {String(issuesQuery.error)}
            </MessageView>
        )
    }

    if (upvotesQuery.error != null) {
        return (
            <MessageView enableRefresh={true}
                onRefresh={upvotesQuery.refetch}
                refreshing={refreshing}>
                {String(upvotesQuery.error)}
            </MessageView>
        )
    }


    return (
        <View style={[globalStyles.container, { padding: 0 }]}>
            <ScrollView contentContainerStyle={[styles.container]}
                refreshControl={<RefreshControl
                    refreshing={refreshing}
                    onRefresh={refetchQueries} />}
            >

                <View>
                    <AccountIcon size={size.imageMd} color={palette.ckMediumGray} />
                </View>

                <View style={styles.stats}>

                    {issuesQuery.data.issues.length == 0 ?
                        <Text style={styles.statsText}>You haven't reported anything yet</Text> :
                        <View style={styles.statRow}>
                            <Text style={styles.statsText}>Issues Reported: {issuesQuery.data.issues.length}</Text>
                            <View style={styles.leaderboardContainer}>
                                <Leaderboard issues={issuesQuery.data.issues.reverse()} number={3} />
                            </View>

                            <WrapperButton style={{
                                ...styles.button,
                                flexDirection: "row",
                                columnGap: spacing.xs,
                            }}
                                onPress={() => {
                                    navigation.navigate("My Issues", {
                                        issues: issuesQuery.data.issues, endorsementsOption: true,
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
                        </View>
                    }
                    {upvotesQuery.data.issues.length == 0 ?
                        <Text style={styles.statsText}>You haven't endorsed anything yet</Text> :
                        <View style={styles.statRow}>
                            <Text style={styles.statsText}>Issues Endorsed: {upvotesQuery.data.issues.length}</Text>
                            <View style={styles.leaderboardContainer}>
                                <Leaderboard issues={upvotesQuery.data.issues.reverse()} number={3} />
                            </View>
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
                        </View>
                    }
                </View>

                <Text style={styles.statsText}>Joined {dateJoined.toLocaleDateString()}</Text>
                <Button text="Logout" onPress={logout} style={[styles.logoutButton]} />


            </ScrollView>

            <Header
                title={user?.name}
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
        paddingBottom: spacing.lg
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
        fontSize: typography.sizeLg,
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
    }
})