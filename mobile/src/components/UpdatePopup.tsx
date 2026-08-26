//mobile/src/components/UpdatePopup.tsx
import { View, Text, StyleSheet, TextInput } from "react-native";
import ModalPopUp from "./ModalPopup";
import ImageSelection from "./ImageSelection";
import ModalDropdown from "./ModalDropdown";
import { useCallback, useContext, useEffect, useState } from "react";
import { CurrentIssueContext, FormStartedContext, ImagesContext, MessageContext, StatusContext, PhotoMetadataContext } from "../contexts/UpdateFormContexts";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { colors, globalStyles, palette, size, spacing, typography } from "../styles";
import { borderRadius, statusColors } from "../styles/theme";
import { IssueStatusArray } from "../types/IssueStatusArray";
import { CaretDownIcon, CheckMarkIcon } from "./Icons";
import WrapperButton from "./WrapperButton";
import { useLocation } from "../contexts/LocationContext";
import { useAuth } from "../contexts/AuthContext";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackParams } from "../types/StackParams";
import { showMessage } from "react-native-flash-message";
import { uploadImageToCloudinary, uploadPhotos } from "../services/cloudinaryService";
import { issuesApi, NetworkError } from "../api";
import { dbFormatted, formatted } from "../utils/dbValues";
import LoadingScreen from "../screens/Misc/LoadingScreen";
import { LoopingLogoGifColor } from "./Logos";
import { CreatePhotoDTO, Issue, resolvePhotoTakenAt } from "@civickit/shared";

export default function UpdatePopup({ issue, setIssue }: any) {

    //form info
    const { images, setImages } = useContext(ImagesContext);
    const { photoMetadata, setPhotoMetadata } = useContext(PhotoMetadataContext);
    const { message, setMessage } = useContext(MessageContext)
    const { currentIssue, setCurrentIssue } = useContext(CurrentIssueContext)
    const { status, setStatus } = useContext(StatusContext)
    const { formStarted, setFormStarted } = useContext(FormStartedContext)
    const [canUpdate, setCanUpdate] = useState(false)

    const { location } = useLocation()
    const [updateOpen, setUpdateOpen] = useState((formStarted && currentIssue == issue))
    const [isLoading, setIsLoading] = useState(false)
    const { authToken } = useAuth();

    const navigation = useNavigation<StackNavigationProp<StackParams>>()
    const handleUpdateStates = (isOpen: boolean) => {
        setUpdateOpen(isOpen)
        if (isOpen) {
            let localStatus = status
            if (currentIssue == null || (currentIssue as unknown as Issue).id != issue.id) {
                clearUpdateForm()
                setCurrentIssue(issue)
                setStatus(issue.status)
            } else {
                setCurrentIssue(issue)
                setStatus(status ?? issue.status)
                setFormStarted(true)
            }

        } else {
            setFormStarted(false)
        }
    }

    const handleSubmitUpdate = async () => {
        let submitMessage = message
        //handle cases with no message
        if (message.length == 0) {
            if (images.length == 0) {
                submitMessage = "Updated Status"
            } else if (String(status).toUpperCase() == issue.status) {
                if (images.length == 1) {
                    submitMessage = "Added an Image"
                } else {
                    submitMessage = "Added Images"
                }
            } else {
                if (images.length == 1) {
                    submitMessage = "Updated Status & Added an Image"
                } else {
                    submitMessage = "Updated Status & Added Images"
                }
            }
        }

        try {
            const fallbackLocation = location;

            if (!authToken) {
                setIsLoading(false)
                navigation.push('Error', { errorMessage: 'Not authenticated' });
                throw new Error('No auth token available');
            }

            const totalStartTime = Date.now();
            const performanceLog = {
                timestamp: new Date().toISOString(),
                imageCount: images.length,
                times: {} as any,
            };
            const fallbackTakenAt = new Date().toISOString();

            setIsLoading(true);

            // Step 1: Upload images to Cloudinary
            let photos: CreatePhotoDTO[] = [];
            if (images.length > 0) {
                try {
                    const imageUploadStartTime = Date.now();
                    showMessage({
                        message: "Uploading images...",
                        backgroundColor: palette.ckGreen,
                        color: colors.textContrast
                    });

                    photos = await uploadPhotos(
                        images.map((uri, index) => ({
                            uri,
                            ...resolvePhotoTakenAt(photoMetadata[index] ?? {}, fallbackTakenAt),
                        })),
                    );

                    performanceLog.times.imageUploadMs = Date.now() - imageUploadStartTime;
                } catch (uploadError) {
                    setIsLoading(false);
                    navigation.push('Error', { errorMessage: 'Image upload to Cloudinary failed' });
                    throw uploadError;
                }
            }
            const requestBody = {
                message: submitMessage,
                status: status ?? issue.status,
                photos
            };
            let update;
            try {
                update = await issuesApi.updateIssue(issue.id, requestBody);
                setIssue(await issuesApi.getIssueById(issue.id))
                clearUpdateForm()
                handleUpdateStates(false)
                setIsLoading(false)
            } catch (submitError) {
                setIsLoading(false);
                navigation.push('Error', { errorMessage: 'Update Failed' });
                throw submitError;
            }


        } catch (e: any) {
            setIsLoading(false)
            if (e instanceof NetworkError) {
                navigation.navigate('Error', { errorMessage: 'NetworkError' })
                throw new Error("Network Error")
            } else {
                navigation.navigate('Error', { errorMessage: "There was an error" })
                throw new Error(e.message)
            }

        }
    }

    const handleSetStatus = (status: string) => {
        setStatus(dbFormatted(status))
    }
    const clearUpdateForm = () => {
        setStatus(null)
        setImages([])
        setMessage("")
        setCurrentIssue(null)
        setPhotoMetadata([])
    }


    useEffect(() => {
        if (!canUpdate && (message.length > 0 ||
            images.length > 0 ||
            status != issue.status
        )) {
            setCanUpdate(true)
        } else if (canUpdate && (message.length == 0 &&
            images.length == 0 &&
            String(status).toUpperCase() == issue.status
        )) {
            setCanUpdate(false)
        }
    }, [message, status, images])

    return (
        <ModalPopUp
            buttonStyle={{ ...globalStyles.longButton, ...globalStyles.shadow, backgroundColor: palette.ckGreen, width: "100%" }}
            buttonBody={<Text style={globalStyles.longButtonText}>Update</Text>}
            containerStyle={{ flexGrow: 1 }}
            isVisible={updateOpen} setIsVisible={handleUpdateStates}
            closeButtonStyle={{ display: isLoading ? "none" : "flex" }}>

            {isLoading ?
                <View style={{ justifyContent: "center", alignItems: "center", height: 400 }}>
                    <LoopingLogoGifColor style={{ width: 250, height: 250 }} />
                </View>
                :
                <View style={{ rowGap: spacing.sm, paddingBottom: spacing.sm }}>
                    <Text style={{ ...globalStyles.heading1, fontWeight: typography.weightMedium, textAlign: "center" }}>Provide an Update</Text>
                    <ImageSelection
                        images={images}
                        photoMetadata={photoMetadata}
                        imageWidth={size.imageMd}
                        imageHeight={size.imageMd}
                        setImages={setImages}
                        setPhotoMetadata={setPhotoMetadata}
                        source={'ISSUE_UPDATE'}
                    />

                    <ModalDropdown
                        data={IssueStatusArray}
                        onDataSelect={handleSetStatus}
                        defaultText={formatted(String(status))}
                        labelSuffix={<CaretDownIcon color={status ? statusColors[status].text : colors.textContrast} />}
                        buttonStyle={{
                            color: status ? statusColors[status].text : colors.textContrast,
                            fontSize: typography.sizeLg,
                            backgroundColor: status ? statusColors[status].background : palette.ckGreen,
                            fontWeight: typography.weightMedium
                        }} />

                    <TextInput onChangeText={setMessage}
                        value={message}
                        placeholder='Add a note...'
                        style={globalStyles.textBoxBig}
                        multiline
                        numberOfLines={5}
                        maxLength={500}
                        focusable
                    />

                    <WrapperButton style={{ paddingVertical: spacing.sm }}
                        onPress={handleSubmitUpdate}
                        isDisabled={!canUpdate}>
                        <CheckMarkIcon color={colors.textContrast} size={typography.sizeXl} />
                    </WrapperButton>


                </View>
            }
        </ModalPopUp>
    )
}

const styles = StyleSheet.create({

})