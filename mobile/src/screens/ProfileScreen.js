import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Logout', 
                    style: 'destructive',
                    onPress: logout 
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1 px-4 pt-6">
                <View className="bg-white rounded-2xl shadow-sm p-6 mb-4 border border-gray-100">
                    <View className="items-center mb-4">
                        <View className="w-20 h-20 bg-indigo-600 rounded-full items-center justify-center mb-3">
                            <Text className="text-white text-3xl font-bold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <Text className="text-2xl font-bold text-gray-900">{user?.name}</Text>
                        <Text className="text-gray-500 mt-1">{user?.email}</Text>
                        <View className="mt-3 px-3 py-1 bg-indigo-100 rounded-full">
                            <Text className="text-indigo-700 font-medium text-sm">{user?.role || 'Customer'}</Text>
                        </View>
                    </View>
                </View>

                <View className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden border border-gray-100">
                    <Text className="text-lg font-bold text-gray-900 p-4 border-b border-gray-100">Account</Text>
                    
                    <TouchableOpacity 
                        className="flex-row justify-between items-center p-4 border-b border-gray-100 active:bg-gray-50"
                        onPress={() => navigation.navigate('Orders')}
                    >
                        <Text className="text-gray-700 text-base">My Orders</Text>
                        <Text className="text-gray-400">›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row justify-between items-center p-4 active:bg-gray-50">
                        <Text className="text-gray-700 text-base">Saved Addresses</Text>
                        <Text className="text-gray-400">›</Text>
                    </TouchableOpacity>
                </View>

                <View className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden border border-gray-100">
                    <Text className="text-lg font-bold text-gray-900 p-4 border-b border-gray-100">Support</Text>
                    
                    <TouchableOpacity className="flex-row justify-between items-center p-4 border-b border-gray-100 active:bg-gray-50">
                        <Text className="text-gray-700 text-base">Help Center</Text>
                        <Text className="text-gray-400">›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row justify-between items-center p-4 active:bg-gray-50">
                        <Text className="text-gray-700 text-base">Terms & Conditions</Text>
                        <Text className="text-gray-400">›</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    className="bg-red-50 rounded-2xl p-4 mb-6 border border-red-200"
                    onPress={handleLogout}
                >
                    <Text className="text-red-600 text-center font-bold text-lg">Logout</Text>
                </TouchableOpacity>

                <Text className="text-center text-gray-400 text-sm mb-6">Version 1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}
