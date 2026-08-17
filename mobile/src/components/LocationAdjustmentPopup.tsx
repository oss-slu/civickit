//mobile/src/components/LocationAdjustmentPopup.tsx
import { View, Text, TextInput, StyleSheet } from "react-native";
import ModalPopUp from "./ModalPopup";
import { colors, globalStyles, spacing, typography } from "../styles";
import MiniMap from "./MiniMap";
import { CheckMarkIcon, RecenterIcon, RefreshIcon, WarningIcon } from "./Icons";
import WrapperButton from "./WrapperButton";
import { useContext, useEffect, useRef, useState } from "react";
import { userLocation } from "../types/userLocation";
import { PhotoMetadataSource } from "@civickit/shared";
import { formatResolvedAddress } from "../hooks/useResolvedAddress";
import * as Location from 'expo-location';
import MapView from "react-native-maps";
import { AddressContext, UserLocationContext } from "../contexts/FormContexts";

export default function LocationAdjustmentPopup({ locationSource, setLocationSource, setIsAddressValid, isAddressValid, category, getLocation }: any) {
    const [isPopUpVisible, setIsPopupVisible] = useState(false)
    const [miniMapLocation, setMiniMapLocation] = useState<userLocation | null>(null)
    const [miniMapAddress, setMiniMapAddress] = useState<string>("")
    const { location, setLocation } = useContext(UserLocationContext);
    const { address, setAddress } = useContext(AddressContext);
    const [miniMapSource, setMiniMapSource] = useState<PhotoMetadataSource | null>(null)
    const mapRef = useRef<MapView | null>(null);

    useEffect(() => {
        setMiniMapAddress(address)
    }, [address])
    useEffect(() => {
        setMiniMapLocation(location)
    }, [location])
    useEffect(() => {
        setMiniMapSource(locationSource)
    }, [locationSource])

    const onNewLocationSubmit = async () => {
        setLocationSource(miniMapSource)
        setLocation(miniMapLocation)
        if (miniMapLocation) {
            const geocode = await Location.reverseGeocodeAsync({
                latitude: miniMapLocation.latitude,
                longitude: miniMapLocation.longitude,
            });

            if (geocode.length > 0) {
                const formattedAddress = formatResolvedAddress(geocode[0]);
                formattedAddress && setAddress(formattedAddress)
                setMiniMapAddress(formattedAddress)
            }
        }
        setIsPopupVisible(false)
    }

    const onUserEditsAddress = async (newAddress: string) => {
        setMiniMapAddress(newAddress)
        setMiniMapSource("user")
        const geocode = await Location.geocodeAsync(newAddress);

        if (geocode.length == 0) {
            setIsAddressValid(false)
            setMiniMapLocation({ latitude: 0, longitude: 0 })
        } else {
            setMiniMapLocation({ latitude: geocode[0].latitude, longitude: geocode[0].longitude })
            setIsAddressValid(true)
        }

    }

    const recenterMiniMap = () => {
        if (!miniMapLocation?.latitude || !miniMapLocation?.longitude) return;

        mapRef.current?.animateToRegion({
            latitude: miniMapLocation.latitude,
            longitude: miniMapLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        });
    };

    const onMarkerDragEnd = async (coordinate: any) => {
        setMiniMapLocation(coordinate)
        setMiniMapSource("user")
        const geocode = await Location.reverseGeocodeAsync({
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
        });

        if (geocode.length > 0) {
            const formattedAddress = formatResolvedAddress(geocode[0]);
            formattedAddress && setMiniMapAddress(formattedAddress)
        }
    }

    return (
        <ModalPopUp
            buttonBody={
                <Text style={{ ...styles.locationSourceText, textDecorationLine: 'underline' }}>This address doesn't look right.</Text>}
            buttonStyle={{ backgroundColor: colors.backgroundSecondary }}
            isVisible={isPopUpVisible}
            setIsVisible={setIsPopupVisible}
        >
            <View style={styles.popup}>
                <Text style={{ ...styles.locationSourceText, textAlign: "center" }}>Location accuracy is very important. Only change the address if you are sure it's incorrect.</Text>

                <View>

                    <MiniMap issue={{
                        status: "REPORTED",
                        latitude: miniMapLocation?.latitude,
                        longitude: miniMapLocation?.longitude,
                        category: category ? category : "OTHER"
                    }}
                        draggable
                        onMarkerDragEnd={onMarkerDragEnd}
                        ref={mapRef}
                    />

                    <View style={{ flexDirection: "row", position: "absolute", margin: spacing.xs, bottom: 0, right: 0, columnGap: spacing.xs }}>
                        <WrapperButton style={styles.mapButton} onPress={getLocation}>
                            <RefreshIcon color={colors.textPrimary} size={typography.sizeXl} />
                        </WrapperButton>
                        <WrapperButton style={styles.mapButton} onPress={recenterMiniMap}>
                            <RecenterIcon color={colors.textPrimary} size={typography.sizeXl} />
                        </WrapperButton>
                    </View>
                </View>

                <Text style={{ ...styles.locationSourceText, paddingBottom: spacing.sm }}>Press and hold on the pin to move it.</Text>

                <View style={styles.addressTextBox}>

                    {!isAddressValid && <View style={{ flexDirection: "row", columnGap: spacing.xs, alignItems: "center", paddingTop: spacing.xs }}>
                        <WarningIcon color={styles.locationSourceText.color} size={styles.locationSourceText.fontSize} />
                        <Text style={{ ...styles.locationSourceText, fontWeight: typography.weightMedium }}>Invalid Address</Text>
                    </View>}

                    <TextInput onChangeText={onUserEditsAddress}
                        value={miniMapAddress}
                        placeholder='Address...'
                        style={{ color: colors.textPrimary }}
                        multiline
                        numberOfLines={5}
                        maxLength={500}
                        focusable
                    />
                    {(miniMapLocation && miniMapLocation.latitude != 0 && miniMapLocation.longitude != 0) &&
                        <Text style={{ ...styles.locationSourceText }}>{"(" + miniMapLocation?.latitude}, {miniMapLocation?.longitude + ")"}</Text>
                    }
                </View>

                <WrapperButton style={styles.customLocationButton}
                    onPress={onNewLocationSubmit}
                    isDisabled={!isAddressValid}>
                    <CheckMarkIcon color={colors.textContrast} size={typography.sizeXl} />
                </WrapperButton>
            </View>
        </ModalPopUp>
    )
}

const styles = StyleSheet.create({

    customLocationButton: {
        paddingVertical: spacing.sm
    },
    popup: {
        flexDirection: "column",
        rowGap: spacing.sm,
        paddingBottom: spacing.sm
    },
    locationSourceText: {
        color: colors.textSecondary,
        fontSize: typography.sizeSm
    },
    mapButton: {
        backgroundColor: colors.background,
        padding: spacing.sm,
        ...globalStyles.shadow
    },
    addressTextBox: {
        ...globalStyles.textBox,
    },
})