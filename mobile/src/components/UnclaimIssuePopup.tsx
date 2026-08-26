//mobile/src/components/UnclaimIssuePopup.tsx

import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import ModalPopUp from "./ModalPopup";
import { borderRadius, colors, globalStyles, palette, size, spacing, typography } from "../styles";
import { useState } from "react";
import { issuesApi } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { StackParams } from "../types/StackParams";
import { StackNavigationProp } from "@react-navigation/stack";

export default function UnclaimIssuePopup({ issue, setIssue }: any) {
    const [releaseMessage, setReleaseMessage] = useState("")
    const { organization } = useAuth()
    const navigation = useNavigation<StackNavigationProp<StackParams>>()

    const handleRelease = async () => {
        try {
            await issuesApi.addTimelineEntry(issue.id, {
                message: releaseMessage.length > 0 ? organization.name + " unclaimed this issue: " + releaseMessage : organization.name + " unclaimed this issue",
                status: "REPORTED"
            })
            setIssue(await issuesApi.releaseIssue(issue.id))
        } catch (error) {
            navigation.push('Error', { errorMessage: 'Issue Release Failed' });
            throw error;
        }

    }

    return (
        <ModalPopUp
            buttonBody={
                <Text style={styles.releaseText}>Unclaim Issue</Text>}
            closeButtonBody={<Text style={styles.cancelText}>Cancel</Text>}
            closeButtonStyle={{ ...styles.releaseButton, backgroundColor: palette.ckRed, width: "100%", alignItems: "center", marginTop: 0 }}
            buttonStyle={styles.releaseButton}
        >
            <View style={styles.popup}>
                <Text style={styles.warningText}>Are you sure?</Text>
                <TextInput onChangeText={setReleaseMessage}
                    value={releaseMessage}
                    placeholder='Add a note...'
                    style={globalStyles.textBoxBig}
                    multiline
                    numberOfLines={5}
                    maxLength={500}
                    focusable
                />
                <TouchableOpacity style={styles.releaseButtonTwo} onPress={handleRelease}>
                    <Text style={globalStyles.longButtonText}>Yes, unclaim this issue</Text>
                </TouchableOpacity>
            </View>
        </ModalPopUp>
    )
}

const styles = StyleSheet.create({
    releaseText: {
        color: colors.textSecondary,
        fontSize: typography.sizeLg
    },
    cancelText: {
        fontSize: typography.sizeXl,
        fontWeight: 'bold',
        color: colors.textContrast,
    },
    releaseButtonTwo: {
        backgroundColor: palette.ckGreen,
        paddingVertical: spacing.sm,
        alignItems: "center",
        borderRadius: borderRadius.full,
        width: "100%"
    },
    warningText: {
        color: colors.textPrimary,
        fontSize: typography.sizeXl,
        fontWeight: typography.weightMedium
    },
    popup: {
        alignItems: "center",
        rowGap: spacing.sm,
        marginBottom: spacing.sm
    },
    releaseButton: {
        backgroundColor: palette.ckLightGray,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        alignSelf: 'center',
        marginTop: spacing.md
    },

})