// mobile/src/screens/IssueScreation/CameraScreen.tsx
import * as ImagePicker from 'expo-image-picker';
import { useContext, useRef, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, FlashMode } from 'expo-camera';
import { MessageView } from '../../components/MessageView';
import Button from '../../components/Button';
import { borderRadius, colors, palette, size, spacing, typography } from '../../styles';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParams } from '../../types/StackParams';
import { FlashlightOffIcon, FlashlightOnIcon, FlipCameraIcon, LightingFillIcon, LightingOutlineIcon, PictureIcon, WarningIcon } from '../../components/Icons';
import WrapperButton from '../../components/WrapperButton';
import { FormStartedContext, ImagesContext, PhotoMetadataContext } from '../../contexts/FormContexts';
import { useNearbyIssues } from '../../contexts/NearbyIssuesContext';
import LoadingScreen from '../Misc/LoadingScreen';
import { extractPhotoMetadataFromExif } from '../../utils/photoMetadata';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocation } from '../../contexts/LocationContext';


export default function CameraScreen() {
    const { images, setImages } = useContext(ImagesContext);
    const { photoMetadata, setPhotoMetadata } = useContext(PhotoMetadataContext);
    const [facing, setFacing] = useState<CameraType>('back');
    const [flashOn, setFlashOn] = useState<FlashMode>('off')
    const [enableTorch, setEnableTorch] = useState<boolean>(false)
    const [permissions, requestPermission] = useCameraPermissions();
    const { formStarted, setFormStarted } = useContext(FormStartedContext)
    const { inBounds } = useLocation()

    const { data, isLoading, error } = useNearbyIssues()
    const ref = useRef<CameraView>(null);

    const navigation = useNavigation<StackNavigationProp<StackParams>>()
    //must stay above the permission/loading early returns below — hooks cannot
    //be called conditionally
    const insets = useSafeAreaInsets();


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

    if (isLoading) {
        return <LoadingScreen />
    }
    if (error != null) {
        return (
            <MessageView>
                {error}
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

        const photo = await ref.current?.takePictureAsync({ shutterSound: false, exif: true });
        if (photo?.uri) {
            navigation.replace("Photo Validation", {
                uri: photo.uri,
                metadata: extractPhotoMetadataFromExif(photo.exif)
            })
        }

    };



    const pickImage = async () => {

        if (images.length < 5) {
            const results = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.8,
                exif: true,
                allowsMultipleSelection: true,
                selectionLimit: 5 - images.length
            })
            if (!results.canceled) {
                const resultList = results.assets.map(r => r.uri)
                const metadataList = results.assets.map(r => extractPhotoMetadataFromExif(r.exif))
                setPhotoMetadata([...photoMetadata, ...metadataList]);
                setImages([...images, ...resultList]);
                if (!formStarted && data.issues.filter((i: any) => i.distance <= 15.24).length > 0) {
                    navigation.replace("DuplicateCheck", {})
                } else {
                    navigation.replace("Report An Issue", {})
                }

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

            <View style={[styles.upperButtonRow]}>
                <WrapperButton onPress={() => { setEnableTorch(!enableTorch) }} style={{
                    ...styles.roundButton,
                }}>
                    {enableTorch ? (
                        <FlashlightOnIcon color={palette.ckYellow}
                            size={size.lg} />
                    ) : (
                        <FlashlightOffIcon color={colors.textContrast}
                            size={size.lg} />
                    )}

                </WrapperButton>


                <View style={[styles.warningContainer]}>
                    <Text style={styles.warningText}>If you believe this is an emergency, please exit the app and dial 911 immediately.</Text>
                </View>

                <WrapperButton onPress={toggleFlash} style={{
                    ...styles.roundButton,
                }}>
                    {flashOn == 'on' ? (
                        <LightingFillIcon color={palette.ckYellow}
                            size={size.lg} />
                    ) : (
                        <LightingOutlineIcon color={colors.textContrast}
                            size={size.lg} />
                    )}

                </WrapperButton>
            </View>

            {!inBounds &&
                <View style={[styles.messageContainer,
                {
                    position: "absolute",
                    top: spacing.xxxl + spacing.xl
                },]}>
                    <WarningIcon size={typography.sizeLg} color={colors.textContrast} />
                    <Text style={styles.text}>Your are outside of our service area</Text>
                </View>
            }

            <View style={styles.lowerButtonRow}>

                <WrapperButton onPress={pickImage} style={{
                    ...styles.squareButton,
                }}>
                    <PictureIcon color={colors.textContrast}
                        size={size.lg} />
                </WrapperButton>

                <Button style={styles.takePicButton} onPress={takePicture}>
                </Button>

                <WrapperButton style={styles.flipButton} onPress={toggleCameraFacing}>
                    <FlipCameraIcon size={typography.sizeXxl} color={colors.textContrast} />
                </WrapperButton>


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
        //`top` is supplied inline from the safe-area inset. Without it this row
        //falls back to flow position y=0 and lands on the status bar, which is
        //survivable on android (~24pt) but not on iphone (44-59pt).
        position: "absolute",
        padding: spacing.sm,
        marginTop: spacing.sm,
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        rowGap: spacing.sm,
        alignContent: "center",
        alignItems: "flex-start",
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
    },
    messageContainer: {
        borderRadius: borderRadius.full,
        backgroundColor: palette.ckDark,
        opacity: 0.6,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        columnGap: spacing.sm,
    },
    text: {
        color: colors.textContrast,
        fontWeight: typography.weightMedium,
        fontSize: typography.sizeLg,

    },
    warningContainer: {
        backgroundColor: palette.ckDark,
        opacity: 0.6,
        width: "65%",
        alignSelf: "center",
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm
    },
    warningText: {
        color: colors.textContrast,
        fontSize: typography.sizeLg,
        fontWeight: typography.weightRegular,
        textAlign: "center",
        // lineHeight: typography.sizeLg + spacing.xs,
        // letterSpacing: 0.5
    }
})
