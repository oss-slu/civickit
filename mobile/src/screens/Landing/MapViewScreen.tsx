// mobile/src/screens/Landing/MapViewScreen.tsx
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useMemo, useRef, useState } from 'react';
import { View, Animated, useAnimatedValue } from 'react-native';
import { Circle, Geojson, LatLng, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { StackParams } from '../../types/StackParams';
import { useLocation } from '../../contexts/LocationContext';
import Pin from '../../components/Pin';
import { colors, palette, size } from '../../styles';
import MapView from "react-native-maps"
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import IssueListScreen from './IssueListScreen';
import CalloutPopup from '../../components/CalloutPopup';
import Cluster from '../../components/Cluster';
import { getDistance } from 'geolib';
import CalloutListPopup from '../../components/CalloutListPopup';

interface IssueCluster {
    issues: any[]
    latitude: number,
    longitude: number
}

export default function MapViewScreen({ ref, issues, refetch }: any) {
    const navigation = useNavigation<StackNavigationProp<StackParams>>();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = [36, "30%", "80%"]
    const [bottomSheetInd, setBottomSheetInd] = useState<number>(0);
    const [currentElement, setCurrentElement] = useState<any>(undefined)
    const fadeAnim = useAnimatedValue(0);
    const posAnim = useAnimatedValue(0);
    const [paddingBottom, setPaddingBottom] = useState("110%")
    //initial value matches the initialRegion delta (0.05) with the same
    //zoom factor used in onRegionChange, so the first render clusters the
    //same way as every render after the map settles
    const [pinTolerance, setPinTolerance] = useState(0.05 * 111 * 1000 * 0.05)
    const currentRegion = useRef<any>(null)

    //get contexts from above layer(s)
    const location = useLocation().location

    const onMarkerPress = (element: any) => {
        //large clusters zoom the map in instead of rendering a huge callout (#174)
        if (element.issues != undefined && element.issues.length > 10) {
            ref?.current?.animateToRegion({
                latitude: element.latitude,
                longitude: element.longitude,
                latitudeDelta: (currentRegion.current?.latitudeDelta ?? 0.05) / 3,
                longitudeDelta: (currentRegion.current?.longitudeDelta ?? 0.05) / 3,
            }, 300)
            return
        }
        setCurrentElement(element)
        openCallout()
    }


    const openCallout = () => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start(({ finished }) => {
        })
    }
    const closeCallout = (callback?: any) => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (callback != undefined) {
                callback()
            }
        });
    };
    const moveCallout = (toIndex: number, toPosition: number) => {
        if (toIndex != 2) {
            setPaddingBottom("110%")
            Animated.timing(posAnim, {
                toValue: toPosition - 132,
                duration: 200,
                useNativeDriver: true,
            }).start(({ finished }) => {
            })
        } else {
            setPaddingBottom("10%")
        }

    }

    if (currentElement != undefined && bottomSheetInd == 2) {
        closeCallout()
    } else if (currentElement != undefined && bottomSheetInd < 2) {
        openCallout()
    }

    // clusters
    // greedy pass: each unclaimed issue seeds a cluster and absorbs every
    // remaining issue within pinTolerance of it. Distances are always
    // measured from the seed pin (not a moving center), so results are
    // deterministic and every issue lands in exactly one marker.
    const createClusters = () => {
        if (issues == undefined) return []
        const remaining = [...issues]
        const viewList: any[] = []

        while (remaining.length > 0) {
            const seed = remaining.shift()
            const members = [seed]

            for (let k = remaining.length - 1; k >= 0; k--) {
                const distance = getDistance(
                    { latitude: seed.latitude, longitude: seed.longitude },
                    { latitude: remaining[k].latitude, longitude: remaining[k].longitude }
                )
                if (distance < pinTolerance) {
                    members.push(remaining[k])
                    remaining.splice(k, 1)
                }
            }

            if (members.length == 1) {
                viewList.push(seed)
            } else {
                //anchor the cluster at its seed pin rather than the member
                //centroid: seeds are always >= pinTolerance apart, so no two
                //markers can render fully on top of each other
                const cluster: IssueCluster = {
                    issues: members,
                    latitude: seed.latitude,
                    longitude: seed.longitude
                }
                viewList.push(cluster)
            }
        }

        return viewList
    }

    const markerList = useMemo(() => {
        return createClusters().map((entry: any) => {
            if (entry.issues != undefined) {
                //key by the seed (issues[0], where the marker is anchored) so
                //a marker keeps its native view across zoom changes instead of
                //remounting — rapid unmount/mount can drop markers on iOS
                return <Marker
                    key={entry.issues[0].id}
                    coordinate={{ latitude: entry.latitude, longitude: entry.longitude }}
                    style={{}}
                    onPress={() => { onMarkerPress(entry) }}
                >
                    <Cluster issues={entry.issues} />
                </Marker>
            } else {
                return <Marker
                    key={entry.id}
                    coordinate={{ latitude: entry.latitude, longitude: entry.longitude }}
                    style={{}}
                    onPress={() => { onMarkerPress(entry) }}
                >
                    <Pin issue={entry} />
                </Marker>
            }
        })
    }, [issues, pinTolerance])

    const onRegionChange = (Region: any) => {
        currentRegion.current = Region
        const newTolerance = Region.latitudeDelta * 111 * 1000 * 0.05
        if (newTolerance != pinTolerance) {
            setPinTolerance(newTolerance)
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <MapView
                provider={PROVIDER_GOOGLE}
                ref={ref}
                showsUserLocation={true}
                showsMyLocationButton={false}
                followsUserLocation={true}
                style={{ flex: 1 }}
                toolbarEnabled={false}
                onRegionChangeComplete={(Region) => onRegionChange(Region)}
                initialRegion={location ? {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                } : undefined}
            >
                {markerList}
            </MapView>

            <Animated.View
                style={[{
                    opacity: fadeAnim,
                    width: "100%",
                    transform: [{
                        translateY: posAnim
                    }],
                    position: "absolute",

                },
                currentElement != undefined ? { display: undefined } : { display: "none" }]}
            >
                {currentElement != undefined && currentElement.issues != undefined ?
                    <CalloutListPopup
                        cluster={currentElement}
                        onClosePress={() => {
                            closeCallout(() => {
                                setCurrentElement(undefined)
                            })
                        }}
                    /> : <CalloutPopup
                        issue={currentElement}
                        onClosePress={() => {
                            closeCallout(() => {
                                setCurrentElement(undefined)
                            })
                        }}
                        onForwardPress={() => {
                            navigation.navigate("Issue Details", { issue: currentElement! })
                        }}
                    />
                }

            </Animated.View>

            <BottomSheet
                ref={bottomSheetRef}
                snapPoints={snapPoints}
                enableDynamicSizing={false}
                enableContentPanningGesture={false}
                handleStyle={{
                    backgroundColor: colors.background,
                    height: size.xl,
                    justifyContent: "center"
                }}
                backgroundStyle={{
                    backgroundColor: colors.background
                }}
                handleIndicatorStyle={{
                    backgroundColor: palette.ckDarkGray,
                    width: size.xxxl
                }}
                backdropComponent={(props: any) => (
                    <BottomSheetBackdrop
                        {...props}
                        disappearsOnIndex={1}
                        appearsOnIndex={2}
                        enableTouchThrough={true}
                        pressBehavior={"collapse"}
                    />
                )}
                overDragResistanceFactor={0.5}
                enableOverDrag={false}
                onChange={(index: number) => {
                    setBottomSheetInd(index)
                }}
                onAnimate={(fromIndex, toIndex, fromPosition, toPosition) => {
                    moveCallout(toIndex, toPosition)
                }}
            >
                <IssueListScreen
                    issues={issues}
                    refetch={refetch}
                    style={{ paddingBottom: paddingBottom }}
                />
            </BottomSheet>
        </View>
    );
};

