//mobile/src/components/SelectedImage.tsx
import { Image, StyleSheet, View } from 'react-native'
import { globalStyles, borderRadius, colors, palette, size, typography, spacing } from '../styles';
import WrapperButton from './WrapperButton';
import { CloseXIcon } from './Icons';

export default function SelectedImage({ source, onDeletePressed, width, height, style }: any) {
    const styles = StyleSheet.create({
        container: {
            justifyContent: "center",
            alignItems: "center",
        },
        image: {
            width: width,
            height: height,
            borderRadius: borderRadius.md,
            resizeMode: "contain",
        },
        buttonContainer: {
            position: 'absolute',
            justifyContent: "center",
            alignItems: "center",
            bottom: spacing.xxl,
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
