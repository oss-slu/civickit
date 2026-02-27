//mobile/src/components/SelectedImage.tsx
import { relative } from 'node:path';
import { Image, Button, StyleSheet, View } from 'react-native'

export default function SelectedImage({ source, onDeletePressed, width, height }: any) {
    const position = "absolute"
    const styles = StyleSheet.create({
        image: {
            width: width,
            height: height,

        },
        container: {
        },
        button: {
            width: 50,
            position: 'absolute'
        }
    });


    return (
        <View style={styles.container}>
            <Image source={{ uri: source }} style={styles.image} />
            <View style={styles.button}>
                <Button title='X' onPress={() => onDeletePressed(source)} />
            </View>
        </View>
    )

}
