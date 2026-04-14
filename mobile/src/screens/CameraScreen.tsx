import * as ImagePicker from 'expo-image-picker';
import { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, Camera, FlashMode } from 'expo-camera';
import { MessageView } from '../components/MessageView';
import Button from '../components/Button';
import { borderRadius, colors, palette, size, spacing, typography } from '../styles';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParams } from '../types/StackParams';
import { FlashlightOffIcon, FlashlightOnIcon, FlipCameraIcon, LightingFillIcon, LightingOutlineIcon, PictureIcon } from '../components/Icons';
import IconButton from '../components/IconButton';
import { ImagesContext } from '../types/FormContexts';


export default function CameraScreen() {
    const { images, setImages } = useContext(ImagesContext);
    const [facing, setFacing] = useState<CameraType>('back');
    const [flashOn, setFlashOn] = useState<FlashMode>('off')
    const [enableTorch, setEnableTorch] = useState<boolean>(false)
    const [permissions, requestPermission] = useCameraPermissions();
    const ref = useRef<CameraView>(null);

    const navigation = useNavigation<StackNavigationProp<StackParams>>()

    //Permissions
    if (!permissions) {
        return <View />
    }

    if (!permissions.granted) {
        return (
            <MessageView>
                Camera Permission Needed
                <Button onPress={requestPermission}>
                    Grant Permission
                </Button>
            </MessageView>
        )
    }

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'))
    }

    const toggleFlash = () => {
        setFlashOn(current => (current === 'off' ? 'on' : 'off'))
    }



    const takePicture = async () => {

        const photo = await ref.current?.takePictureAsync({ shutterSound: false });
        if (photo?.uri) {
            navigation.replace("Photo Validation", { uri: photo.uri })
        }

    };

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
                navigation.replace("Report An Issue", {})
            }
        }

    };



    return (
        <View style={styles.container}>
            <CameraView ref={ref}
                style={{ flex: 1 }}
                animateShutter={false}
                facing={facing}
                mirror={true}
                flash={flashOn}
                enableTorch={enableTorch}
            />

            <View style={styles.upperButtonRow}>
                <IconButton onPress={() => { setEnableTorch(!enableTorch) }} style={{
                    ...styles.roundButton,
                }}>
                    {enableTorch ? (
                        <FlashlightOnIcon color={palette.ckYellow}
                            size={size.lg} />
                    ) : (
                        <FlashlightOffIcon color={colors.textContrast}
                            size={size.lg} />
                    )}

                </IconButton>

                <IconButton onPress={toggleFlash} style={{
                    ...styles.roundButton,
                }}>
                    {flashOn == 'on' ? (
                        <LightingFillIcon color={palette.ckYellow}
                            size={size.lg} />
                    ) : (
                        <LightingOutlineIcon color={colors.textContrast}
                            size={size.lg} />
                    )}

                </IconButton>
            </View>
            <View style={styles.lowerButtonRow}>

                <IconButton onPress={pickImage} style={{
                    ...styles.squareButton,
                }}>
                    <PictureIcon color={colors.textContrast}
                        size={size.lg} />
                </IconButton>

                <Button style={styles.takePicButton} onPress={takePicture}>
                </Button>

                <IconButton style={styles.flipButton} onPress={toggleCameraFacing}>
                    <FlipCameraIcon size={typography.sizeXxl} color={colors.textContrast} />
                </IconButton>


            </View>
        </View>
    )
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        height: "100%"
    },
    upperButtonRow: {
        position: "absolute",
        padding: spacing.sm,
        marginTop: spacing.sm,
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        rowGap: spacing.sm,
        alignContent: "center",
        alignItems: "center",
        alignSelf: "flex-end",
        width: "100%"
    },
    lowerButtonRow: {
        position: "absolute",
        bottom: spacing.xl,
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        columnGap: spacing.md,
        alignContent: "center",
        alignItems: "flex-end",
        alignSelf: "center",
    },
    takePicButton: {
        height: 100,
        width: 100,
        backgroundColor: palette.ckYellow,
        borderWidth: 5,
        borderColor: palette.ckLight,
        opacity: 0.9,
        marginHorizontal: spacing.sm
    },
    flipButton: {
        height: 60,
        width: 60,
        backgroundColor: palette.ckDark,
        opacity: 0.8,
    },
    roundButton: {
        height: 56,
        width: 56,
        backgroundColor: palette.ckDark,
        opacity: 0.6,
    },
    squareButton: {
        height: 56,
        width: 56,
        borderRadius: borderRadius.md,
        backgroundColor: palette.ckDark,
        opacity: 0.8

    }
})