// mobile/src/screens/IssueCreation/IssueCreationScreen.tsx
import * as Location from 'expo-location';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { uploadImagesToCloudinary } from '../../services/cloudinaryService';
import { View, StyleSheet, ScrollView, TextInput, Text, FlatList } from 'react-native';
import { useFocusEffect, useNavigation, } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { showMessage } from "react-native-flash-message";
import { StackParams } from '../../types/StackParams';
import { borderRadius, colors, globalStyles, spacing, palette, size, typography } from '../../styles';
import { CaretDownIcon, PictureIcon, PlusIcon } from '../../components/Icons';
import { IssueCategoryArray } from '../../types/IssueCategoryArray';
import { extractResolvedLocationMetadata, formatResolvedAddress, ResolvedLocationMetadata } from '../../hooks/useResolvedAddress';
import { useAuth } from '../../contexts/AuthContext';
import { resolvePhotoMetadata } from '../../utils/photoMetadata';

import LoadingScreen from '../Misc/LoadingScreen';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import SelectedImage from '../../components/SelectedImage';
import ModalDropdown from '../../components/ModalDropdown';
import ENV from '../../config/env';
import { ImagesContext, PhotoMetadataContext, UserLocationContext, AddressContext, TitleContext, CategoryContext, DescriptionContext, FormStartedContext } from '../../contexts/FormContexts';
import { userLocation } from '../../types/userLocation';
import { PhotoMetadataSource } from '../../utils/photoMetadata';
import { useNearbyIssues } from '../../contexts/NearbyIssuesContext';

export default function IssueCreationScreen() {
    const { images, setImages } = useContext(ImagesContext);
    const { photoMetadata, setPhotoMetadata } = useContext(PhotoMetadataContext);
    const { location, setLocation } = useContext(UserLocationContext);
    const { address, setAddress } = useContext(AddressContext);
    const { title, setTitle } = useContext(TitleContext);
    const { category, setCategory } = useContext(CategoryContext);
    const { description, setDescription } = useContext(DescriptionContext);
    const { formStarted, setFormStarted } = useContext(FormStartedContext)
    const { refetch, isLoading, error } = useNearbyIssues();
    const [locationMetadata, setLocationMetadata] = useState<ResolvedLocationMetadata>({});
    const [deviceLocation, setDeviceLocation] = useState<userLocation | null>(null);
    const [locationSource, setLocationSource] = useState<PhotoMetadataSource | null>(null);
    const [submitAllowed, setSubmitAllowed] = useState<boolean>(false)

    const [isLoadingLocal, setIsLoading] = useState(false)
    const navigation = useNavigation<StackNavigationProp<StackParams>>()
    const { authToken } = useAuth();

    //get location
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('Location permission denied');
                return;
            }
            const loc = await Location.getCurrentPositionAsync({});
            setDeviceLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        })();
    }, []);

    useEffect(() => {
        if (!deviceLocation) return;

        const fallbackTakenAt = new Date().toISOString();
        const resolved = resolvePhotoMetadata(photoMetadata, { ...deviceLocation, takenAt: fallbackTakenAt });

        setLocation({ latitude: resolved.latitude, longitude: resolved.longitude });
        setLocationSource(resolved.locationSource);
        setLocationMetadata({});
        setAddress(resolved.locationSource === 'exif' ? 'Detecting photo location...' : 'Detecting phone location...');

        (async () => {
            const geocode = await Location.reverseGeocodeAsync({
                latitude: resolved.latitude,
                longitude: resolved.longitude,
            });

            //reverseGeocodeAsync does not work on web, will return []
            if (geocode.length > 0) {
                const formattedAddress = formatResolvedAddress(geocode[0]);
                if (formattedAddress) {
                    setAddress(formattedAddress);
                }
                setLocationMetadata(extractResolvedLocationMetadata(geocode[0]));
            }
        })();
    }, [deviceLocation, photoMetadata]);

    useFocusEffect(
        useCallback(() => {
            if (refetch != null) {
                refetch()
            }
            setFormStarted(true)
        }, [])
    )

    const onImageDeletePressed = (image: any) => {
        const imageIndex = images.indexOf(image);
        setImages(
            images.filter(i => i != image)
        )
        if (imageIndex >= 0) {
            setPhotoMetadata(photoMetadata.filter((_, index) => index !== imageIndex))
        }
    }

    const handleSetCategory = (issueCategory: any) => {
        setCategory(issueCategory.replace(/ /g, "_").toUpperCase())
    }

    //determine if ready to submit
    if (!submitAllowed &&
        title.length >= 3 &&
        description.length > 0 &&
        category != null &&
        images.length > 0 &&
        !address.startsWith("Detecting ")
    ) {
        setSubmitAllowed(true)
    } else if (submitAllowed && (
        title.length < 3 ||
        description.length == 0 ||
        category == null ||
        images.length == 0 ||
        address.startsWith("Detecting "))) {
        setSubmitAllowed(false)
    }

    //display loading if needed after submit
    if (isLoadingLocal) {
        return (
            <LoadingScreen />
        )
    }

    const handleCancel = () => {
        setImages([])
        setPhotoMetadata([])
        setLocation(null)
        setDeviceLocation(null)
        setLocationSource(null)
        setAddress('Detecting location...')
        setTitle("")
        setCategory(null)
        setDescription("")
        setFormStarted(false)

        navigation.popTo("Camera", {})
    }

    const handleSubmit = async () => {
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', category!);
            const fallbackLocation = deviceLocation ?? location!;
            const resolvedPhotoMetadata = resolvePhotoMetadata(photoMetadata, {
                latitude: fallbackLocation.latitude,
                longitude: fallbackLocation.longitude,
                takenAt: new Date().toISOString(),
            });

            formData.append('latitude', resolvedPhotoMetadata.latitude.toString());
            formData.append('longitude', resolvedPhotoMetadata.longitude.toString());
            formData.append('address', address);
            images.forEach(uri => {
                formData.append('images', { uri: uri, type: 'image/jpeg', name: 'photo.jpg' } as unknown as File);
            });

            if (!authToken) {
                navigation.navigate('Error', { errorMessage: 'Not authenticated' });
                throw new Error('No auth token available');
            }

            const totalStartTime = Date.now();
            const performanceLog = {
                timestamp: new Date().toISOString(),
                imageCount: images.length,
                times: {} as any,
            };

            setIsLoading(true);

            // Step 1: Upload images to Cloudinary
            let imageUrls: string[] = [];
            if (images.length > 0) {
                try {
                    const imageUploadStartTime = Date.now();
                    showMessage({
                        message: "Uploading images...",
                        backgroundColor: palette.ckGreen,
                        color: colors.textContrast
                    });
                    imageUrls = await uploadImagesToCloudinary(images, authToken);
                    performanceLog.times.imageUploadMs = Date.now() - imageUploadStartTime;
                } catch (uploadError) {
                    setIsLoading(false);
                    navigation.navigate('Error', { errorMessage: 'Image upload to Cloudinary failed' });
                    throw uploadError;
                }
            }

            // Step 2: Send issue data with image URLs to backend
            const requestBody = {
                title,
                description,
                category: category!,
                latitude: resolvedPhotoMetadata.latitude,
                longitude: resolvedPhotoMetadata.longitude,
                address,
                district: locationMetadata.district,
                subregion: locationMetadata.subregion,
                name: locationMetadata.name,
                locationSource: resolvedPhotoMetadata.locationSource,
                photoTakenAt: resolvedPhotoMetadata.photoTakenAt,
                photoTakenAtSource: resolvedPhotoMetadata.photoTakenAtSource,
                images: imageUrls
            };

            const backendStartTime = Date.now();
            const response = await fetch(ENV.apiUrl + '/issues/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(requestBody)
            });
            performanceLog.times.backendSubmitMs = Date.now() - backendStartTime;

            setIsLoading(false);

            if (!response.ok) {
                navigation.navigate('Error', { errorMessage: 'Upload Failed' });
                throw new Error("Issue could not be reported at this time");
            }

            performanceLog.times.totalMs = Date.now() - totalStartTime;
            console.log('Issue Creation Performance:', performanceLog);

            showMessage({
                message: "Issue reported! Thank you for making your community better",
                backgroundColor: palette.ckGreen,
                color: colors.textContrast
            });
            const issue = await response.json();
            setImages([])
            setPhotoMetadata([])
            setLocation(null)
            setDeviceLocation(null)
            setLocationSource(null)
            setAddress('Detecting location...')
            setTitle("")
            setCategory(null)
            setDescription("")
            navigation.replace("Camera", {})
            navigation.navigate('Issue Details', { issue: issue });

        } catch (error: any) {
            if (error.message.includes("latitude") || error.message.includes("longtitude")) {
                navigation.navigate('Error', { errorMessage: 'Location permission denied' })
                throw new Error("Location permission denied")
            } else if (error.message.includes("network")) {
                navigation.navigate('Error', { errorMessage: 'NetworkError' })
                throw new Error("Network Error")
            } else {
                navigation.navigate('Error', { errorMessage: "There was an error" })
                throw new Error(error.message)
            }

        }

    };

    const locationSourceLabel = locationSource === 'exif' ? 'From photo EXIF' : 'From phone GPS';


    return (
        <>
            <KeyboardAwareScrollView enableOnAndroid enableAutomaticScroll extraScrollHeight={100}
                style={styles.container}
                contentContainerStyle={{ gap: spacing.sm }}>

                <TextInput onChangeText={setTitle}
                    value={title}
                    placeholder='Issue Title'
                    style={styles.titleTextBox}
                    maxLength={100} />

                <View style={styles.imageContainer}>

                    <ScrollView >
                        <PictureIcon color={colors.textMuted}
                            size={size.imageLg} style={[styles.defaultImage,
                            images.length > 0 ? { display: "none" } : { display: "flex" }]} />

                        <FlatList
                            data={images}
                            horizontal
                            style={{ alignSelf: "center" }}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <SelectedImage source={item}
                                    width={size.imageLg}
                                    height={size.imageLg}
                                    onDeletePressed={onImageDeletePressed}
                                    style={{ marginHorizontal: spacing.sm }}
                                />
                            )}
                        />
                    </ScrollView>

                    <IconButton onPress={() => { navigation.navigate("Camera", { uri: images }) }}
                        style={images.length < 5 ? styles.photoButton : styles.disabledPhotoButton}
                        isDisabled={images.length >= 5}>
                        <PlusIcon color={colors.textContrast}
                            size={size.xl} />
                    </IconButton>
                </View>

                <View style={styles.addressContainer}>
                    <Text style={styles.locationLabel}>Location</Text>
                    <Text style={styles.addressText}>{address}</Text>
                    {locationSource && (
                        <Text style={styles.locationSourceText}>{locationSourceLabel}</Text>
                    )}
                </View>

                <ModalDropdown
                    data={IssueCategoryArray}
                    onDataSelect={handleSetCategory}
                    defaultText="Choose a category"
                    labelSuffix={<CaretDownIcon color={colors.textContrast} />}
                    buttonStyle={{ color: colors.textContrast, fontSize: typography.sizeLg }} />

                <TextInput onChangeText={setDescription}
                    value={description}
                    placeholder='Issue Description...'
                    style={styles.descTextBox}
                    multiline
                    numberOfLines={5}
                    maxLength={500}
                    focusable
                />
            </KeyboardAwareScrollView>

            <View style={styles.buttonRow}>

                <Button onPress={handleCancel}
                    style={{ ...styles.submitButton, backgroundColor: palette.ckRed }}
                    text="Cancel">
                </Button>

                <Button onPress={handleSubmit}
                    style={styles.submitButton}
                    isDisabled={!submitAllowed}
                    text="Submit">
                </Button>
            </View>
        </>

    )


};

const styles = StyleSheet.create({
    container: {
        ...globalStyles.container,
        flex: 1,
        gap: spacing.md,
        padding: spacing.md
    },
    imageContainer: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.lg,
        justifyContent: "space-between",
        alignContent: "center",
        paddingVertical: spacing.sm,
        gap: spacing.sm,
        height: "auto",

    },
    defaultImage: {
        alignSelf: "center",
    },
    buttonRow: {
        paddingHorizontal: spacing.md,
        gap: spacing.md,
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        width: "100%",
        position: "absolute",
        bottom: spacing.lg,
    },
    photoButton: {
        backgroundColor: palette.ckBlue,
        position: "absolute",
        bottom: spacing.sm,
        right: spacing.sm,
        ...globalStyles.shadow
    },
    disabledPhotoButton: {
        backgroundColor: palette.ckMediumGray,
        position: "absolute",
        bottom: spacing.sm,
        right: spacing.sm,
        ...globalStyles.shadow
    },
    submitButton: {
        fontSize: typography.sizeXxl,
        fontWeight: typography.weightBold,
        width: size.longButton,

        ...globalStyles.shadow
    },
    titleTextBox: {
        ...globalStyles.textBox,
        ...globalStyles.heading1,
        textAlign: "center"
    },
    descTextBox: {
        ...globalStyles.textBox,
        ...globalStyles.bodyText,
        height: "auto",
        color: colors.textPrimary
    },

    addressText: {
        color: colors.textPrimary,
        fontSize: typography.sizeLg
    },
    locationLabel: {
        color: colors.textSecondary,
        fontSize: typography.sizeSm,
        fontWeight: typography.weightBold,
        textTransform: "uppercase"
    },
    locationSourceText: {
        color: colors.textSecondary,
        fontSize: typography.sizeSm
    },
    addressContainer: {
        paddingHorizontal: spacing.xs,
        gap: spacing.xs
    }
});

