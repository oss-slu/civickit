// mobile/src/screens/Login/LoginScreen.tsx
//import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity } from 'react-native';
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
import { colors, spacing, typography, borderRadius } from '../../styles/theme';
import { globalStyles } from '../../styles';
import LoginForm from '../../components/LoginForm';
import { useAuth } from '../../contexts/AuthContext';

// Component 
export default function LoginScreen() {
    const navigation = useNavigation<StackNavigationProp<StackParams>>();
    const { setRegisteringOrg } = useAuth()

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView
                contentContainerStyle={[styles.container, { paddingTop: spacing.lg }]}
                keyboardShouldPersistTaps="handled">

                <Text style={styles.heading}>Welcome back</Text>
                <Text style={styles.subheading}>Log in to CivicKit</Text>

                <LoginForm />

                {/* Switch to Register */}
                <TouchableOpacity
                    style={styles.switchRow}
                    onPress={() => navigation.navigate('Register', {})}
                >
                    <Text style={styles.switchText}>
                        Don't have an account?{' '}
                        <Text style={styles.switchLink}>Sign up</Text>
                    </Text>
                </TouchableOpacity>

                {/* Org Registration */}
                <TouchableOpacity
                    style={{ ...styles.orgReg }}
                    onPress={() => {
                        setRegisteringOrg(true)
                        navigation.replace('OrgRegister', {})
                    }}>
                    <Text style={styles.switchText}>
                        I want to register an organization.{' '}
                    </Text>
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}


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
    orgReg: {
        bottom: spacing.xl,
        position: "absolute",
        alignSelf: "center"
    }
});