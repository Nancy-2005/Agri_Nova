import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../utils/api';
import { storage } from '../utils/storage';

const TAMIL_NADU_DISTRICTS = [
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
    'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur',
    'Krishnagiri', 'Madurai', 'Nagapattinam', 'Namakkal', 'Salem', 'Thanjavur',
    'Tiruchirappalli', 'Tirunelveli', 'Tiruppur', 'Vellore', 'Virudhunagar'
];

const RegisterScreen = ({ navigation }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        phone_number: '',
        district: '',
        otp: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSendOtp = async () => {
        if (!formData.name || !formData.phone_number || !formData.district) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }
        setLoading(true);
        try {
            await authAPI.sendOtp({
                name: formData.name,
                phone_number: formData.phone_number,
                district: formData.district
            });
            setStep(2);
        } catch (error) {
            Alert.alert('Failed', error.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!formData.otp) {
            Alert.alert('Error', 'Please enter the OTP');
            return;
        }
        setLoading(true);
        try {
            await authAPI.verifyOtp({
                phone_number: formData.phone_number,
                otp: formData.otp
            });
            setStep(3);
        } catch (error) {
            Alert.alert('Failed', error.response?.data?.error || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!formData.password || !formData.confirmPassword) {
            Alert.alert('Error', 'Please fill in the passwords');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await authAPI.register({
                name: formData.name,
                phone_number: formData.phone_number,
                district: formData.district,
                password: formData.password
            });
            await storage.setItem('user', response.data);
            navigation.replace('FarmerForm');
        } catch (error) {
            Alert.alert('Registration Failed', error.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Register / பதிவு செய்யவும்</Text>

                {step === 1 && (
                    <View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Name / பெயர் *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="Enter your name"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Mobile Number / மொபைல் எண் *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.phone_number}
                                onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
                                placeholder="9876543210"
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>District / மாவட்டம் *</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.district}
                                    onValueChange={(value) => setFormData({ ...formData, district: value })}
                                >
                                    <Picker.Item label="Select District" value="" />
                                    {TAMIL_NADU_DISTRICTS.map(district => (
                                        <Picker.Item key={district} label={district} value={district} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleSendOtp}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? 'Loading...' : 'Send OTP / OTP அனுப்பு'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {step === 2 && (
                    <View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Enter OTP / OTP உள்ளிடவும் *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.otp}
                                onChangeText={(text) => setFormData({ ...formData, otp: text })}
                                placeholder="123456"
                                keyboardType="number-pad"
                                maxLength={6}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleVerifyOtp}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? 'Loading...' : 'Verify OTP / OTP சரிபார்'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={{marginTop: 10}} onPress={() => setStep(1)}>
                            <Text style={styles.linkText}>Back</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {step === 3 && (
                    <View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Set Password / கடவுச்சொல் அமைக்கவும் *</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    value={formData.password}
                                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                                    placeholder="••••••••"
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="gray" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Confirm Password / கடவுச்சொல் உறுதிப்படுத்தவும் *</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    value={formData.confirmPassword}
                                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                                    placeholder="••••••••"
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color="gray" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? 'Loading...' : 'Register / பதிவு செய்யவும்'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity style={{marginTop: 20}} onPress={() => navigation.goBack()}>
                    <Text style={styles.linkText}>
                        Already have an account? Login / உள்நுழைய
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#15803d',
        textAlign: 'center',
        marginBottom: 24,
    },
    inputContainer: {
        marginBottom: 16,
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
    pickerContainer: {
        borderWidth: 2,
        borderColor: '#d1d5db',
        borderRadius: 12,
        backgroundColor: '#fff',
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

export default RegisterScreen;
