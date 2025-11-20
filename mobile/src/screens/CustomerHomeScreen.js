import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { API_URL, useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CustomerHomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const getPrimaryImage = (images = []) => {
    return Array.isArray(images) && images.length > 0
      ? images[0]
      : "https://via.placeholder.com/300";
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden border border-gray-100"
      onPress={() => navigation.navigate("ProductDetails", { product: item })}
    >
      <Image
        source={{ uri: getPrimaryImage(item.images) }}
        className="w-full h-48"
        resizeMode="cover"
      />
      <View className="p-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-2">
            <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
              {item.name}
            </Text>
            <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>
              {item.description}
            </Text>
          </View>
          <Text className="text-lg font-bold text-indigo-600">
            ₹{item.pricing?.day ?? 0}/day
          </Text>
        </View>
        <View className="flex-row mt-3 items-center">
          <View
            className={`px-2 py-1 rounded-full ${
              item.totalStock > 0 ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                item.totalStock > 0 ? "text-green-800" : "text-red-800"
              }`}
            >
              {item.totalStock > 0 ? "In Stock" : "Out of Stock"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 px-4 pt-2">
      <View className="mb-4 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-gray-900">Discover Gear</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
          <Text className="text-indigo-600 font-medium">Cart</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}
