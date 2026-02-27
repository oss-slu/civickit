//mobile/src/screens/IssueCreationScreen.tsx
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { MessageScreen } from '../components/MessageScreen';
import { userLocation } from '../types/userLocation';
import { Button, View, StyleSheet, ScrollView, TextInput, Modal, Text, TouchableOpacity, FlatList } from 'react-native';
import SelectedImage from '../components/SelectedImage';
import ModalDropdown from '../components/ModalDropdown';

export default function IssueCreationScreen() {
    const [images, setImages] = useState<string[]>([]);
    const [location, setLocation] = useState<userLocation | null>(null);
    const [address, setAddress] = useState<string>('Detecting location...');
    const [title, setTitle] = useState<string>("");
    const [category, setCategory] = useState<"Pothole" | "Steetlight" | "Trash" | "Graffiti" | "Other">();
    const [description, setDescription] = useState<string>("");
    const [submitAllowed, setSubmitAllowed] = useState<boolean>(false)
    const [key, setKey] = useState(0)
    //TODO: implement tags

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
        "Pothole", "Streetlight", "Trash", "Graffiti", "Other"
    ]

    const placeHolderSubmit = () => {
        console.log("Submitting Issue...")
    }
    // const handleSubmit = async () => {
    //     const formData = new FormData();
    //     formData.append('title', title);
    //     formData.append('description', description);
    //     formData.append('category', category);
    //     formData.append('latitude', location!.lat.toString());
    //     formData.append('longitude', location!.lng.toString());
    //     images.forEach(uri => {
    //         formData.append('images', { uri, type: 'image/jpeg', name: 'photo.jpg' } as any);
    //     });

    //     const response = await fetch('http://localhost:3000/api/issues', {
    //         method: 'POST',
    //         headers: { Authorization: `Bearer ${token}` },
    //         body: formData,
    //     });
    //     // Handle response...
    // };

    //determine if ready to submit
    if (!submitAllowed &&
        title.length > 0 &&
        description.length > 0 &&
        category != null &&
        address != null &&
        images.length > 0
    ) {
        setSubmitAllowed(true)

    } else if (submitAllowed && (
        title.length == 0 ||
        description.length == 0 ||
        category == null ||
        address == null ||
        images.length == 0)) {
        setSubmitAllowed(false)
    }

    return (
        <View>
            <TextInput onChangeText={setTitle}
                value={title}
                placeholder='title'
                style={styles.textBox}
                maxLength={100} />

            <Button title="Pick an image from camera roll" onPress={pickImage} />
            <Button title="Take photo" onPress={openCamera} />

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
                onDataSelect={setCategory}
                defaultText="Choose a category" />

            <TextInput onChangeText={setDescription}
                value={description}
                placeholder='description'
                style={styles.textBox}
                multiline
                maxLength={500} />
            <Button title="Submit" onPress={placeHolderSubmit} disabled={!submitAllowed} />
        </View>
    )
};


const styles = StyleSheet.create({
    images: {
        padding: 12,
        gap: 12
    },
    textBox: {
        borderWidth: 1,
        margin: 4,
        padding: 4
    }
});

//make an image componet with a delete button for removing from image list
//save formdata for submission process