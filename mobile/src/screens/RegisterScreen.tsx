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
import { registerUser } from '../services/AuthService';
import { useAuth } from '../contexts/AuthContext';
import { globalStyles } from '../styles';
import { colors, spacing, typography, borderRadius } from '../styles/theme';
// Validation
const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// Component
export default function RegisterScreen() {
    const navigation = useNavigation<StackNavigationProp<StackParams>>();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [serverError, setServerError] = useState('');

    const { login } = useAuth();

    // Validation
    const validate = (): boolean => {
        let valid = true;
        setNameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');
        setServerError('');

        if (!name.trim()) {
            setNameError('Name is required.');
            valid = false;
        }

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
        } else if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters.');
            valid = false;
        }

        if (!confirmPassword) {
            setConfirmPasswordError('Please confirm your password.');
            valid = false;
        } else if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match.');
            valid = false;
        }

        return valid;
    };

    // Submit 
    const handleRegister = async () => {
        if (!validate()) return;

        try {
            setIsLoading(true);
            const { token } = await registerUser(name.trim(), email.trim(), password);
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

                <Text style={styles.heading}>Create an account</Text>
                <Text style={styles.subheading}>Join CivicKit and improve your neighborhood</Text>

                {/* Name */}
                <TextInput
                    style={[styles.textBox, nameError ? styles.textBoxError : null]}
                    placeholder="Full Name"
                    value={name}
                    onChangeText={text => { setName(text); setNameError(''); }}
                    autoCapitalize="words"
                />
                {!!nameError && <Text style={styles.fieldError}>{nameError}</Text>}

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
                        placeholder="Password (min. 8 characters)"
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

                {/* Confirm Password */}
                <View style={styles.passwordWrapper}>
                    <TextInput
                        style={[styles.textBox, styles.passwordInput, confirmPasswordError ? styles.textBoxError : null]}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChangeText={text => { setConfirmPassword(text); setConfirmPasswordError(''); }}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                    />
                    <TouchableOpacity
                        style={styles.passwordToggle}
                        onPress={() => setShowConfirmPassword(prev => !prev)}>
                        <Text style={styles.passwordToggleText}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
                    </TouchableOpacity>
                </View>
                {!!confirmPasswordError && (
                    <Text style={styles.fieldError}>{confirmPasswordError}</Text>
                )}

                {/* Server error (e.g. "Email already in use") */}
                {!!serverError && (
                    <View style={styles.serverErrorBox}>
                        <Text style={styles.serverErrorText}>{serverError}</Text>
                    </View>
                )}

                {/* Submit */}
                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleRegister}
                    disabled={isLoading}>
                    {isLoading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.buttonText}>Create Account</Text>}
                </TouchableOpacity>

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
        fontSize: typography.sizeMd,
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