//mobile/src/components/ModalPopup.tsx

import { FlatList, Modal, TouchableOpacity, View, StyleSheet } from "react-native";
import WrapperButton from "./WrapperButton";
import { useState } from "react";
import Checkbox from "expo-checkbox";
import { palette, typography, colors, borderRadius, spacing } from "../styles";
import Button from "./Button";

export default function ModalPopUp({ buttonStyle, buttonBody, children }: any) {
    const [isVisible, setIsVisible] = useState(false)
    const toggleModal = () => setIsVisible(!isVisible)

    return (
        <View>
            <WrapperButton onPress={toggleModal} style={buttonStyle}>
                {buttonBody}
            </WrapperButton>

            <Modal visible={isVisible} transparent animationType="fade">
                <View style={styles.modalBackground}>
                    <View style={styles.modalContent}>
                        {children}
                        <Button style={styles.closeButton} onPress={toggleModal}
                            text="Close">
                        </Button>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: palette.ckDarkGreen,
        fontSize: typography.sizeLg
    },
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "80%",
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
    },

    option: {
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: palette.ckLightGray,
        color: colors.textPrimary,
        flexDirection: "row",
        columnGap: spacing.xs
    },
    optionText: {
        color: colors.textPrimary,
        fontSize: typography.sizeLg
    },
    closeButton: {
        backgroundColor: palette.ckRed,
        fontSize: typography.sizeLg
    }
})