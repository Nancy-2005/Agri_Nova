import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { farmerAPI, resultsAPI } from '../utils/api';
import { storage } from '../utils/storage';

const DashboardScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [adoptionResult, setAdoptionResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const userData = await storage.getItem('user');
            setUser(userData);

            const adoptionRes = await resultsAPI.getAdoptionResult(userData.user_id);
            setAdoptionResult(adoptionRes.data);
        } catch (error) {
            console.error('Dashboard load error:', error);
            if (error.response?.status === 404) {
                navigation.replace('FarmerForm');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await storage.clear();
        navigation.replace('Login');
    };

    const getBadgeColor = (category) => {
        if (category === 'High') return '#16a34a';
        if (category === 'Moderate') return '#eab308';
        return '#dc2626';
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcomeText}>வணக்கம், {user?.name}!</Text>
                <Text style={styles.districtText}>{user?.district}</Text>
            </View>

            {adoptionResult && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Adoption Score / ஏற்பு மதிப்பெண்</Text>
                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreText}>{adoptionResult.adoption_score}%</Text>
                        <View style={[styles.badge, { backgroundColor: getBadgeColor(adoptionResult.adoption_category) }]}>
                            <Text style={styles.badgeText}>{adoptionResult.adoption_category}</Text>
                        </View>
                    </View>
                    <Text style={styles.segmentText}>
                        Segment: {adoptionResult.segmentation_cluster}
                    </Text>
                </View>
            )}

            <View style={styles.actionsCard}>
                <Text style={styles.cardTitle}>Quick Actions</Text>

                <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Feature', 'View Recommendations')}>
                    <Text style={styles.actionButtonText}>📱 View Recommendations</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Feature', 'View Schemes')}>
                    <Text style={styles.actionButtonText}>🏛️ Government Schemes</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('FarmerForm')}>
                    <Text style={styles.actionButtonText}>📝 Update Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
                    <Text style={[styles.actionButtonText, styles.logoutText]}>🚪 Logout / வெளியேறு</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0fdf4',
    },
    header: {
        backgroundColor: '#16a34a',
        padding: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    districtText: {
        fontSize: 16,
        color: '#dcfce7',
    },
    loadingText: {
        fontSize: 20,
        color: '#16a34a',
        textAlign: 'center',
        marginTop: 50,
    },
    card: {
        backgroundColor: 'white',
        margin: 16,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#15803d',
        marginBottom: 16,
    },
    scoreContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    scoreText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#16a34a',
        marginBottom: 12,
    },
    badge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    badgeText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    segmentText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    actionsCard: {
        backgroundColor: 'white',
        margin: 16,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    actionButton: {
        backgroundColor: '#16a34a',
        padding: 18,
        borderRadius: 12,
        marginBottom: 12,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    logoutButton: {
        backgroundColor: '#dc2626',
    },
    logoutText: {
        color: 'white',
    },
});

export default DashboardScreen;
