import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, FlatList, StyleSheet } from "react-native";

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
            <TouchableOpacity style={styles.button} onPress={toggleModal}>
                <Text style={styles.buttonText}>
                    {selectedValue || defaultText || "Select an option"}
                </Text>
            </TouchableOpacity>

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
                        <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
                            <Text style={styles.buttonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        margin: 20
    },
    button: {
        padding: 15,
        backgroundColor: "#ad0a98",
        borderRadius: 5
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