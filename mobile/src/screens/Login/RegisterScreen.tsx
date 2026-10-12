// mobile/src/screens/Login/RegisterScreen.tsx
import React from 'react';
import {
    Text,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParams } from '../../types/StackParams';
import { globalStyles } from '../../styles';
import { colors, spacing, typography, borderRadius } from '../../styles/theme';
import RegisterForm from '../../components/RegisterForm';

// Component
export default function RegisterScreen() {
    const navigation = useNavigation<StackNavigationProp<StackParams>>();

    // Render
    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView
                contentContainerStyle={[styles.container, { paddingTop: spacing.lg }]}
                keyboardShouldPersistTaps="handled">

                <Text style={styles.heading}>Create an account</Text>
                <Text style={styles.subheading}>Join CivicKit and improve your neighborhood</Text>

                <RegisterForm />

                {/* Switch to Login */}
                <TouchableOpacity
                    style={styles.switchRow}
                    onPress={() => navigation.goBack()}>
                    <Text style={styles.switchText}>
                        Already have an account?{' '}
                        <Text style={styles.switchLink}>Log in</Text>
                    </Text>
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// Styles
const styles = StyleSheet.create({
    flex: {
        flex: 1,
        backgroundColor: colors.surface,
        paddingVertical: spacing.md
    },
    container: {
        //paddingTop is supplied inline from the safe-area inset
        ...globalStyles.container,
        padding: spacing.lg,
        flexGrow: 1,
    },
    heading: {
        fontSize: typography.sizeXxl,
        fontWeight: typography.weightBold,
        marginBottom: spacing.xs,
    },
    subheading: {
        fontSize: typography.sizeLg,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
    },
    switchRow: {
        marginTop: spacing.ml,
        alignItems: 'center',
    },
    switchText: {
        color: colors.textPrimary,
        fontSize: typography.sizeLg,
    },
    switchLink: {
        color: colors.primary,
        fontWeight: typography.weightMedium,
    },
});