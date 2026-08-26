// mobile/src/screens/IssueScreation/PhotoValidationScreen.tsx
import { useContext } from 'react';
import { Dimensions, StyleSheet, View, } from 'react-native';
import Button from '../../components/Button';
import { borderRadius, colors, globalStyles, palette, spacing, typography } from '../../styles';
import { Image } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParams } from '../../types/StackParams';
import type { PhotoMetadata } from '@civickit/shared';
import { FormStartedContext as CreationFormStartedContext, ImagesContext as CreationImagesContext, PhotoMetadataContext as CreationPhotoMetadataContext } from '../../contexts/CreationFormContexts';
import { CurrentIssueContext, FormStartedContext as UpdateFormStartedContext, ImagesContext as UpdateImagesContext, PhotoMetadataContext as UpdatePhotoMetadataCotnext } from '../../contexts/UpdateFormContexts';
import React from 'react';
import { useNearbyIssues } from '../../contexts/NearbyIssuesContext';
import { FormSource } from '../../types/FormSource';

type Props = {
    route: {
        params: {
            uri: string;
            metadata?: PhotoMetadata;
            source: FormSource
        }
    }
};


export default function PhotoValidationScreen({ route }: Props) {
    const uri = route.params.uri
    const metadata = route.params.metadata ?? {};
    const source = route.params.source
    const { images, setImages } = source == 'ISSUE_CREATION' ? useContext(CreationImagesContext) : useContext(UpdateImagesContext)
    const { formStarted, setFormStarted } = source == 'ISSUE_CREATION' ? useContext(CreationFormStartedContext) : useContext(UpdateFormStartedContext)
    const { photoMetadata, setPhotoMetadata } = source == 'ISSUE_CREATION' ? useContext(CreationPhotoMetadataContext) : useContext(UpdatePhotoMetadataCotnext)
    const { currentIssue } = useContext(CurrentIssueContext)
    const navigation = useNavigation<StackNavigationProp<StackParams>>()
    const { data } = useNearbyIssues()


    const onOK = () => {
        setImages([...images, uri])
        setPhotoMetadata([...photoMetadata, metadata])
        if (source == 'ISSUE_CREATION') {
            if (!formStarted && data.issues.filter((i: any) => i.distance <= 15.24).length > 0) {
                navigation.replace("DuplicateCheck", {})
            } else {
                navigation.replace("Report An Issue", {})
            }
        } else if (currentIssue) {
            navigation.popTo("Issue Details", { issue: currentIssue })
        }

    }

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: uri }}
                style={styles.picture}
            />
            <View style={styles.buttonRow}>
                <Button style={{ ...styles.button, borderColor: palette.ckRed }} onPress={() => { navigation.replace("Camera", { source }) }}
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
