import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { farmerAPI } from '../utils/api';
import { storage } from '../utils/storage';

const FarmerFormScreen = ({ navigation }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        age: '',
        gender: '',
        education: '',
        experience: '',
        income: '',
        household_size: '',
        land_area: '',
        land_ownership: '',
        crops: '',
        soil_type: '',
        irrigation_source: '',
        water_availability: '',
        yield_history: '',
        market_linkage: '',
        technologies_used: [],
        schemes_aware: [],
        has_loan: false,
        has_insurance: false,
        savings_habit: '',
        risk_level: '',
        openness: 3,
        trust: 3,
        peer_influence: 3,
        govt_influence: 3,
    });

    const totalSteps = 6;

    const handleSubmit = async () => {
        try {
            await farmerAPI.submitData(formData);
            Alert.alert('Success', 'Data submitted successfully!');
            navigation.replace('Dashboard');
        } catch (error) {
            Alert.alert('Error', error.response?.data?.error || 'Submission failed');
        }
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const renderStep = () => {
        // Simplified form - in production, implement all 6 steps like web version
        return (
            <View>
                <Text style={styles.stepTitle}>Step {currentStep} of {totalSteps}</Text>
                <Text style={styles.instruction}>
                    Please fill in the farmer form on the web app for best experience.
                    Mobile form is simplified.
                </Text>

                {currentStep === 1 && (
                    <View>
                        <Text style={styles.label}>Age / வயது</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.age}
                            onChangeText={(text) => setFormData({ ...formData, age: text })}
                            keyboardType="numeric"
                            placeholder="Enter age"
                        />

                        <Text style={styles.label}>Experience (years) / அனுபவம்</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.experience}
                            onChangeText={(text) => setFormData({ ...formData, experience: text })}
                            keyboardType="numeric"
                            placeholder="Years of farming"
                        />
                    </View>
                )}

                <Text style={styles.note}>
                    Note: For complete form experience, please use the web application.
                </Text>
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${(currentStep / totalSteps) * 100}%` }]} />
                </View>

                {renderStep()}

                <View style={styles.buttonContainer}>
                    {currentStep > 1 && (
                        <TouchableOpacity style={styles.buttonSecondary} onPress={prevStep}>
                            <Text style={styles.buttonSecondaryText}>← Previous</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.button} onPress={nextStep}>
                        <Text style={styles.buttonText}>
                            {currentStep === totalSteps ? 'Submit' : 'Next →'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0fdf4',
    },
    card: {
        backgroundColor: 'white',
        margin: 16,
        padding: 20,
        borderRadius: 16,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        marginBottom: 24,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#16a34a',
        borderRadius: 4,
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#15803d',
        marginBottom: 16,
    },
    instruction: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        borderWidth: 2,
        borderColor: '#d1d5db',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
    },
    note: {
        fontSize: 12,
        color: '#0284c7',
        fontStyle: 'italic',
        marginTop: 20,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
    },
    button: {
        flex: 1,
        backgroundColor: '#16a34a',
        padding: 18,
        borderRadius: 12,
        marginLeft: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    buttonSecondary: {
        flex: 1,
        backgroundColor: '#e5e7eb',
        padding: 18,
        borderRadius: 12,
        marginRight: 8,
    },
    buttonSecondaryText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default FarmerFormScreen;
