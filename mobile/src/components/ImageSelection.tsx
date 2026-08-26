//mobile/src/components/ImageSelection.tsx

import { View, StyleSheet } from "react-native"
import { PictureIcon, PlusIcon } from "./Icons"
import { borderRadius, colors, globalStyles, palette, size, spacing } from "../styles"
import SelectedImageGallery from "./SelectedImageGallery"
import WrapperButton from "./WrapperButton"
import { FormSource } from "../types/FormSource"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { StackParams } from "../types/StackParams"

export default function ImageSelection({ images, onImageDeletePressed = null, photoMetadata, imageWidth, imageHeight, source = 'ISSUE_CREATION' as FormSource, setImages = null, setPhotoMetadata = null }: any) {
    const navigation = useNavigation<StackNavigationProp<StackParams>>()

    const onImageDeletePressedLocal = (image: any) => {
        const imageIndex = images.indexOf(image);
        if (setImages != null && setPhotoMetadata != null) {
            setImages(
                images.filter((i: any) => i != image)
            )
            if (imageIndex >= 0) {
                setPhotoMetadata(photoMetadata.filter((_: any, index: number) => index !== imageIndex))
            }
        }
    }

    return (
        <View style={{ ...styles.imageContainer, height: imageHeight + spacing.sm * 2 }}>

            <View style={{ alignItems: "center" }}>
                <PictureIcon color={colors.textMuted}
                    size={source == 'ISSUE_CREATION' ? size.imageLg : size.imageMd} style={[styles.defaultImage,
                    images.length > 0 ? { display: "none" } : { display: "flex" }]} />


                <SelectedImageGallery images={images} metadata={photoMetadata} onDeletePressed={onImageDeletePressed ?? onImageDeletePressedLocal}
                    width={imageWidth} height={imageHeight} />
            </View>



            <WrapperButton onPress={() => { navigation.navigate("Camera", { source: source }) }}
                style={images.length < 3 ? styles.photoButton : styles.disabledPhotoButton}
                isDisabled={images.length >= 3}>
                <PlusIcon color={colors.textContrast}
                    size={size.xl} />
            </WrapperButton>
        </View>
    )
}

const styles = StyleSheet.create({
    imageContainer: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.lg,
        justifyContent: "space-between",
        alignContent: "center",
        paddingVertical: spacing.sm,
        gap: spacing.sm,

    },
    defaultImage: {
        alignSelf: "center",
    },
    photoButton: {
        backgroundColor: palette.ckGreen,
        position: "absolute",
        bottom: spacing.sm,
        right: spacing.sm,
        padding: spacing.sm,
        ...globalStyles.shadow
    },
    disabledPhotoButton: {
        backgroundColor: palette.ckMediumGray,
        position: "absolute",
        bottom: spacing.sm,
        right: spacing.sm,
        padding: spacing.sm,
        ...globalStyles.shadow
    },
})