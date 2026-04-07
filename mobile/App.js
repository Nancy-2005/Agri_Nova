import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Screens (to be created)
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import FarmerFormScreen from './src/screens/FarmerFormScreen';

const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#16a34a',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            >
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Register"
                    component={RegisterScreen}
                    options={{ title: 'Register / பதிவு' }}
                />
                <Stack.Screen
                    name="Dashboard"
                    component={DashboardScreen}
                    options={{ title: 'Dashboard / முகப்பு' }}
                />
                <Stack.Screen
                    name="FarmerForm"
                    component={FarmerFormScreen}
                    options={{ title: 'Farmer Form / விவசாயி படிவம்' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
