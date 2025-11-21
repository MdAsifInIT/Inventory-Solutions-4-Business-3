import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL, useAuth } from '../context/AuthContext';

export default function AdminDashboardScreen({ navigation }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { token, logout } = useAuth();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    const { kpi } = stats || { kpi: {} };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 px-4 pt-2">
            <View className="mb-6">
                <Text className="text-2xl font-bold text-gray-900">Admin Dashboard</Text>
                <Text className="text-gray-500 text-sm mt-1">Manage your rental business</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="flex-row flex-wrap justify-between">
                    <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-100">
                        <Text className="text-gray-500 text-xs uppercase font-bold">Revenue</Text>
                        <Text className="text-2xl font-bold text-indigo-600 mt-1">₹{kpi.revenue?.toLocaleString() || 0}</Text>
                    </View>
                    <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-100">
                        <Text className="text-gray-500 text-xs uppercase font-bold">Active Rentals</Text>
                        <Text className="text-2xl font-bold text-green-600 mt-1">{kpi.activeRentals || 0}</Text>
                    </View>
                    <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-100">
                        <Text className="text-gray-500 text-xs uppercase font-bold">Total Products</Text>
                        <Text className="text-2xl font-bold text-blue-600 mt-1">{kpi.totalProducts || 0}</Text>
                    </View>
                    <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-100">
                        <Text className="text-gray-500 text-xs uppercase font-bold">Low Stock</Text>
                        <Text className="text-2xl font-bold text-red-600 mt-1">{kpi.lowStock || 0}</Text>
                    </View>
                </View>

                <View className="mt-6">
                    <Text className="text-lg font-bold text-gray-900 mb-3">Quick Actions</Text>
                    <TouchableOpacity 
                        className="bg-indigo-600 p-4 rounded-xl mb-3 flex-row items-center justify-center"
                        onPress={() => {
                            // Navigate to Scanner tab
                            if (navigation.getParent()) {
                                navigation.getParent().navigate('Scanner');
                            }
                        }}
                    >
                        <Text className="text-white font-bold text-lg">📷 Scan QR Code</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
