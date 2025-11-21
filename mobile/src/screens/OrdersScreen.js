import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL, useAuth } from '../context/AuthContext';

export default function OrdersScreen({ navigation }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { token } = useAuth();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/orders/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setOrders(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-gray-100 text-gray-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            className="bg-white rounded-xl shadow-sm mb-4 p-4 border border-gray-100"
            onPress={() => navigation.navigate('OrderDetails', { orderId: item._id })}
        >
            <View className="flex-row justify-between items-start mb-3">
                <View>
                    <Text className="text-gray-500 text-xs">Order #{item._id?.slice(-8).toUpperCase()}</Text>
                    <Text className="text-gray-900 font-bold text-lg mt-1">₹{item.totalAmount?.toLocaleString()}</Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
                    <Text className="text-xs font-medium">{item.status || 'Pending'}</Text>
                </View>
            </View>

            <View className="border-t border-gray-100 pt-3">
                <Text className="text-gray-600 text-sm">
                    {item.items?.length || 0} item{item.items?.length !== 1 ? 's' : ''}
                </Text>
                <Text className="text-gray-400 text-xs mt-1">
                    Placed on {new Date(item.createdAt).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                    })}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-4 pt-2">
                <Text className="text-2xl font-bold text-gray-900 mb-4">My Orders</Text>
            </View>

            {orders.length === 0 ? (
                <View className="flex-1 justify-center items-center px-4">
                    <Text className="text-gray-500 text-lg text-center">No orders yet</Text>
                    <Text className="text-gray-400 text-sm mt-2 text-center">Your rental orders will appear here</Text>
                    <TouchableOpacity 
                        className="mt-6 bg-indigo-600 px-6 py-3 rounded-lg"
                        onPress={() => navigation.navigate('CustomerHome')}
                    >
                        <Text className="text-white font-bold">Start Shopping</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />
                    }
                />
            )}
        </SafeAreaView>
    );
}
