import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCart } from "../context/CartContext";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

export default function ProductDetailsScreen({ route, navigation }) {
  const { product } = route.params;
  const { addToCart } = useCart();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 3))
  ); // Default 3 days
  const pricing = product.pricing || {};

  const primaryImage =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : "https://via.placeholder.com/400";

  const ensureEndDateIsAfterStart = (maybeEndDate) => {
    if (maybeEndDate <= startDate) {
      const adjusted = new Date(startDate);
      adjusted.setDate(adjusted.getDate() + 1);
      return adjusted;
    }
    return maybeEndDate;
  };

  const openDatePicker = (type) => {
    const currentValue = type === "start" ? startDate : endDate;

    DateTimePickerAndroid.open({
      value: currentValue,
      mode: "date",
      minimumDate:
        type === "start"
          ? new Date()
          : new Date(startDate.getTime() + 24 * 60 * 60 * 1000),
      onChange: (_, selectedDate) => {
        if (!selectedDate) return;

        if (type === "start") {
          setStartDate(selectedDate);
          setEndDate((prev) => ensureEndDateIsAfterStart(prev));
        } else {
          setEndDate(ensureEndDateIsAfterStart(selectedDate));
        }
      },
    });
  };

  const handleAddToCart = () => {
    if (endDate <= startDate) {
      Alert.alert("Invalid Dates", "End date must be after start date");
      return;
    }
    addToCart(product, startDate.toISOString(), endDate.toISOString());
    Alert.alert("Success", "Added to cart!", [
      { text: "Continue Shopping", onPress: () => navigation.goBack() },
      { text: "Go to Cart", onPress: () => navigation.navigate("Cart") },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        <Image
          source={{ uri: primaryImage }}
          className="w-full h-72"
          resizeMode="cover"
        />

        <View className="p-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-gray-900 flex-1 mr-2">
              {product.name}
            </Text>
            <Text className="text-xl font-bold text-indigo-600">
              ₹{pricing.day ?? 0}/day
            </Text>
          </View>

          <View className="flex-row mb-6">
            <View
              className={`px-3 py-1 rounded-full ${
                product.totalStock > 0 ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  product.totalStock > 0 ? "text-green-800" : "text-red-800"
                }`}
              >
                {product.totalStock > 0
                  ? `${product.totalStock} Available`
                  : "Out of Stock"}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-6">
            <View className="flex-1 bg-gray-50 p-4 rounded-lg mr-2 border border-gray-100">
              <Text className="text-sm text-gray-500">Daily</Text>
              <Text className="text-xl font-bold text-gray-900">
                ₹{pricing.day ?? 0}
              </Text>
            </View>
            <View className="flex-1 bg-gray-50 p-4 rounded-lg mr-2 border border-gray-100">
              <Text className="text-sm text-gray-500">Weekly</Text>
              <Text className="text-xl font-bold text-gray-900">
                ₹{pricing.week ?? 0}
              </Text>
            </View>
            <View className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <Text className="text-sm text-gray-500">Monthly</Text>
              <Text className="text-xl font-bold text-gray-900">
                ₹{pricing.month ?? 0}
              </Text>
            </View>
          </View>

          <Text className="text-gray-500 leading-6 mb-6">
            {product.description}
          </Text>

          <View className="bg-gray-50 p-4 rounded-lg mb-6">
            <Text className="font-semibold mb-4">Rental Period</Text>
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="flex-1 bg-white rounded-lg border border-gray-200 p-3 mr-2"
                onPress={() => openDatePicker("start")}
              >
                <Text className="text-xs text-gray-500">Start Date</Text>
                <Text className="text-base font-semibold text-gray-900">
                  {startDate.toDateString()}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-white rounded-lg border border-gray-200 p-3"
                onPress={() => openDatePicker("end")}
              >
                <Text className="text-xs text-gray-500">End Date</Text>
                <Text className="text-base font-semibold text-gray-900">
                  {endDate.toDateString()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className={`p-4 rounded-xl ${
              product.totalStock > 0 ? "bg-indigo-600" : "bg-gray-300"
            }`}
            onPress={handleAddToCart}
            disabled={product.totalStock === 0}
          >
            <Text className="text-white text-center font-bold text-lg">
              {product.totalStock > 0 ? "Add to Cart" : "Out of Stock"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
