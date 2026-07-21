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
import { getCenter, getDistance } from 'geolib';
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
    const [pinTolerance, setPinTolerance] = useState(0.5 * 111 * 1000 * 0.06)
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
    const createClusters = () => {
        if (issues == undefined) return []
        let viewList = structuredClone(issues)
        let i = 0
        while (i < viewList.length) {
            let j = 0
            while (j < viewList.length) {
                if (i != j) {
                    const distance = getDistance(
                        { latitude: viewList[i].latitude, longitude: viewList[i].longitude },
                        { latitude: viewList[j].latitude, longitude: viewList[j].longitude }
                    )

                    if (distance < pinTolerance) {
                        if (viewList[i].issues == undefined && viewList[j].issues == undefined) {
                            //neither is a cluster
                            const center = getCenter([
                                { latitude: viewList[i].latitude, longitude: viewList[i].longitude },
                                { latitude: viewList[j].latitude, longitude: viewList[j].longitude }
                            ])
                            if (center != false) {
                                const cluster: IssueCluster = {
                                    issues: [viewList[i], viewList[j]],
                                    latitude: center.latitude,
                                    longitude: center.longitude
                                }
                                viewList.push(cluster)
                                if (i > j) {
                                    viewList.splice(i, 1)
                                    viewList.splice(j, 1)
                                } else {
                                    viewList.splice(j, 1)
                                    viewList.splice(i, 1)
                                }

                            }
                        } else if ((viewList[i].issues != undefined) !== (viewList[j].issues != undefined)) {
                            //one of them is a cluster
                            let issueCluster: IssueCluster
                            let other
                            if (viewList[i].issues != undefined) {
                                issueCluster = viewList[i]
                                other = viewList[j]
                            } else {
                                issueCluster = viewList[j]
                                other = viewList[i]
                            }

                            const center = getCenter([
                                ...issueCluster.issues.map((issue: any) => {
                                    return {
                                        latitude: issue.latitude,
                                        longitude: issue.longitude
                                    }
                                }),
                                { latitude: other.latitude, longitude: other.longitude }
                            ])

                            if (center != false) {
                                const cluster: IssueCluster = {
                                    issues: [...issueCluster.issues, other],
                                    latitude: center.latitude,
                                    longitude: center.longitude
                                }
                                viewList.push(cluster)
                                if (i > j) {
                                    viewList.splice(i, 1)
                                    viewList.splice(j, 1)
                                } else {
                                    viewList.splice(j, 1)
                                    viewList.splice(i, 1)
                                }
                            }
                        } else {
                            //both are clusters
                            const center = getCenter([
                                ...viewList[i].issues.map((issue: any) => {
                                    return {
                                        latitude: issue.latitude,
                                        longitude: issue.longitude
                                    }
                                }),
                                ...viewList[j].issues.map((issue: any) => {
                                    return {
                                        latitude: issue.latitude,
                                        longitude: issue.longitude
                                    }
                                })
                            ])

                            if (center != false) {
                                const cluster: IssueCluster = {
                                    issues: [...viewList[i].issues, ...viewList[j].issues],
                                    latitude: center.latitude,
                                    longitude: center.longitude
                                }

                                viewList.push(cluster)
                                if (i > j) {
                                    viewList.splice(i, 1)
                                    viewList.splice(j, 1)
                                } else {
                                    viewList.splice(j, 1)
                                    viewList.splice(i, 1)
                                }
                            }
                        }

                        i--
                        break
                    }
                }
                j++

            }
            i++
        }

        return viewList
    }

    const markerList = useMemo(() => {
        return createClusters().map((entry: any) => {
            if (entry.issues != undefined) {
                //key by the cluster's member ids so it stays stable while
                //the same issues are grouped, and re-mounts when regrouped
                const clusterKey = entry.issues.map((issue: any) => issue.id).sort().join('-')
                return <Marker
                    key={clusterKey}
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

