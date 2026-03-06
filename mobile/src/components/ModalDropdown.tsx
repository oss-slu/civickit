import React, { useState } from "react";
import { View, Modal, FlatList, StyleSheet } from "react-native";
import Button from "./Button";

export default function ModalDropdown({ data, onDataSelect, defaultText }: any) {
    const [isVisible, setIsVisible] = useState(false)
    const [selectedValue, setSelectedValue] = useState(null)

    const toggleModal = () => setIsVisible(!isVisible)

    const handleSelect = (item: any) => {
        setSelectedValue(item);
        onDataSelect(item)
        toggleModal()
    }

    return (
        <View style={styles.container}>
            <Button style={styles.button}
                onPress={toggleModal}
                text={selectedValue || defaultText || "Select an option"}>
            </Button>

            <Modal visible={isVisible} transparent animationType="fade">
                <View style={styles.modalBackground}>
                    <View style={styles.modalContent}>
                        <FlatList
                            data={data}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <Button
                                    style={styles.option}
                                    onPress={() => handleSelect(item)}
                                    text={item}>
                                </Button>
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
    container: {
        marginVertical: 4
    },
    button: {
        padding: 12,
        backgroundColor: "#ad0a0a",
        borderRadius: 16
    },
    buttonText: {
        color: "white",
        textAlign: "center"
    },
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "80%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
    },
    option: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    optionText: {
        fontSize: 16
    },
    closeButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: "#6200a3",
        borderRadius: 5
    }
})