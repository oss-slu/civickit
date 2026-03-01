//mobile/src/screens/IssueCreationScreen.tsx
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { MessageView } from '../components/MessageView';
import { userLocation } from '../types/userLocation';
import { Button, View, StyleSheet, ScrollView, TextInput, Text, FlatList, KeyboardAvoidingView, Alert } from 'react-native';
import SelectedImage from '../components/SelectedImage';
import ModalDropdown from '../components/ModalDropdown';
import ENV from '../config/env';
import { useNavigation } from '@react-navigation/native';
import { IssueCategory } from '../types/IssueCategory';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { showMessage } from "react-native-flash-message";
import AntDesign from '@expo/vector-icons/AntDesign';

export default function IssueCreationScreen() {
    const [images, setImages] = useState<string[]>([]);
    const [location, setLocation] = useState<userLocation | null>(null);
    const [address, setAddress] = useState<string>('Detecting location...');
    const [title, setTitle] = useState<string>("");
    const [category, setCategory] = useState<"POTHOLE" | "STREETLIGHT" | "GRAFFITI" | "ILLEGAL_DUMPING" | "BROKEN_SIDEWALK" | "TRAFFIC_SIGNAL" | "OTHER">();
    const [description, setDescription] = useState<string>("");
    const [submitAllowed, setSubmitAllowed] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState(false)
    const navigation = useNavigation();
    //TODO: implement tags

    //DO NOT LEAVE THIS HERE, TESTING PURPOSES ONLY
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJteS11c2VyIiwiaWF0IjoxNzcyMjE2MTM5LCJleHAiOjE3NzI4MjA5Mzl9.knjn8hY8sTmenxRuQ_hjgpO1q108zNwY0JVqJGhjH7I"

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
                setAddress(`${geocode[0].street}, ${geocode[0].city}`);
                console.log(`${geocode[0].street}, ${geocode[0].city}`)
            }
        })();
    }, []);

    const pickImage = async () => {
        if (images.length < 5) {
            const results = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.8,
                allowsMultipleSelection: true,
                selectionLimit: 5 - images.length
            })
            if (!results.canceled) {
                const resultList = results.assets.map(r => r.uri)
                setImages([...images, ...resultList]);
            }
        }

    };

    const openCamera = async () => {
        if (images.length < 5) {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                quality: 0.8,
            });
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

    const handleSubmit = async () => {
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', category);
            formData.append('latitude', location!.latitude.toString());
            formData.append('longitude', location!.longitude.toString());
            images.forEach(uri => {
                formData.append('images', { uri: uri, type: 'image/jpeg', name: 'photo.jpg' });
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
            navigation.replace('Issue Details', { issue: issue })

        } catch (error) {
            if (error.message.includes("latitude") || error.message.includes("longtitude")) {
                navigation.navigate('Error', { errorMessage: 'Location permission denied' })
                throw new Error("Location permission denied")
            }

        }

    };

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

    if (isLoading) {
        <MessageView>
            Loading...
        </MessageView>
    }


    return (
        <KeyboardAwareScrollView enableOnAndroid enableAutomaticScroll extraScrollHeight={100} >
            <TextInput onChangeText={setTitle}
                value={title}
                placeholder='title'
                style={styles.textBox}
                maxLength={100} />

            <View style={styles.container}>
                <AntDesign.Button name="camera" onPress={openCamera} iconStyle={styles.button} borderRadius={16} size={24} />
                <AntDesign.Button name="picture" onPress={pickImage} iconStyle={styles.button} borderRadius={16} size={24} />
            </View>

            <ScrollView style={styles.images}>
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

            <Text>{address}</Text>

            <ModalDropdown
                data={categories}
                onDataSelect={handleSetCategory}
                defaultText="Choose a category" />

            <TextInput onChangeText={setDescription}
                value={description}
                placeholder='description'
                style={styles.textBox}
                multiline
                maxLength={500}
                numberOfLines={5}
                focusable
            />

            <Button title="Submit" onPress={handleSubmit}
                color="#3e884a" disabled={!submitAllowed} />
        </KeyboardAwareScrollView>
    )
};


const styles = StyleSheet.create({
    images: {
        padding: 12,
        gap: 12,
        height: 200
    },
    textBox: {
        borderWidth: 1,
        margin: 4,
        padding: 4
    },
    container: {
        padding: 4,
        flex: 1,
        gap: 8,
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    button: {
        margin: 4,
        marginLeft: 8
    }
});

//make an image componet with a delete button for removing from image list
//save formdata for submission process