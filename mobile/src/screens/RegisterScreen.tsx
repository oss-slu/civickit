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
import { registerUser, saveToken } from '../services/AuthService';

// ─── Validation ───────────────────────────────────────────────────────────────

const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// ─── Component ────────────────────────────────────────────────────────────────

export default function RegisterScreen() {
    const navigation = useNavigation<StackNavigationProp<StackParams>>();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [serverError, setServerError] = useState('');

    // ── Validation ────────────────────────────────────────────────────────────

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

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleRegister = async () => {
        if (!validate()) return;

        try {
            setIsLoading(true);
            const { token } = await registerUser(name.trim(), email.trim(), password);
            await saveToken(token);
            navigation.replace('Nearby Issues', {});
        } catch (error: any) {
            setServerError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

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
                <TextInput
                    style={[styles.textBox, passwordError ? styles.textBoxError : null]}
                    placeholder="Password (min. 8 characters)"
                    value={password}
                    onChangeText={text => { setPassword(text); setPasswordError(''); }}
                    secureTextEntry
                />
                {!!passwordError && <Text style={styles.fieldError}>{passwordError}</Text>}

                {/* Confirm Password */}
                <TextInput
                    style={[styles.textBox, confirmPasswordError ? styles.textBoxError : null]}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={text => { setConfirmPassword(text); setConfirmPasswordError(''); }}
                    secureTextEntry
                />
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
                    onPress={() => navigation.navigate('Login', {})}>
                    <Text style={styles.switchText}>
                        Already have an account?{' '}
                        <Text style={styles.switchLink}>Log in</Text>
                    </Text>
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    flex: {
        flex: 1,
        backgroundColor: 'white',
    },
    container: {
        padding: 24,
        paddingTop: 48,
        flexGrow: 1,
    },
    heading: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 4,
    },
    subheading: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
    },
    textBox: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#e7e7e7',
        borderRadius: 16,
        marginTop: 12,
        fontSize: 15,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    textBoxError: {
        borderColor: '#d32f2f',
    },
    fieldError: {
        color: '#d32f2f',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    serverErrorBox: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#fdecea',
        borderRadius: 12,
    },
    serverErrorText: {
        color: '#d32f2f',
        fontSize: 14,
        textAlign: 'center',
    },
    button: {
        marginTop: 24,
        backgroundColor: '#197a15',
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#d1d1d1',
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    switchRow: {
        marginTop: 20,
        alignItems: 'center',
    },
    switchText: {
        color: '#444',
        fontSize: 14,
    },
    switchLink: {
        color: '#197a15',
        fontWeight: '600',
    },
});