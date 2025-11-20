import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { ActivityIndicator, View, Text } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import CustomerHomeScreen from '../screens/CustomerHomeScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import CartScreen from '../screens/CartScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import ScannerScreen from '../screens/ScannerScreen';

// Placeholder screens
const RegisterScreen = () => <View><Text>Register</Text></View>;

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <CartProvider>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    {!user ? (
                        // Auth Stack
                        <>
                            <Stack.Screen name="Login" component={LoginScreen} />
                            <Stack.Screen name="Register" component={RegisterScreen} />
                        </>
                    ) : user.role === 'Admin' || user.role === 'Staff' ? (
                        // Admin Stack
                        <>
                            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
                            <Stack.Screen name="Scanner" component={ScannerScreen} />
                        </>
                    ) : (
                        // Customer Stack
                        <>
                            <Stack.Screen name="CustomerHome" component={CustomerHomeScreen} />
                            <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
                            <Stack.Screen name="Cart" component={CartScreen} />
                        </>
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        </CartProvider>
    );
}
