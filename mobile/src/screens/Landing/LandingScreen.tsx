// mobile/src/screens/Landing/LandingScreen.tsx
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from '../../contexts/AuthContext';
import { MessageView } from "../../components/MessageView";
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AccountIcon, DefaultCategoryIcon, FilterIcon, RecenterIcon, RefreshIcon, StatusIcon, WarningIcon } from '../../components/Icons';
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { orgsApi } from "../../api";
import { geoJSON } from "leaflet";

export default function LandingScreen({ children }: any) {
    const insets = useSafeAreaInsets()
    const [isMinLoading, setIsMinLoading] = useState(false) //to avoid quick ui flicker when refetching data
    const [refreshing, setRefreshing] = useState(false)
    const [visibleCategories, setVisibleCategories] = useState(IssueCategoryArray)
    const [visibleStatuses, setVisibleStatuses] = useState(IssueStatusArray)

    const navigation = useNavigation<StackNavigationProp<StackParams>>()
    const { inBounds } = useLocation()

    //get contexts from above layer(s)
    const { data, isLoading, isFetching, error, refetch } = useNearbyIssues()
    const location = useLocation().location

    const [availableAreas, setAvailableAreas] = useState<any[]>([])
    const areaName = "St. Louis"
    const [visibleAreas, setVisibleAreas] = useState<any[]>([])
    const [allChecked, setAllChecked] = useState(true)
    //have 1 option represent "All of St. Louis" -> when checked, everything else is unchecked
    //get list of organizations and get their geofence's
    //write "get stl issues" route (or just make radius big enough that it covers all of stl) 
    //assign random colors to areas (relativly low opacity) -> like in cat stats
    //include colors on selected so can tell what's what w/o labels
    //or have labels appear on zoom in

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

    const getAreaOrgs = async () => {
        const activeorgs = await orgsApi.getAllActiveOrgs()
        const active = []
        for (let i = 0; i < activeorgs.length; i++) {
            const gf = toCoords(activeorgs[i])
            active.push({
                name: activeorgs[i].name,
                profilePhoto: activeorgs[i].profilePhoto,
                geofence: gf,
            })
        }

        setAvailableAreas(active)
    }

    useEffect(() => {
        getAreaOrgs()
    }, [])

    const toCoords = (gj: any) => {
        const c = gj.geofence.rows[0].st_asgeojson.coordinates[0][0].map((point: any) => ({ latitude: point[1], longitude: point[0] }))
        return c
    }

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

    const recenterMap = () => {
        if (!location?.latitude || !location?.longitude) return;

        mapRef.current?.animateToRegion({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        });
    };

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

            <View style={[styles.topBar]}>

                <View style={styles.optionsBar}>

                    <WrapperButton onPress={() => navigation.navigate("ProfileNav", {})}
                        style={styles.button}>
                        <AccountIcon size={styles.button.fontSize} color={styles.button.color} />
                    </WrapperButton>


                    <View style={styles.region}>
                        <Text style={styles.regionText}
                            numberOfLines={1}
                            ellipsizeMode="tail">St. Louis, MO</Text>
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

                <WrapperButton onPress={recenterMap}
                    style={styles.recenterButton}>
                    <RecenterIcon size={styles.recenterButton.fontSize} color={styles.recenterButton.color} />
                </WrapperButton>
            </View>

            {!inBounds &&
                <View style={[styles.textContainer,
                {
                    position: "absolute",
                    top: spacing.xxxl + spacing.sm
                },]}>
                    <WarningIcon size={typography.sizeLg} color={colors.textContrast} />
                    <Text style={styles.text}>You are outside of our service area</Text>
                </View>

            }

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
    //the options bar and the recenter button are laid out as one row so the gap
    //between them is enforced by flexbox rather than by hoping two
    //independently-positioned overlays never grow into each other.
    //`top` is supplied inline from the safe-area inset.
    topBar: {
        position: "absolute",
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: spacing.sd,
        columnGap: spacing.sd,
    },
    optionsBar: {
        //shrinks instead of pushing the recenter button off-screen
        flexShrink: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
        borderRadius: borderRadius.full,
        padding: spacing.xs,
        paddingHorizontal: spacing.sm,
        columnGap: spacing.xs,
        ...globalStyles.shadow,
    },
    recenterButton: {
        //matches the options bar's height: spacing.xs of bar padding plus
        //spacing.sm of button padding equals spacing.sd around the same 28pt icon
        flexShrink: 0,
        backgroundColor: colors.background,
        color: colors.textPrimary,
        padding: spacing.sd,
        fontSize: typography.sizeXxl,
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
        //the only child that can give up width when the bar is squeezed. RN
        //defaults flexShrink to 0, so without this the icon buttons keep their
        //full size and overflow the bar's rounded background instead.
        flexShrink: 1,
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
        flexShrink: 1,
        fontSize: typography.sizeLg,
        fontWeight: typography.weightMedium
    }
})