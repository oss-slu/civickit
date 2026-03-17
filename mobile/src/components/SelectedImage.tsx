//mobile/src/components/SelectedImage.tsx
import { Image, StyleSheet, View } from 'react-native'
import { globalStyles, borderRadius, colors, palette, size, typography } from '../styles';
import IconButton from './IconButton';
import { CloseXIcon } from './Icons';

export default function SelectedImage({ source, onDeletePressed, width, height, style }: any) {
    const styles = StyleSheet.create({
        image: {
            width: width,
            height: height,
            borderRadius: borderRadius.md
        },
        buttonContainer: {
            position: 'absolute',
            justifyContent: "center"
        },
        button: {
            backgroundColor: palette.ckRed,
            margin: size.sm,
            fontWeight: typography.weightBold,
            height: size.xxl,
            borderWidth: 0,
            ...globalStyles.shadow
        }
    });

    return (
        <View style={style}>
            <Image source={{ uri: source }} style={styles.image} />
            <View style={styles.buttonContainer}>
                <IconButton onPress={() => onDeletePressed(source)}
                    style={styles.button}>
                    <CloseXIcon size={size.lg}
                        color={colors.textContrast} />
                </IconButton>
            </View>
        </View>
    )

}
