import * as ImagePicker from 'expo-image-picker';
import { useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, CameraPictureOptions } from 'expo-camera';
import { MessageView } from '../components/MessageView';
import Button from '../components/Button';
import { borderRadius, colors, globalStyles, palette, size, spacing, typography } from '../styles';
import { Image } from "react-native";
import { StaticScreenProps, useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParams } from '../types/StackParams';
import { ImagesContext } from '../types/FormContexts';

import React from 'react';

type Props = StaticScreenProps<{
    uri: string;
}>;

export default function PhotoValidationScreen({ route }: Props) {
    const uri = route.params.uri
    const { images, setImages } = useContext(ImagesContext);
    const navigation = useNavigation<StackNavigationProp<StackParams>>()
    const windowWidth = Dimensions.get('window').width;


    const onOK = () => {
        setImages([...images, uri])
        navigation.replace("Report An Issue", {})
    }

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: uri }}
                style={styles.picture}
            />
            <View style={styles.buttonRow}>
                <Button style={{ ...styles.button, borderColor: palette.ckRed }} onPress={() => { navigation.replace("Camera", {}) }}
                    text="Retry" />

                <Button style={{ ...styles.button, borderColor: palette.ckGreen }} onPress={onOK}
                    text="OK" />
            </View>

        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.ckVeryDarkGray
    },
    picture: {
        width: "100%",
        height: "100%",
        resizeMode: "center",
    },
    buttonRow: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-evenly",
        position: "absolute",
        bottom: spacing.xxl,
        flex: 1
    },
    button: {
        ...globalStyles.button,
        fontSize: typography.sizeXxl,
        borderRadius: borderRadius.lg,
        backgroundColor: palette.ckVeryDarkGray,
        color: colors.textContrast,
        borderWidth: 4,
    }
})