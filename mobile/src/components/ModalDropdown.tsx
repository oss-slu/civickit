import React, { useState } from "react";
import { View, Modal, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import Button from "./Button";
import { borderRadius, colors, palette, spacing, typography } from "../styles";
import IconButton from "./IconButton";
import { CaretDownIcon } from "./Icons";

export default function ModalDropdown({ data, onDataSelect, defaultText, buttonStyle, labelSuffix }: any) {
    const [isVisible, setIsVisible] = useState(false)
    const [selectedValue, setSelectedValue] = useState(null)

    const toggleModal = () => setIsVisible(!isVisible)

    const handleSelect = (item: any) => {
        setSelectedValue(item);
        onDataSelect(item)
        toggleModal()
    }

    return (
        <View>
            <IconButton style={{ ...styles.button, ...buttonStyle }}
                onPress={toggleModal}>
                <Text style={{
                    color: buttonStyle.color,
                    fontSize: buttonStyle.fontSize,
                    fontStyle: buttonStyle.fontStyle
                }}>{selectedValue || defaultText || "Select an option"} {labelSuffix}</Text>
            </IconButton>

            <Modal visible={isVisible} transparent animationType="fade">
                <View style={styles.modalBackground}>
                    <View style={styles.modalContent}>
                        <FlatList
                            data={data}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.option}
                                    onPress={() => handleSelect(item)}>
                                    <Text style={styles.optionText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
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
        color: colors.textPrimary
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