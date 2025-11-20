import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';

export default function ProductDetailsScreen({ route, navigation }) {
    const { product } = route.params;
    const { addToCart } = useCart();
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 3))); // Default 3 days

    const handleAddToCart = () => {
        addToCart(product, startDate.toISOString(), endDate.toISOString());
        Alert.alert('Success', 'Added to cart!', [
            { text: 'Continue Shopping', onPress: () => navigation.goBack() },
            { text: 'Go to Cart', onPress: () => navigation.navigate('Cart') }
        ]);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView>
                <Image 
                    source={{ uri: product.images?.[0]?.url || 'https://via.placeholder.com/400' }} 
                    className="w-full h-72"
                    resizeMode="cover"
                />
                
                <View className="p-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-2xl font-bold text-gray-900 flex-1 mr-2">{product.name}</Text>
                        <Text className="text-xl font-bold text-indigo-600">₹{product.basePrice}/day</Text>
                    </View>

                    <View className="flex-row mb-6">
                        <View className={`px-3 py-1 rounded-full ${product.totalStock > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                            <Text className={`text-sm font-medium ${product.totalStock > 0 ? 'text-green-800' : 'text-red-800'}`}>
                                {product.totalStock > 0 ? `${product.totalStock} Available` : 'Out of Stock'}
                            </Text>
                        </View>
                    </View>

                    <Text className="text-gray-500 leading-6 mb-6">
                        {product.description}
                    </Text>

                    <View className="bg-gray-50 p-4 rounded-lg mb-6">
                        <Text className="font-semibold mb-2">Rental Period (Default: 3 Days)</Text>
                        <Text className="text-gray-600">From: {startDate.toDateString()}</Text>
                        <Text className="text-gray-600">To: {endDate.toDateString()}</Text>
                    </View>

                    <TouchableOpacity 
                        className={`p-4 rounded-xl ${product.totalStock > 0 ? 'bg-indigo-600' : 'bg-gray-300'}`}
                        onPress={handleAddToCart}
                        disabled={product.totalStock === 0}
                    >
                        <Text className="text-white text-center font-bold text-lg">
                            {product.totalStock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
