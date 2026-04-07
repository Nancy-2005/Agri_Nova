import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../utils/api';
import { storage } from '../utils/storage';

const LoginScreen = ({ navigation }) => {
    const [phone_number, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!phone_number || !password) {
            Alert.alert('Error', 'Please enter mobile number and password');
            return;
        }

        setLoading(true);
        try {
            const response = await authAPI.login({ phone_number, password });
            await storage.setItem('user', response.data);
            navigation.replace('Dashboard');
        } catch (error) {
            Alert.alert('Login Failed', error.response?.data?.error || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>வணக்கம் / Welcome</Text>
                <Text style={styles.subtitle}>Farmer Technology Adoption System</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Mobile Number / மொபைல் எண்</Text>
                    <TextInput
                        style={styles.input}
                        value={phone_number}
                        onChangeText={setPhoneNumber}
                        placeholder="9876543210"
                        keyboardType="phone-pad"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password / கடவுச்சொல்</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="gray" />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Loading...' : 'Login / உள்நுழை'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.linkText}>
                        Don't have an account? Register / பதிவு செய்ய
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f0fdf4',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#15803d',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 2,
        borderColor: '#d1d5db',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#d1d5db',
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    passwordInput: {
        flex: 1,
        padding: 16,
        fontSize: 16,
    },
    eyeIcon: {
        padding: 10,
    },
    button: {
        backgroundColor: '#16a34a',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 16,
    },
    buttonDisabled: {
        backgroundColor: '#9ca3af',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkText: {
        color: '#16a34a',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default LoginScreen;
