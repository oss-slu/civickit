//mobile/src/components/SelectedImage.tsx
import { Image, StyleSheet, View } from 'react-native'
import { borderRadius, colors, palette, size } from '../styles/theme';
import { globalStyles } from '../styles';
import AntDesign from '@expo/vector-icons/AntDesign';
import IconButton from './IconButton';

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
            width: size.xxl,
            height: size.xxl,
            justifyContent: "center",
            alignContent: "center",
            textAlign: "center",
            borderRadius: borderRadius.lg,
            margin: size.xs,
            flex: 1,
            paddingLeft: size.xxl / 2 - size.lg / 2,

        }
    });

    return (
        <View style={style}>
            <Image source={{ uri: source }} style={styles.image} />
            <View style={styles.buttonContainer}>
                <IconButton onPress={() => onDeletePressed(source)}
                    style={styles.button}>
                    <AntDesign name="close" size={size.lg}
                        color={colors.textContrast}
                        style={{ width: size.lg, height: size.lg }} />
                </IconButton>
            </View>
        </View>
    )

}
