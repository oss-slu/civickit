//mobile/src/components/SelectedImage.tsx
import { Image, StyleSheet, View } from 'react-native'
import { globalStyles, borderRadius, colors, palette, size, typography, spacing } from '../styles';
import WrapperButton from './WrapperButton';
import { CloseXIcon } from './Icons';

export default function SelectedImage({ source, metadata, onDeletePressed, width, height, style }: any) {

    // Dimensions come from the picker or camera asset. They are absent for a
    // photo whose asset reported none, in which case the image fills the frame
    // and the button sits in the frame's own corner.
    const intrinsicWidth = metadata?.width
    const intrinsicHeight = metadata?.height

    let imageWidth = width
    let imageHeight = height

    if (intrinsicWidth && intrinsicHeight) {
        if (intrinsicHeight >= intrinsicWidth) { //portrait
            imageHeight = height
            imageWidth = width * intrinsicWidth / intrinsicHeight
        } else { //landscape
            imageWidth = width
            imageHeight = height * intrinsicHeight / intrinsicWidth
        }
    }


    const styles = StyleSheet.create({
        container: {
            justifyContent: "center",
            alignItems: "center",
            width: width,
            height: height
        },
        image: {
            width: width,
            height: height,
            resizeMode: "contain",
        },
        // Positioned over the rendered photo rather than the container, so the
        // X sits on the image's own corner when it is letterboxed.
        buttonContainer: {
            position: 'absolute',
            top: (height - imageHeight) / 2 + spacing.sm,
            left: (width - imageWidth) / 2 + spacing.sm
        },
        button: {
            backgroundColor: palette.ckRed,
            fontWeight: typography.weightBold,
            borderWidth: 0,
            padding: spacing.sm,
            ...globalStyles.shadow
        }
    });

    return (
        <View style={{ ...styles.container, ...style }}>
            <Image source={{ uri: source }} style={styles.image} />
            <View style={styles.buttonContainer}>
                <WrapperButton onPress={() => onDeletePressed(source)}
                    style={styles.button}>
                    <CloseXIcon size={size.lg}
                        color={colors.textContrast} />
                </WrapperButton>
            </View>
        </View>
    )

}
