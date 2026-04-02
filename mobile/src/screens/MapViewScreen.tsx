//mobile/src/screens/MapViewScreen.tsx
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useContext, useRef, useState } from 'react';
import { View, Animated, useAnimatedValue } from 'react-native';
import { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { StackParams } from '../types/StackParams';
import { LocationContext } from '../types/LocationContext';
import { userLocation } from '../types/userLocation';
import Pin from '../components/Pin';
import { colors, palette, size } from '../styles';
import MapView from "react-native-maps"
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import IssueListScreen from './IssueListScreen';
import CalloutPopup from '../components/CalloutPopup';
import { GetNearbyIssueResponse } from '@civickit/shared';


export default function MapViewScreen({ issues, refetch }: any) {
    const navigation = useNavigation<StackNavigationProp<StackParams>>();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = [36, "30%", "80%"]
    const [bottomSheetPos, setBottomSheetPos] = useState<String | number>(36);
    const [currentIssue, setCurrentIssue] = useState<GetNearbyIssueResponse | undefined>(undefined)
    const fadeAnim = useAnimatedValue(0);
    const posAnim = useAnimatedValue(0);
    const [paddingBottom, setPaddingBottom] = useState("110%")

    //get contexts from above layer(s)
    const location = useContext(LocationContext) as unknown as userLocation

    const onMarkerPress = (issue: GetNearbyIssueResponse) => {
        setCurrentIssue(issue)
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

    if (currentIssue != undefined && bottomSheetPos == snapPoints[2]) {
        closeCallout()
    } else if (currentIssue != undefined && bottomSheetPos < snapPoints[2]) {
        openCallout()
    }

    return (
        <View style={{ flex: 1 }}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                initialRegion={location ? {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                } : undefined}
                showsUserLocation
            >
                {issues.map((issue: any) =>
                    <Marker
                        key={issue.id}
                        coordinate={{ latitude: issue.latitude, longitude: issue.longitude }}
                        style={{}}
                        onPress={() => { onMarkerPress(issue) }}
                    >
                        <Pin issue={issue} />
                    </Marker>

                )}
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
                currentIssue != undefined ? { display: undefined } : { display: "none" }]}
            >
                <CalloutPopup
                    issue={currentIssue}
                    onClosePress={() => {
                        closeCallout(() => {

                            setCurrentIssue(undefined)
                        })


                    }}
                    onForwardPress={() => {
                        navigation.navigate("Issue Details", { issue: currentIssue! })
                    }}
                />
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
                onChange={(index: number) => { setBottomSheetPos(snapPoints[index]) }}
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

