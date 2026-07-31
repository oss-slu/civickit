// mobile/src/screens/Landing/LandingScreen.tsx
import { useCallback, useContext, useRef, useState } from "react";
import { useAuth } from '../../contexts/AuthContext';
import { MessageView } from "../../components/MessageView";
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AccountIcon, CaretDownIcon, DefaultCategoryIcon, FilterIcon, RecenterIcon, RefreshIcon, StatusIcon, WarningIcon } from '../../components/Icons';
import { borderRadius, colors, globalStyles, palette, size, spacing, typography } from '../../styles';
import { IssueCategoryArray } from "../../types/IssueCategoryArray";
import { IssueStatusArray } from "../../types/IssueStatusArray";

import CheckList from "../../components/CheckList";
import WrapperButton from "../../components/WrapperButton";
import LoadingScreen from "../Misc/LoadingScreen";
import MapViewScreen from "./MapViewScreen";
import { useNearbyIssues } from "../../contexts/NearbyIssuesContext";
import MapView from "react-native-maps";
import { useLocation } from "../../contexts/LocationContext";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import ModalPopUp from "../../components/ModalPopup";
import Button from "../../components/Button";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackParams } from "../../types/StackParams";

export default function LandingScreen({ children }: any) {
    const [isMinLoading, setIsMinLoading] = useState(false) //to avoid quick ui flicker when refetching data
    const [refreshing, setRefreshing] = useState(false)
    const [visibleCategories, setVisibleCategories] = useState(IssueCategoryArray)
    const [visibleStatuses, setVisibleStatuses] = useState(IssueStatusArray)
    const navigation = useNavigation<StackNavigationProp<StackParams>>()

    //get contexts from above layer(s)
    const { data, isLoading, isFetching, error, refetch } = useNearbyIssues()
    const location = useLocation().location

    const mapRef = useRef<MapView | null>(null);

    const handleRefresh = useCallback(() => {
        console.log("refresh")
        if (!isFetching && !isMinLoading) {
            setIsMinLoading(true);
            if (refetch != undefined) {
                refetch();
            }
            // Ensure animation plays for at least 800ms (one full spin)
            setTimeout(() => {
                setIsMinLoading(false);
            }, 800);
        }
    }, [isFetching, isMinLoading, refetch]);

    useFocusEffect(
        useCallback(() => {
            if (refetch != null) {
                refetch()
            }

        }, [])
    )


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

    const resetFilter = () => {
        setVisibleCategories(IssueCategoryArray)
        setVisibleStatuses(IssueStatusArray)
    }

    const visibleIssues = data.issues.filter((issue: any) =>
        visibleCategories.map(i => i.toLowerCase()).includes(issue.category.replace(/_/g, " ").toLowerCase()) &&
        visibleStatuses.map(i => i.toUpperCase().replace(/ /g, "_")).includes(issue.status)
    )

    return (
        <View style={{ flex: 1 }}>

            <MapViewScreen
                ref={mapRef}
                issues={visibleIssues}
                refetch={refetch}
            />

            <View style={styles.optionsBar}>

                <WrapperButton onPress={() => navigation.navigate("ProfileNav", {})}
                    style={styles.button}>
                    <AccountIcon size={styles.button.fontSize} color={styles.button.color} />
                </WrapperButton>

                {/* Will eventually be a dropdown of regions/neighbordhoods etc.. */}
                <View style={styles.region}>
                    <Text style={styles.regionText}>St. Louis, MO</Text>
                    <CaretDownIcon color={colors.textPrimary} size={typography.sizeLg} />
                </View>

                <ModalPopUp
                    buttonStyle={styles.button}
                    buttonBody={<FilterIcon size={styles.button.fontSize} color={styles.button.color} />}
                >
                    <ScrollView contentContainerStyle={styles.filterBody} style={{ maxHeight: 600 }}>
                        <Button text={"Reset"} onPress={resetFilter} style={styles.resetFilterButton} />
                        <View>
                            <Text style={styles.filterHeading}>Statuses</Text>
                            <CheckList
                                data={IssueStatusArray}
                                buttonStyle={styles.button}
                                selectedValues={visibleStatuses}
                                setSelectedValues={setVisibleStatuses}
                                checkBoxColor={palette.ckYellow}
                            />
                        </View>

                        <View>
                            <Text style={styles.filterHeading}>Categories</Text>
                            <CheckList
                                data={IssueCategoryArray}
                                buttonStyle={styles.button}
                                selectedValues={visibleCategories}
                                setSelectedValues={setVisibleCategories}
                                checkBoxColor={palette.ckBlue}
                            />
                        </View>
                    </ScrollView>
                </ModalPopUp>

                <WrapperButton onPress={handleRefresh}
                    style={styles.button}
                    loading={isFetching || isMinLoading}>
                    <RefreshIcon size={styles.button.fontSize} color={styles.button.color} />
                </WrapperButton>





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
        backgroundColor: colors.background,
        color: colors.textPrimary,
        fontSize: typography.sizeXxl,
        padding: spacing.sm
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
    optionsBar: {
        position: "absolute",
        left: 0,
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        margin: spacing.sd,
        backgroundColor: colors.background,
        borderRadius: borderRadius.full,
        padding: spacing.xs,
        paddingHorizontal: spacing.sm,
        columnGap: spacing.xs,
        ...globalStyles.shadow,
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

    region: {
        alignContent: "center",
        alignItems: "center",
        columnGap: spacing.xs,
        justifyContent: "center",
        borderWidth: 2,
        borderColor: colors.backgroundSecondary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        flexDirection: "row"
    },

    regionText: {
        fontSize: typography.sizeLg,
        fontWeight: typography.weightMedium
    }
})