import { ScrollView, View } from "react-native";
import { Image } from 'expo-image';
import { Dimensions, StyleSheet } from 'react-native';
import IconButton from "../../components/IconButton";
import { CameraIcon, PictureIcon } from "../../components/Icons";
import { globalStyles, palette, size, spacing, typography } from "../../styles";
import { StaticScreenProps } from "@react-navigation/native";
import { User } from "@civickit/shared";
import Avatar from "../../components/Avatar";
import Button from "../../components/Button";
import { useState } from "react";


const windowWidth = Dimensions.get('window').width;
type Props = StaticScreenProps<{
    user: User | null
}>;

export default function AvatarScreen({ route }: Props) {

    const [submitAllowed, setSubmitAllowed] = useState<boolean>(false)

    const user = route.params.user

    const handleCancel = () => {

    }

    const handleSubmit = () => {

    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Avatar source='blueAvatar.png'
                style={styles.image} />
            <Image source={require('../../../assets/avatars/redAvatar.png')}
                style={styles.image} />
            <Image source={require('../../../assets/avatars/greenAvatar.png')}
                style={styles.image} />
            <Image source={require('../../../assets/avatars/yellowAvatar.png')}
                style={styles.image} />

            <View style={styles.buttonRow}>
                <Button onPress={handleCancel}
                    style={{ ...styles.submitButton, backgroundColor: palette.ckRed }}
                    text="Cancel">
                </Button>

                <Button onPress={handleSubmit}
                    style={styles.submitButton}
                    isDisabled={!submitAllowed}
                    text="Submit">
                </Button>
            </View>

            {/* <IconButton style={styles.button}>
                <CameraIcon style={styles.icon} />
            </IconButton>
            <IconButton style={styles.button}>
                <PictureIcon style={styles.icon} />
            </IconButton> */}
        </ScrollView >
    )
}

const styles = StyleSheet.create({
    image: {
        width: windowWidth / 2 - spacing.xs * 1.5,
        height: windowWidth / 2 - spacing.xs * 1.5
    },
    container: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.xs,
        margin: spacing.xs,
        height: "100%"
    },
    button: {
        backgroundColor: palette.ckLightMediumGray,
        height: windowWidth / 2 - spacing.xs * 1.5,
        width: windowWidth / 2 - spacing.xs * 1.5,
        borderRadius: 0,
    },
    icon: {
        color: palette.ckDarkGray,
        fontSize: typography.sizeXxxl * 2
    },
    submitButton: {
        fontSize: typography.sizeXxl,
        fontWeight: typography.weightBold,
        width: size.longButton,

        ...globalStyles.shadow
    },
    buttonRow: {
        paddingHorizontal: spacing.md,
        gap: spacing.md,
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        width: "100%",
        position: "absolute",
        bottom: spacing.lg,
    },
})