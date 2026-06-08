//mobile/src/components/SelectedImage.tsx
import { StyleSheet, View, } from 'react-native'
import { Image } from "expo-image"
import { globalStyles, borderRadius, colors, palette, size, typography, spacing } from '../styles';
import { CheckMarkCircleIcon, CloseXIcon } from './Icons';

export default function Avatar({ source, isSelected, style }: any) {
    const imgSource = "../../assets/avatars/" + source;
    const styles = StyleSheet.create({
        container: {
            justifyContent: "center",
            alignItems: "center",
        },
        image: {
            width: style.width,
            height: style.height,
            borderRadius: borderRadius.md,
            borderWidth: !isSelected ? 4 : 0,
            borderColor: palette.ckGreen
        },
        iconContainer: {
            position: 'absolute',
            top: spacing.sm,
            right: spacing.sm,
        },
        icon: {
            backgroundColor: palette.ckGreen,
            color: colors.textContrast,
            fontSize: typography.sizeXxl,
            borderRadius: borderRadius.full,
            padding: spacing.xs,
            paddingHorizontal: spacing.xs + 1
        }
    });

    return (
        <View style={{ ...styles.container, ...style }}>
            <Image source={source} style={styles.image} />
            <View style={styles.iconContainer}>
                <CheckMarkCircleIcon size={styles.icon.fontSize}
                    color={styles.icon.color}
                    style={styles.icon} />
            </View>
        </View>
    )

}
