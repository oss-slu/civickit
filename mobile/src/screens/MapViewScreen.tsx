//mobile/src/screens/MapViewScreen.tsx
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useContext, useRef } from 'react';
import { View, Text } from 'react-native';
import { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { StackParams } from '../types/StackParams';
import { LocationContext } from '../types/LocationContext';
import { userLocation } from '../types/userLocation';
import Pin from '../components/Pin';
import { borderRadius, colors, globalStyles, palette, size, spacing, typography } from '../styles';
import { StyleSheet } from 'react-native'
import MapView from "react-native-maps"
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import IssueListScreen from './IssueListScreen';
import { UpArrowIcon } from '../components/Icons';


export default function MapViewScreen({ issues, refetch, setIsListOpen }: any) {
    const navigation = useNavigation<StackNavigationProp<StackParams>>();
    const bottomSheetRef = useRef<BottomSheet>(null);

    //get contexts from above layer(s)
    const location = useContext(LocationContext) as unknown as userLocation

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
                    >
                        <Pin issue={issue} />


                        <Callout onPress={() => navigation.navigate('Issue Details', { issue: issue })}
                            tooltip={false}>
                            <View style={styles.callout}>
                                <Text>{issue.title}</Text>
                                <UpArrowIcon />
                                <Text>{issue.upvoteCount}</Text>
                            </View>
                        </Callout>
                    </Marker>

                )}
            </MapView>

            <BottomSheet
                ref={bottomSheetRef}
                snapPoints={["10%", "30%", "80%"]}
                enableDynamicSizing={false}
                enableContentPanningGesture={false}
                handleStyle={{
                    backgroundColor: colors.background,
                    height: size.xl
                }}
                backgroundStyle={{
                    backgroundColor: colors.background
                }}
                handleIndicatorStyle={{
                    backgroundColor: palette.ckDarkGray
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
            >
                <IssueListScreen issues={issues} refetch={refetch} />
            </BottomSheet>
        </View>
    );
};

const styles = StyleSheet.create({
    callout: {
        height: "auto",
        backgroundColor: colors.background
    },
    calloutText: {
        fontSize: typography.sizeMd,
        color: colors.textPrimary
    },
})