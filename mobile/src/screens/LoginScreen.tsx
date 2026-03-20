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
import { loginUser, saveToken } from '../services/AuthService';

// ─── Validation ───────────────────────────────────────────────────────────────

const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginScreen() {
    const navigation = useNavigation<StackNavigationProp<StackParams>>();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Separate error slots so errors appear inline under their field
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [serverError, setServerError] = useState('');

    // ── Validation ────────────────────────────────────────────────────────────

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

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleLogin = async () => {
        if (!validate()) return;

        try {
            setIsLoading(true);
            const { token } = await loginUser(email.trim(), password);
            await saveToken(token);
            // Replace so the user can't navigate back to the login screen
            //navigation.replace('Nearby Issues', {});
            const res = await loginUser(email, password);
            await saveToken(res.token);
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
                <TextInput
                    style={[styles.textBox, passwordError ? styles.textBoxError : null]}
                    placeholder="Password"
                    value={password}
                    onChangeText={text => { setPassword(text); setPasswordError(''); }}
                    secureTextEntry
                />
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