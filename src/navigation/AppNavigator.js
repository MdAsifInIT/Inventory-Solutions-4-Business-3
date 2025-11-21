import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { ActivityIndicator, View, Text } from 'react-native';
import { useCart } from '../context/CartContext';
import Animated, { FadeIn } from 'react-native-reanimated';

import LoginScreen from '../screens/LoginScreen';
import CustomerHomeScreen from '../screens/CustomerHomeScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import CartScreen from '../screens/CartScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import ScannerScreen from '../screens/ScannerScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Cart Badge Component
const CartBadge = ({ count }) => {
  if (count === 0) return null;
  return (
    <Animated.View 
      entering={FadeIn}
      className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center"
    >
      <Text className="text-white text-xs font-bold">{count > 9 ? '9+' : count}</Text>
    </Animated.View>
  );
};

// Customer Tab Navigator
const CustomerTabs = () => {
  const { cart } = useCart();
  const cartCount = cart.length;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={CustomerHomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View>
              <Text style={{ fontSize: size, color }}>🛒</Text>
              <CartBadge count={cartCount} />
            </View>
          ),
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-gray-500 mt-4">Loading...</Text>
      </View>
    );
  }

  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator 
          screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        >
          {!user ? (
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ animation: 'fade' }}
            />
          ) : user.role === 'Admin' || user.role === 'Staff' ? (
            <>
              <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
              <Stack.Screen 
                name="Scanner" 
                component={ScannerScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
            </>
          ) : (
            <>
              <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
              <Stack.Screen 
                name="ProductDetails" 
                component={ProductDetailsScreen}
                options={{
                  headerShown: true,
                  headerTitle: '',
                  headerBackTitle: 'Back',
                  headerTransparent: true,
                  animation: 'slide_from_right',
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}
