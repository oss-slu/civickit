//import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParams } from '../types/StackParams';
import { useAuth } from '../contexts/AuthContext';
import { loginUser } from '../services/AuthService';
import { colors, spacing, typography, borderRadius } from '../styles/theme';
import { globalStyles } from '../styles';



const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// Component 

export default function LoginScreen() {
    const navigation = useNavigation<StackNavigationProp<StackParams>>();

    //tracks user input and loading state while loggin in
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Separate error slots so errors appear inline under their field
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [serverError, setServerError] = useState('');

    // Validation
    const validate = (): boolean => {
        let valid = true;
        setEmailError('');
        setPasswordError('');
        setServerError('');

        if (!email.trim()) {
            setEmailError('Email is required.');
            valid = false;
        } else if (!isValidEmail(email)) {
            setEmailError('Please enter a valid email address.');
            valid = false;
        }

        if (!password) {
            setPasswordError('Password is required.');
            valid = false;
        }

        return valid;
    };

    const { login } = useAuth();

    //Submit
    const handleLogin = async () => {
        if (!validate()) return;

        try {
            setIsLoading(true);
            const { token } = await loginUser(email.trim(), password);
            await login(token);
        } catch (error: any) {
            setServerError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Render

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled">

                <Text style={styles.heading}>Welcome back</Text>
                <Text style={styles.subheading}>Log in to CivicKit</Text>

                {/* Email */}
                <TextInput
                    style={[styles.textBox, emailError ? styles.textBoxError : null]}
                    placeholder="Email"
                    value={email}
                    onChangeText={text => { setEmail(text); setEmailError(''); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {!!emailError && <Text style={styles.fieldError}>{emailError}</Text>}

                {/* Password */}
                <View style={styles.passwordWrapper}>
                    <TextInput
                        style={[styles.textBox, styles.passwordInput, passwordError ? styles.textBoxError : null]}
                        placeholder="Password"
                        value={password}
                        onChangeText={text => { setPassword(text); setPasswordError(''); }}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                    />
                    <TouchableOpacity
                        style={styles.passwordToggle}
                        onPress={() => setShowPassword(prev => !prev)}>
                        <Text style={styles.passwordToggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
                    </TouchableOpacity>
                </View>
                {!!passwordError && <Text style={styles.fieldError}>{passwordError}</Text>}

                {/* Server error (e.g. "Invalid credentials") */}
                {!!serverError && (
                    <View style={styles.serverErrorBox}>
                        <Text style={styles.serverErrorText}>{serverError}</Text>
                    </View>
                )}

                {/* Submit */}
                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={isLoading}>
                    {isLoading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.buttonText}>Log In</Text>}
                </TouchableOpacity>

                {/* Switch to Register */}
                <TouchableOpacity
                    style={styles.switchRow}
                    onPress={() => navigation.navigate('Register', {})}>
                    <Text style={styles.switchText}>
                        Don't have an account?{' '}
                        <Text style={styles.switchLink}>Sign up</Text>
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
    },
    container: {
        ...globalStyles.container,
        padding: spacing.lg,
        paddingTop: spacing.xxxl,
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
    textBox: {
        ...globalStyles.textBox,
        marginTop: spacing.sm,
        fontSize: typography.sizeLg,
        borderWidth: 1,
        borderColor: 'transparent',
        height: 52,
    },
    passwordWrapper: {
        position: 'relative',
        marginTop: spacing.sm,
    },
    passwordInput: {
        paddingRight: 110,
        height: 52,
    },
    passwordToggle: {
        position: 'absolute',
        transform: [{ translateY: 5 }],
        right: spacing.md,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
    },
    passwordToggleText: {
        color: colors.primary,
        fontWeight: typography.weightBold,
        fontSize: typography.sizeMd,
    },
    textBoxError: {
        borderColor: colors.error,
    },
    fieldError: {
        color: colors.error,
        fontSize: typography.sizeSm,
        marginTop: spacing.xs,
        marginLeft: spacing.xs,
    },
    serverErrorBox: {
        marginTop: spacing.md,
        padding: spacing.sd,
        backgroundColor: '#fdecea',
        borderRadius: borderRadius.md,
    },
    serverErrorText: {
        color: colors.error,
        fontSize: typography.sizeMd,
        textAlign: 'center',
    },
    button: {
        marginTop: spacing.lg,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.sd,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: colors.backgroundSecondary,
    },
    buttonText: {
        color: colors.textContrast,
        fontWeight: typography.weightMedium,
        fontSize: typography.sizeLg
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