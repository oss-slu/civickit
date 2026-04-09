import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

export default function IssuePhotoScreen() {
    const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
        openCamera();
    }, [])


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
            //does not work on web, returns unusable uri
            if (!result.canceled) {
                setImages([...images, result.assets[0].uri]);
            }
        }
    };

    return (
        <View>
        </View>
    )
}
