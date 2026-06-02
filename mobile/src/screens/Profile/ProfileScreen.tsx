//mobile/src/screens/ProfileScreen.tsx
import IconButton from "../../components/IconButton";
import { MessageView } from "../../components/MessageView";
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from "react-native"
import { useContext, useRef, useState } from "react";
import { palette, colors, globalStyles, size, spacing, typography, borderRadius } from "../../styles";
import { useAuth } from "../../contexts/AuthContext";
import { EditIcon, RightArrowIcon, SettingsIcon, TrashIcon, UserIcon } from "../../components/Icons";
import Button from "../../components/Button";
import { useNavigation } from "@react-navigation/native";
import { StackParams } from "../../types/StackParams";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from "expo-image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ENV from '../../config/env';
import LoadingScreen from "../Misc/LoadingScreen";

export default function ProfileScreen() {
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

    const refetchQueries = () => {
        issuesQuery.refetch()
        upvotesQuery.refetch()
    }

    return (
        <ScrollView contentContainerStyle={[styles.container]}
            refreshControl={<RefreshControl
                refreshing={refreshing}
                onRefresh={refetchQueries} />}>
            <IconButton style={{ ...styles.button, flexDirection: "row", columnGap: spacing.sm, alignSelf: "flex-end" }}
                onPress={() => navigation.navigate("Settings", {})}>
                <SettingsIcon color={styles.button.color} size={styles.button.fontSize} />
                <Text style={{ color: styles.button.color, fontSize: styles.button.fontSize }}>Settings</Text>
            </IconButton>

            <View style={styles.profilePicContainer}>
                {user?.profileImage != null ?
                    <Image
                        source={require("../../../assets/ProfilePlaceholder.png")}
                        style={styles.profilePic} /> :
                    <TrashIcon />}
                {/* Replace trashcan with User image once implemented */}
                <View style={styles.editButton}>
                    <IconButton
                        onPress={() => navigation.navigate("Avatar", {})} style={{ height: size.xxl, ...globalStyles.shadow }}>
                        <EditIcon color={colors.textContrast} size={typography.sizeXl} />
                    </IconButton>
                </View>
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
                            onPress={() => { navigation.navigate("My Issues", { issues: issuesQuery.data.issues }) }}
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
                            onPress={() => { navigation.navigate("My Endorsements", { issues: upvotesQuery.data.issues }) }}
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
                    <Text style={styles.statsText}>Events Attended: Coming Soon</Text>
                    <IconButton style={{
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
                    </IconButton>
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