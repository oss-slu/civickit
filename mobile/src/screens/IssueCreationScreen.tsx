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

export default function IssueCreationScreen() {
    const [images, setImages] = useState<string[]>([]);
    const [location, setLocation] = useState<userLocation | null>(null);
    const [address, setAddress] = useState<string>('Detecting location...');
    const [title, setTitle] = useState<string>("");
    const [category, setCategory] = useState<"POTHOLE" | "STREETLIGHT" | "GRAFFITI" | "ILLEGAL_DUMPING" | "BROKEN_SIDEWALK" | "TRAFFIC_SIGNAL" | "OTHER">();
    const [description, setDescription] = useState<string>("");
    const [submitAllowed, setSubmitAllowed] = useState<boolean>(false)
    const [submitButtonColor, setSubmitButtonColor] = useState<"#d1d1d1" | "#197a15">("#d1d1d1")

    const [isLoading, setIsLoading] = useState(false)
    const navigation = useNavigation<StackNavigationProp<StackParams>>()
    //TODO: implement tags

    //DO NOT LEAVE THIS HERE, TESTING PURPOSES ONLY
    const token = "REPLACE_WITH_VALID_TOKEN"

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
        setSubmitButtonColor("#197a15")
    } else if (submitAllowed && (
        title.length < 3 ||
        description.length == 0 ||
        category == null ||
        images.length == 0 ||
        address == "Detecting location...")) {
        setSubmitAllowed(false)
        setSubmitButtonColor("#d1d1d1")
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
                type: "success",
            });
            const issue = await response.json()
            navigation.replace('IssueDetails', { issue: issue })

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

    const styles = StyleSheet.create({
        container: {
            padding: 8,
            backgroundColor: "white"
        },
        imageContainer: {
            padding: 12,
            gap: 12,
            height: 224,
            backgroundColor: "#e7e7e7",
            borderRadius: 16,
            marginVertical: 4
        },
        textBox: {
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: "#e7e7e7",
            borderRadius: 16,
            marginVertical: 4
        },
        buttonRow: {
            padding: 4,
            flex: 1,
            gap: 8,
            flexDirection: "row",
            justifyContent: "flex-end",
            minHeight: 48,
            marginVertical: 4
        },
        imageButton: {
            marginLeft: 8
        },
        submitButton: {
            backgroundColor: submitButtonColor,
            borderRadius: 16,
        },
        submitButtonText: {
            color: "white",
            textAlign: "center",
            padding: 12
        },
        addressText: {
            marginVertical: 4,
        },
        addressContainer: {
            paddingHorizontal: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 4
        }
    });



    return (
        <KeyboardAwareScrollView enableOnAndroid enableAutomaticScroll extraScrollHeight={100}
            style={styles.container}>
            <TextInput onChangeText={setTitle}
                value={title}
                placeholder='Issue Title'
                style={styles.textBox}
                maxLength={100} />

            <View style={styles.buttonRow}>
                <AntDesign.Button name="camera" onPress={openCamera} iconStyle={styles.imageButton} borderRadius={16} size={24} />
                <AntDesign.Button name="picture" onPress={pickImage} iconStyle={styles.imageButton} borderRadius={16} size={24} />
            </View>

            <ScrollView style={styles.imageContainer}>
                <FlatList
                    data={images}
                    horizontal
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <SelectedImage source={item}
                            width={200}
                            height={200}
                            onDeletePressed={onImageDeletePressed}
                        />
                    )}
                />
            </ScrollView>

            <View style={styles.addressContainer}>
                <Entypo name="location-pin" size={20} color="black" />
                <Text style={styles.addressText}>{address}</Text>
            </View>

            <ModalDropdown
                data={categories}
                onDataSelect={handleSetCategory}
                defaultText="Choose a category" />

            <TextInput onChangeText={setDescription}
                value={description}
                placeholder='Issue Description...'
                style={{ ...styles.textBox, marginBottom: 8 }}
                multiline
                maxLength={500}
                numberOfLines={5}
                focusable
            />

            <TouchableOpacity onPress={handleSubmit}
                style={styles.submitButton}
                disabled={!submitAllowed}>
                <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
        </KeyboardAwareScrollView>
    )


};


