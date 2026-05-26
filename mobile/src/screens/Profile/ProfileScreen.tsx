//mobile/src/screens/ProfileScreen.tsx
import IconButton from "../../components/IconButton";
import { MessageView } from "../../components/MessageView";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native"
import { useContext, useRef, useState } from "react";
import { palette, colors, globalStyles, size, spacing, typography, borderRadius } from "../../styles";
import { useAuth } from "../../contexts/AuthContext";
import { EditIcon, SettingsIcon, TrashIcon, UserIcon } from "../../components/Icons";
import Button from "../../components/Button";
import { useNavigation } from "@react-navigation/native";
import { StackParams } from "../../types/StackParams";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from "expo-image";

export default function ProfileScreen() {
    const { logout } = useAuth();
    const { user } = useAuth();
    console.log(user)

    const navigation = useNavigation<StackNavigationProp<StackParams>>();

    if (user == null) {
        return (
            <View style={styles.container}>
                <Text style={[globalStyles.heading1]}>You are not logged in.</Text>
                <Button text="Go to login" onPress={logout} />
            </View>
        )
    }
    return (
        <View style={[styles.container]}>
            <IconButton style={{ ...styles.button, flexDirection: "row", columnGap: spacing.sm, alignSelf: "flex-end" }}
                onPress={() => navigation.navigate("Settings", {})}>
                <SettingsIcon color={styles.button.color} size={styles.button.fontSize} />
                <Text style={{ color: styles.button.color, fontSize: styles.button.fontSize }}>Settings</Text>
            </IconButton>

            <View style={styles.profilePicContainer}>
                {user?.profileImage != null ?
                    <Image
                        source={require("../../../assets/ProfilePlaceholder.png")}
                        style={styles.profilePic} /> :
                    <TrashIcon />}
                {/* Replace trashcan with User image once implemented */}
                <View style={styles.editButton}>
                    <IconButton
                        onPress={() => navigation.navigate("Avatar", {})}>
                        <EditIcon />
                    </IconButton>
                </View>
            </View>

            <Text style={globalStyles.heading1}>{user?.name}</Text>

            <Button text="Logout" onPress={logout} style={styles.button} />


        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        ...globalStyles.container,
        alignItems: 'center',
        rowGap: spacing.md
    },
    button: {
        ...globalStyles.button,
        backgroundColor: palette.ckMediumGray,
        fontSize: typography.sizeLg,
    },
    profilePicContainer: {

    },
    profilePic: {
        width: 200,
        height: 200,
        borderRadius: borderRadius.full,
    },
    editButton: {
        position: "absolute",
        bottom: 10,
        right: 10
    }
})