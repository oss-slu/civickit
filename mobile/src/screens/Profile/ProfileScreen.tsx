//mobile/src/screens/ProfileScreen.tsx
import IconButton from "../../components/IconButton";
import { MessageView } from "../../components/MessageView";
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from "react-native"
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { palette, colors, globalStyles, size, spacing, typography, borderRadius } from "../../styles";
import { useAuth } from "../../contexts/AuthContext";
import { EditIcon, RightArrowIcon, SettingsIcon, TrashIcon, UserIcon } from "../../components/Icons";
import Button from "../../components/Button";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackParams } from "../../types/StackParams";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from "expo-image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ENV from '../../config/env';
import LoadingScreen from "../Misc/LoadingScreen";
import Svg, { Circle } from "react-native-svg";

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
        <ScrollView contentContainerStyle={[styles.container]}
            refreshControl={<RefreshControl
                refreshing={refreshing}
                onRefresh={refetchQueries} />}
        >
            <Svg width="100%" height="100%" viewBox="0 0 100 100">
                <Circle cx="50" cy="50" r="10" stroke="blue" strokeWidth="2.5" fill="green" />
            </Svg>
            <IconButton style={{ ...styles.button, flexDirection: "row", columnGap: spacing.sm, alignSelf: "flex-end" }}
                onPress={() => navigation.navigate("Settings", {})}>
                <SettingsIcon color={styles.button.color} size={styles.button.fontSize} />
                <Text style={{ color: styles.button.color, fontSize: styles.button.fontSize }}>Settings</Text>
            </IconButton>

            <View style={styles.profilePicContainer}>

                <Image
                    source={require("../../../assets/avatars/greenAvatar.png")}
                    style={styles.profilePic} />

            </View>

            <Text style={globalStyles.heading1}>{user?.name}</Text>

            <View style={styles.stats}>

                <Text style={styles.statsText}>Joined {dateJoined.toLocaleDateString()}</Text>
                {issuesQuery.data.issues.length == 0 ?
                    <Text style={styles.statsText}>You haven't reported anything yet</Text> :
                    <View style={styles.statRow}>
                        <Text style={styles.statsText}>Issues Reported: {issuesQuery.data.issues.length}</Text>
                        <IconButton style={{
                            ...globalStyles.outlinedButton,
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
                            <Text style={{ fontSize: globalStyles.outlinedButton.fontSize, color: globalStyles.outlinedButton.color }}>My Issues</Text>
                            <RightArrowIcon
                                color={globalStyles.outlinedButton.color}
                                size={typography.sizeXl}
                            />
                        </IconButton>
                    </View>
                }
                {upvotesQuery.data.issues.length == 0 ?
                    <Text style={styles.statsText}>You haven't endorsed anything yet</Text> :
                    <View style={styles.statRow}>
                        <Text style={styles.statsText}>Issues Endorsed: {upvotesQuery.data.issues.length}</Text>
                        <IconButton style={{
                            ...globalStyles.outlinedButton,
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
                            <Text style={{ fontSize: globalStyles.outlinedButton.fontSize, color: globalStyles.outlinedButton.color }}>My Endorsements</Text>
                            <RightArrowIcon
                                color={globalStyles.outlinedButton.color}
                                size={typography.sizeXl}
                            />
                        </IconButton>
                    </View>
                }
                <View style={styles.statRow}>
                    <Text style={styles.statsText}>Events Attended:</Text>
                    <Text style={styles.statsText}>Coming Soon</Text>
                    {/* <IconButton style={{
                        ...globalStyles.outlinedButton,
                        flexDirection: "row",
                        columnGap: spacing.xs,
                    }}
                    >
                        <Text style={{ fontSize: globalStyles.outlinedButton.fontSize, color: globalStyles.outlinedButton.color }}>My Events</Text>
                        <RightArrowIcon
                            color={globalStyles.outlinedButton.color}
                            size={typography.sizeXl}
                        />
                    </IconButton> */}
                </View>
            </View>


            <Button text="Logout" onPress={logout} style={[styles.button, { backgroundColor: palette.ckRed }]} />


        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        ...globalStyles.container,
        alignItems: 'center',
        rowGap: spacing.md
    },
    button: {
        ...globalStyles.button,
        backgroundColor: palette.ckMediumGray,
        fontSize: typography.sizeLg,
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
        rowGap: spacing.sm
    },
    statRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%"
    },
    profilePicContainer: {

    },
    profilePic: {
        width: 200,
        height: 200,
        borderRadius: borderRadius.full,
    },
    editButton: {
        position: "absolute",
        bottom: 10,
        right: 10
    },
})