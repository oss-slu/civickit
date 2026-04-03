import React, { useState } from "react";
import { View, Modal, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import Button from "./Button";
import { borderRadius, colors, palette, size, spacing, typography } from "../styles";
import { Checkbox } from 'expo-checkbox';
import IconButton from "./IconButton";
import { FilterIcon } from "./Icons";

export default function ModalDropdown({ data, setSelectedValues, buttonStyle, children }: any) {
    const [isVisible, setIsVisible] = useState(false)
    const [selected, setSelected] = useState(() => {
        let list: boolean[] = []
        for (let i = 0; i < data.length; i++) {
            list.push(true);
        }
        return list
    })

    const toggleModal = () => setIsVisible(!isVisible)

    const handleSelect = (item: any, i: any) => {
        // setSelectedValue(item);
        const newSelected = selected.map((item, index) => {
            if (i == index) {
                return !item
            } else {
                return item
            }
        })
        setSelected(newSelected)

        let newSelectedValues: string[] = []
        for (let i = 0; i < data.length; i++) {
            if (newSelected[i]) {
                newSelectedValues.push(data[i])
            }
        }
        setSelectedValues(newSelectedValues)
    }

    return (
        <View>
            <IconButton onPress={toggleModal} style={buttonStyle}>
                {children}
            </IconButton>

            <Modal visible={isVisible} transparent animationType="fade">
                <View style={styles.modalBackground}>
                    <View style={styles.modalContent}>
                        <FlatList
                            data={data}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity
                                    style={styles.option}
                                    onPress={() => handleSelect(item, index)}>
                                    <Checkbox
                                        value={selected[index]}
                                        color={selected[index] ? palette.ckYellow : undefined}
                                    />
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