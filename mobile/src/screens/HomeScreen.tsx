//mobile/src/screens/HomeScreen.tsx
import { useContext, useState } from "react";
import { LocationContext } from "../types/LocationContext";
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userLocation } from "../types/userLocation";
import { MessageView } from "../components/MessageView";
import { View, Text, StyleSheet } from 'react-native';
import { CategoryIcon, RefreshIcon, StatusIcon, WarningIcon } from '../components/Icons';
import { borderRadius, colors, globalStyles, palette, size, spacing, typography } from '../styles';
import { IssueCategoryArray } from "../types/IssueCategoryArray";
import { IssueStatusArray } from "../types/IssueStatusArray";

import FilterCheckList from "../components/FilterCheckList";
import IconButton from "../components/IconButton";
import ENV from '../config/env';
import LoadingScreen from "./LoadingScreen";
import MapViewScreen from "./MapViewScreen";

//mobile/src/screens/HomeScreen.tsx
export default function HomeScreen() {
    const [refreshing, setRefreshing] = useState(false)
    const [visibleCategories, setVisibleCategories] = useState(IssueCategoryArray)
    const [visibleStatuses, setVisibleStatuses] = useState(IssueStatusArray)

    //get contexts from above layer(s)
    const queryClient = useQueryClient()
    const location = useContext(LocationContext) as unknown as userLocation
    const { logout } = useAuth();

    //fetch issues from database 
    var { data, isLoading, error, refetch } = useQuery({
        queryKey: ['issues', 'nearby'],
        queryFn: async () => {
            console.log("url: ", ENV.apiUrl)
            const response = await fetch(
                ENV.apiUrl + '/issues/nearby?lat=' +
                location.latitude + '&lng=' + location.longitude + '&radius=5000'
            );
            console.log("fetch", response)
            if (!response.ok) throw new Error('Failed to fetch');
            return response.json();
        }
    }, queryClient);

    //check if still loading
    if (isLoading) {
        return (
            <LoadingScreen />
        )
    }

    //check if error has been thrown
    if (error != undefined) {
        return (
            <MessageView enableRefresh={true}
                onRefresh={refetch}
                refreshing={refreshing}>
                {String(error)}
            </MessageView>
        )
    }

    if (location.latitude == undefined ||
        location.longitude == undefined) {
        return (
            <MessageView enableRefresh={true}
                onRefresh={refetch}
                refreshing={refreshing}>
                Error: Please Reload
            </MessageView>
        )
    }
    const visibleIssues = data.issues.filter((issue: any) =>
        visibleCategories.map(i => i.toLowerCase()).includes(issue.category.replace(/_/g, " ").toLowerCase()) &&
        visibleStatuses.map(i => i.toUpperCase().replace(/ /g, "_")).includes(issue.status)
    )
    return (
        <View style={{ flex: 1 }}>

            <MapViewScreen
                issues={visibleIssues}
                refetch={refetch}
            />

            <View style={styles.overlay}>

                <View style={styles.buttonCol}>
                    <FilterCheckList
                        data={IssueCategoryArray}
                        buttonStyle={styles.button}
                        setSelectedValues={setVisibleCategories}
                    >
                        <CategoryIcon size={size.xl} style={{ alignSelf: "center" }} />
                    </FilterCheckList>

                    <FilterCheckList
                        data={IssueStatusArray}
                        buttonStyle={styles.button}
                        setSelectedValues={setVisibleStatuses}
                    >
                        <StatusIcon size={size.xl} style={{ alignSelf: "center" }} />
                    </FilterCheckList>

                </View>
                <View style={styles.buttonCol}>
                    <IconButton onPress={refetch}
                        style={styles.button}>
                        <RefreshIcon size={size.xl} style={{ alignSelf: "center", marginBottom: 2 }} />
                    </IconButton>
                    <IconButton onPress={logout}
                        style={[styles.button, styles.logoutButton]}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </IconButton>
                </View>
            </View>

            <View style={[styles.textContainer,
            {
                position: "absolute",
                bottom: spacing.xxxl + spacing.sm
            },
            (visibleStatuses.length == 0 || visibleCategories.length == 0) ? { display: undefined } : { display: "none" }
            ]}>
                <WarningIcon size={typography.sizeLg} color={colors.textContrast} />
                <Text style={styles.text}>All Issues Hidden</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    button: {
        width: "auto",
        ...globalStyles.shadow,
        backgroundColor: colors.background,
        color: colors.textPrimary,
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
    },
    callout: {
        height: "auto",
        backgroundColor: colors.background
    },
    calloutText: {
        fontSize: typography.sizeMd,
        color: colors.textPrimary
    },
    textContainer: {
        backgroundColor: palette.ckDark,
        padding: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center",
        ...globalStyles.shadow,
        flexDirection: "row",
        width: "auto",
        columnGap: spacing.xs,
    },
    text: {
        fontSize: typography.sizeLg,
        fontWeight: typography.weightBold,
        color: colors.textContrast,
    },
    statusText: {
        fontSize: typography.sizeSm,
        fontWeight: typography.weightBold,
        color: colors.textContrast,
    },
    overlay: {
        position: "absolute",
        flexDirection: "row",
        // justifyContent: "space-between",
        alignItems: "flex-start",
        width: "100%",
        margin: spacing.sm,
        columnGap: spacing.sm,
    },
    buttonCol: {
        flexDirection: "row",
        width: "auto",
        columnGap: spacing.sm,
        justifyContent: "flex-end",
    },
    logoutButton: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
    logoutText: {
        fontSize: typography.sizeSm,
        color: colors.textPrimary,
        fontWeight: typography.weightBold,
    },
})