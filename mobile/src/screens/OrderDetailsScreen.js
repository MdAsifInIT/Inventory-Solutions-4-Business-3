import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL, useAuth } from '../context/AuthContext';

export default function OrderDetailsScreen({ route, navigation }) {
    const { orderId } = route.params;
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        fetchOrderDetails();
    }, []);

    const fetchOrderDetails = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setOrder(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch order details', error);
        } finally {
            setLoading(false);
        }
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

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    if (!order) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
                <Text className="text-gray-500">Order not found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
                    <Text className="text-indigo-600 font-bold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1 px-4 pt-6">
                {/* Header */}
                <View className="bg-white rounded-2xl shadow-sm p-6 mb-4 border border-gray-100">
                    <View className="flex-row justify-between items-start mb-4">
                        <View>
                            <Text className="text-gray-500 text-sm">Order ID</Text>
                            <Text className="text-gray-900 font-bold text-xl mt-1">
                                #{order._id?.slice(-8).toUpperCase()}
                            </Text>
                        </View>
                        <View className={`px-4 py-2 rounded-full ${getStatusColor(order.status)}`}>
                            <Text className="text-sm font-medium">{order.status || 'Pending'}</Text>
                        </View>
                    </View>

                    <View className="border-t border-gray-100 pt-4">
                        <Text className="text-gray-500 text-sm">Order Date</Text>
                        <Text className="text-gray-900 font-medium mt-1">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </Text>
                    </View>
                </View>

                {/* Items */}
                <View className="bg-white rounded-2xl shadow-sm p-6 mb-4 border border-gray-100">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Order Items</Text>
                    {order.items?.map((item, index) => (
                        <View 
                            key={index} 
                            className={`pb-4 mb-4 ${index < order.items.length - 1 ? 'border-b border-gray-100' : ''}`}
                        >
                            <Text className="text-gray-900 font-bold text-base">{item.name}</Text>
                            <View className="flex-row justify-between mt-2">
                                <Text className="text-gray-500 text-sm">Quantity: {item.quantity}</Text>
                                <Text className="text-indigo-600 font-bold">₹{item.price?.toLocaleString()}</Text>
                            </View>
                            {item.startDate && item.endDate && (
                                <Text className="text-gray-400 text-xs mt-1">
                                    {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                                </Text>
                            )}
                        </View>
                    ))}
                </View>

                {/* Shipping Address */}
                {order.shippingAddress && (
                    <View className="bg-white rounded-2xl shadow-sm p-6 mb-4 border border-gray-100">
                        <Text className="text-lg font-bold text-gray-900 mb-4">Delivery Address</Text>
                        <Text className="text-gray-900 font-medium">{order.shippingAddress.fullName}</Text>
                        <Text className="text-gray-600 mt-2">{order.shippingAddress.addressLine1}</Text>
                        <Text className="text-gray-600">
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                        </Text>
                        <Text className="text-gray-600 mt-2">Phone: {order.shippingAddress.phone}</Text>
                    </View>
                )}

                {/* Payment Summary */}
                <View className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Payment Summary</Text>
                    <View className="space-y-2">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Payment Method</Text>
                            <Text className="text-gray-900 font-medium">{order.paymentMethod || 'COD'}</Text>
                        </View>
                        <View className="flex-row justify-between mt-2">
                            <Text className="text-gray-600">Payment Status</Text>
                            <Text className={`font-medium ${
                                order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                                {order.paymentStatus || 'Pending'}
                            </Text>
                        </View>
                        <View className="border-t border-gray-200 mt-4 pt-4">
                            <View className="flex-row justify-between">
                                <Text className="text-gray-900 font-bold text-lg">Total Amount</Text>
                                <Text className="text-indigo-600 font-bold text-xl">₹{order.totalAmount?.toLocaleString()}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
