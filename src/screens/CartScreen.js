import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';

export default function CartScreen({ navigation }) {
    const { cart, removeFromCart, clearCart, cartTotal } = useCart();
    const { token } = useAuth();

    const handleCheckout = async () => {
        try {
            const orderItems = cart.map(item => ({
                product: item.product._id,
                name: item.product.name,
                quantity: item.quantity,
                startDate: item.startDate,
                endDate: item.endDate,
                price: item.product.basePrice * item.quantity // Simplified logic
            }));

            const payload = {
                items: orderItems,
                shippingAddress: {
                    fullName: "Mobile User", // Placeholder for now
                    addressLine1: "123 Mobile St",
                    city: "App City",
                    state: "AP",
                    zipCode: "123456",
                    phone: "9999999999"
                },
                totalAmount: cartTotal,
                paymentMethod: 'COD' // Default to COD for mobile MVP
            };

            const { data } = await axios.post(`${API_URL}/orders`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                Alert.alert('Success', 'Order placed successfully!');
                clearCart();
                navigation.navigate('CustomerHome');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to place order');
            console.error(error);
        }
    };

    const renderItem = ({ item }) => (
        <View className="bg-white p-4 rounded-lg mb-3 flex-row justify-between items-center shadow-sm">
            <View className="flex-1">
                <Text className="font-bold text-gray-900">{item.product.name}</Text>
                <Text className="text-gray-500 text-xs">
                    {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                </Text>
                <Text className="text-indigo-600 font-medium mt-1">₹{item.product.basePrice} x {item.quantity}</Text>
            </View>
            <TouchableOpacity 
                onPress={() => removeFromCart(item.product._id)}
                className="bg-red-100 p-2 rounded-full"
            >
                <Text className="text-red-600 text-xs font-bold">Remove</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50 px-4 pt-2">
            <Text className="text-2xl font-bold text-gray-900 mb-4">Your Cart</Text>
            
            {cart.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-500 text-lg">Your cart is empty</Text>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('CustomerHome')}
                        className="mt-4"
                    >
                        <Text className="text-indigo-600 font-bold">Start Browsing</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <FlatList
                        data={cart}
                        renderItem={renderItem}
                        keyExtractor={item => item.product._id}
                        showsVerticalScrollIndicator={false}
                    />
                    <View className="bg-white p-4 rounded-t-3xl shadow-lg border-t border-gray-100 mt-auto">
                        <View className="flex-row justify-between mb-4">
                            <Text className="text-gray-600 text-lg">Total</Text>
                            <Text className="text-2xl font-bold text-indigo-600">₹{cartTotal}</Text>
                        </View>
                        <TouchableOpacity 
                            className="bg-indigo-600 p-4 rounded-xl"
                            onPress={handleCheckout}
                        >
                            <Text className="text-white text-center font-bold text-lg">Checkout (COD)</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
}
