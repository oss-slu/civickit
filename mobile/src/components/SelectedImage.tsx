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
            resizeMode: "center",
        },
        buttonContainer: {
            position: 'absolute',
            justifyContent: "center",
            alignItems: "center",
            top: spacing.sm,
        },
        button: {
            backgroundColor: palette.ckRed,
            fontWeight: typography.weightBold,
            //width must match height: WrapperButton contributes borderRadius.full
            //but no dimensions, so a height-only box collapses to the icon's
            //width and the pill radius renders it as an oval
            width: size.xxl,
            height: size.xxl,
            borderWidth: 0,
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
