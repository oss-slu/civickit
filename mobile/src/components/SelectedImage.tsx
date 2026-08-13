//mobile/src/components/SelectedImage.tsx
import { Image, StyleSheet, View } from 'react-native'
import { globalStyles, borderRadius, colors, palette, size, typography, spacing } from '../styles';
import WrapperButton from './WrapperButton';
import { CloseXIcon } from './Icons';

export default function SelectedImage({ source, metadata, onDeletePressed, width, height, style }: any) {

    let imageWidth = width
    let imageHeight = height * metadata.height / metadata.width
    if (metadata.orientation == 6) {
        imageHeight = height
        imageWidth = width * metadata.width / metadata.height
    }

    console.log(metadata)
    console.log(imageWidth, imageHeight)
    console.log(width, height)


    const styles = StyleSheet.create({
        container: {
            justifyContent: "center",
            alignItems: "center",
            width: width,
            height: height
        },
        image: {
            width: width,
            height: width,
            // borderRadius: borderRadius.md,
            resizeMode: "contain",
        },
        buttonContainer: {
            position: 'absolute',
            // justifyContent: "center",
            // alignItems: "center",
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
        <View style={{ ...styles.container, ...style, borderWidth: 2 }}>
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
