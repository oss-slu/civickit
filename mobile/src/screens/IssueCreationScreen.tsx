//mobile/src/screens/IssueCreationScreen.tsx
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { MessageView } from '../components/MessageView';
import { userLocation } from '../types/userLocation';
import { View, StyleSheet, ScrollView, TextInput, Text, FlatList, TouchableOpacity } from 'react-native';
import SelectedImage from '../components/SelectedImage';
import ModalDropdown from '../components/ModalDropdown';
import ENV from '../config/env';
import { useNavigation, } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack'
import { IssueCategory } from '../types/IssueCategory';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { showMessage } from "react-native-flash-message";
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import { StackParams } from '../types/StackParams';
import { borderRadius, colors, globalStyles, spacing, palette, size, typography } from '../styles';
import Button from '../components/Button';
import IconButton from '../components/IconButton';

export default function IssueCreationScreen() {
    const [images, setImages] = useState<string[]>([]);
    const [location, setLocation] = useState<userLocation | null>(null);
    const [address, setAddress] = useState<string>('Detecting location...');
    const [title, setTitle] = useState<string>("");
    const [category, setCategory] = useState<"POTHOLE" | "STREETLIGHT" | "GRAFFITI" | "ILLEGAL_DUMPING" | "BROKEN_SIDEWALK" | "TRAFFIC_SIGNAL" | "OTHER">();
    const [description, setDescription] = useState<string>("");
    const [submitAllowed, setSubmitAllowed] = useState<boolean>(false)

    const [isLoading, setIsLoading] = useState(false)
    const navigation = useNavigation<StackNavigationProp<StackParams>>()
    //TODO: implement tags

    //DO NOT LEAVE THIS HERE, TESTING PURPOSES ONLY
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJteS11c2VyIiwiaWF0IjoxNzcyODA5MzY4LCJleHAiOjE3NzM0MTQxNjh9.YlH0cHOZIfIRrq39g2U4M1OH1k6VaSRoDDxwOXaXQJM"

    //get location
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('Location permission denied');
                return;
            }
            const loc = await Location.getCurrentPositionAsync({});
            setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });

            const geocode = await Location.reverseGeocodeAsync({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            });

            //reverseGeocodeAsync does not work on web, will return []
            if (geocode.length > 0) {
                if (geocode[0].street != null) {
                    setAddress(`${geocode[0].street}, ${geocode[0].city}`);
                } else {
                    setAddress(`${geocode[0].city}`);
                }
                console.log(`${geocode[0].street}, ${geocode[0].city}`)
            }
        })();
    }, []);

    //handle images
    const pickImage = async () => {
        if (images.length < 5) {
            const results = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.8,
                allowsMultipleSelection: true,
                selectionLimit: 5 - images.length
            })
            if (!results.canceled) {
                //does not work on web, retruns unusable uri
                const resultList = results.assets.map(r => r.uri)
                setImages([...images, ...resultList]);
            }
        }

    };

    const openCamera = async () => {
        console.log("Opening camera")
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
            alert("Camera permission denied");
            return;
        }

        if (images.length < 5) {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                quality: 0.8,
            });
            //does not work on web, retruns unusable uri
            if (!result.canceled) {
                setImages([...images, result.assets[0].uri]);
            }
        }
    };

    const onImageDeletePressed = (image: any) => {
        setImages(
            images.filter(i => i != image)
        )
    }

    //handle categories
    const categories = [
        "Pothole", "Streetlight", "Trash", "Graffiti", "Broken Sidewalk", "Traffic Signal", "Other"
    ]
    const handleSetCategory = (issueCategory: any) => {
        if (issueCategory.replace(/ /g, "_").toUpperCase() in IssueCategory) {
            setCategory(issueCategory.replace(/ /g, "_").toUpperCase())
        } else if (issueCategory == "Trash") {
            setCategory("ILLEGAL_DUMPING")
        }


    }

    //determine if ready to submit
    if (!submitAllowed &&
        title.length >= 3 &&
        description.length > 0 &&
        category != null &&
        images.length > 0 &&
        address != "Detecting location..."
    ) {
        setSubmitAllowed(true)
    } else if (submitAllowed && (
        title.length < 3 ||
        description.length == 0 ||
        category == null ||
        images.length == 0 ||
        address == "Detecting location...")) {
        setSubmitAllowed(false)
    }

    //display loading if needed after submit
    if (isLoading) {
        return (
            <MessageView>
                Loading...
            </MessageView>
        )
    }

    const handleSubmit = async () => {
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', category!);
            formData.append('latitude', location!.latitude.toString());
            formData.append('longitude', location!.longitude.toString());
            images.forEach(uri => {
                formData.append('images', { uri: uri, type: 'image/jpeg', name: 'photo.jpg' } as unknown as File);
            });

            const request = new Request(ENV.apiUrl + '/issues/', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData
            })

            setIsLoading(true)

            const response = await fetch(request)
            setIsLoading(false)
            if (!response.ok) {
                navigation.navigate('Error', { errorMessage: 'Upload Failed' })
                throw new Error("Issue could not be reported at this time");
            }

            showMessage({
                message: "Issue reported! Thank you for making your community better",
                backgroundColor: palette.ckGreen,
                color: colors.textContrast
            });
            const issue = await response.json()
            navigation.replace('Issue Details', { issue: issue })

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


    return (
        <>
            <KeyboardAwareScrollView enableOnAndroid enableAutomaticScroll extraScrollHeight={300}
                style={styles.container}
                contentContainerStyle={{ gap: spacing.sm }}>

                <TextInput onChangeText={setTitle}
                    value={title}
                    placeholder='Issue Title'
                    style={styles.titleTextBox}
                    maxLength={100} />

                <ScrollView contentContainerStyle={styles.imageContainer}>
                    <AntDesign name="picture" color={colors.textMuted}
                        size={size.imageLg} style={[styles.defaultImage,
                        images.length > 0 ? { display: "none" } : { display: "flex" }]} />

                    <FlatList
                        data={images}
                        horizontal
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

                <View style={styles.addressContainer}>
                    <Entypo name="location-pin" size={typography.sizeXl} color={colors.textPrimary} />
                    <Text style={styles.addressText}>{address}</Text>
                </View>

                <ModalDropdown
                    data={categories}
                    onDataSelect={handleSetCategory}
                    defaultText="Choose a category..." />

                <TextInput onChangeText={setDescription}
                    value={description}
                    placeholder='Issue Description...'
                    style={styles.descTextBox}
                    multiline
                    numberOfLines={7}
                    maxLength={500}
                    focusable
                />
            </KeyboardAwareScrollView>

            <View style={styles.buttonRow}>
                <IconButton onPress={openCamera} style={styles.photoButton}>
                    <AntDesign name="camera" color={colors.textContrast}
                        size={size.lg} />
                </IconButton>

                <Button onPress={handleSubmit}
                    style={styles.submitButton}
                    isDisabled={!submitAllowed}
                    text="Submit">
                </Button>

                <IconButton onPress={pickImage} style={styles.photoButton}>
                    <AntDesign name="picture" color={colors.textContrast}
                        size={size.lg} />
                </IconButton>
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
        height: "auto"
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
        bottom: spacing.xxxl,
    },
    photoButton: {
        backgroundColor: palette.ckBlue,
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
    addressContainer: {
        paddingHorizontal: spacing.xs,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs
    }
});

