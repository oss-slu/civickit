//mobile/src/screens/ProfileScreen.tsx
import IconButton from "../../components/IconButton";
import { MessageView } from "../../components/MessageView";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native"
import { useContext, useRef, useState } from "react";
import { palette, colors, globalStyles, size, spacing, typography } from "../../styles";
import { useAuth } from "../../contexts/AuthContext";
import { FullWindowOverlay } from "react-native-screens";
import { EditIcon, SettingsIcon, TrashIcon, UserIcon } from "../../components/Icons";
import Button from "../../components/Button";
import { useNavigation } from "@react-navigation/native";
import { StackParams } from "../../types/StackParams";
import { StackNavigationProp } from "@react-navigation/stack";

export default function ProfileScreen() {
    const { logout } = useAuth();
    const { user } = useAuth();
    console.log(user)

    const navigation = useNavigation<StackNavigationProp<StackParams>>();

    return (
        <View style={[styles.container]}>
            {user?.profileImage != null ?
                <UserIcon /> :
                <TrashIcon />}
            {/* Replace trash can with User image once implemented */}
            <IconButton
                onPress={() => navigation.navigate("Avatar", {})}>
                <EditIcon />
            </IconButton>

            <Text style={[styles.message]}>{user?.name}</Text>

            <IconButton style={{ flexDirection: "row", columnGap: spacing.sm }}
                onPress={() => navigation.navigate("Settings", {})}>
                <SettingsIcon />
                <Text>Settings</Text>
            </IconButton>

            <Button text="Logout" onPress={logout} />


        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 500,
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        fontSize: 20,
        fontWeight: 500,
        marginBottom: 15
    },
    logoutButton: {
        alignContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.success,
        paddingVertical: spacing.sm,
        width: 150,
        borderRadius: 10,
    },
    logoutText: {
        fontSize: typography.sizeSm,
        color: palette.ckLight,
        fontWeight: typography.weightBold,
    }
})