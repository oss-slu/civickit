//mobile/src/screens/ProfileScreen.tsx
import IconButton from "../components/IconButton";
import { MessageView } from "../components/MessageView";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native"
import { useContext, useRef, useState } from "react";
import { palette, colors, globalStyles, size, spacing, typography } from "../styles";
import { useAuth } from "../contexts/AuthContext";
import { FullWindowOverlay } from "react-native-screens";



export default function ProfileScreen() {
    const { logout } = useAuth();

    return (
        <View style={[styles.container]}>
            <Text style={[styles.message]}>Profile Coming Soon...</Text>
            <TouchableOpacity onPress={logout} style={[styles.logoutButton]}>
                <Text style={[styles.logoutText]}>Logout</Text>
            </TouchableOpacity>
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