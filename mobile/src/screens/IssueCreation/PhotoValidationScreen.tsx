// mobile/src/screens/IssueScreation/PhotoValidationScreen.tsx
import { useContext } from 'react';
import { Dimensions, StyleSheet, View, } from 'react-native';
import Button from '../../components/Button';
import { borderRadius, colors, globalStyles, palette, spacing, typography } from '../../styles';
import { Image } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParams } from '../../types/StackParams';
import { ImagesContext, PhotoMetadataContext } from '../../contexts/FormContexts';
import type { PhotoMetadata } from '../../utils/photoMetadata';

import React from 'react';

type Props = {
    route: {
        params: {
            uri: string;
            metadata?: PhotoMetadata;
        }
    }
};

export default function PhotoValidationScreen({ route }: Props) {
    const uri = route.params.uri
    const metadata = route.params.metadata ?? {};
    const { images, setImages } = useContext(ImagesContext);
    const { photoMetadata, setPhotoMetadata } = useContext(PhotoMetadataContext);
    const navigation = useNavigation<StackNavigationProp<StackParams>>()
    const windowWidth = Dimensions.get('window').width;


    const onOK = () => {
        setImages([...images, uri])
        setPhotoMetadata([...photoMetadata, metadata])
        navigation.replace("Report An Issue", {})
    }

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: uri }}
                style={styles.picture}
            />
            <View style={styles.buttonRow}>
                <Button style={{ ...styles.button, borderColor: palette.ckRed }} onPress={() => { navigation.replace("Camera", {}) }}
                    text="Retry" />

                <Button style={{ ...styles.button, borderColor: palette.ckGreen }} onPress={onOK}
                    text="OK" />
            </View>

        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.ckVeryDarkGray
    },
    picture: {
        width: "100%",
        height: "100%",
        resizeMode: "center",
    },
    buttonRow: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-evenly",
        position: "absolute",
        bottom: spacing.xxl,
        flex: 1
    },
    button: {
        ...globalStyles.button,
        fontSize: typography.sizeXxl,
        borderRadius: borderRadius.lg,
        backgroundColor: palette.ckVeryDarkGray,
        color: colors.textContrast,
        borderWidth: 4,
    }
})
