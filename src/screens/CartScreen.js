import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCart } from "../context/CartContext";
import { useAuth, API_URL } from "../context/AuthContext";
import axios from "axios";

export default function CartScreen({ navigation }) {
  const {
    cart,
    removeFromCart,
    clearCart,
    cartTotal,
    calculateRentalPrice,
    syncing,
  } = useCart();
  const { token } = useAuth();
  const [shipping, setShipping] = useState({
    fullName: "",
    addressLine1: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });

  const handleShippingChange = (field, value) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckout = async () => {
    try {
      if (!token) {
        Alert.alert("Login Required", "Please sign in to place an order.");
        navigation.navigate("Login");
        return;
      }
      if (Object.values(shipping).some((value) => !value)) {
        Alert.alert(
          "Missing Information",
          "Please fill in all shipping details"
        );
        return;
      }

      const orderItems = cart.map((item) => {
        const linePrice =
          calculateRentalPrice(item.product, item.startDate, item.endDate) *
          item.quantity;
        return {
          product: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          startDate: item.startDate,
          endDate: item.endDate,
          price: linePrice,
        };
      });

      const payload = {
        items: orderItems,
        shippingAddress: shipping,
        totalAmount: cartTotal,
        paymentMethod: "COD",
      };

      const { data } = await axios.post(`${API_URL}/orders`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        Alert.alert("Success", "Order placed successfully!");
        clearCart();
        setShipping({
          fullName: "",
          addressLine1: "",
          city: "",
          state: "",
          zipCode: "",
          phone: "",
        });
        navigation.navigate("CustomerHome");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to place order");
      console.error(error);
    }
  };

  const renderItem = ({ item }) => {
    const rentalPrice = calculateRentalPrice(
      item.product,
      item.startDate,
      item.endDate
    );
    return (
      <View className="bg-white p-4 rounded-lg mb-3 flex-row justify-between items-center shadow-sm">
        <View className="flex-1">
          <Text className="font-bold text-gray-900">{item.product.name}</Text>
          <Text className="text-gray-500 text-xs">
            {new Date(item.startDate).toLocaleDateString()} -{" "}
            {new Date(item.endDate).toLocaleDateString()}
          </Text>
          <Text className="text-indigo-600 font-medium mt-1">
            ₹{rentalPrice} x {item.quantity}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => removeFromCart(item)}
          className="bg-red-100 p-2 rounded-full"
        >
          <Text className="text-red-600 text-xs font-bold">Remove</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 px-4 pt-2">
      <Text className="text-2xl font-bold text-gray-900 mb-4">Your Cart</Text>

      {syncing && cart.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="text-gray-500 mt-2">Syncing your cart...</Text>
        </View>
      ) : cart.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500 text-lg">Your cart is empty</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("CustomerHome")}
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
            keyExtractor={(item) =>
              item._id ||
              `${item.product._id}-${item.startDate}-${item.endDate}`
            }
            showsVerticalScrollIndicator={false}
          />
          <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mt-4">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Shipping Details
            </Text>
            {[
              { label: "Full Name", field: "fullName" },
              { label: "Address Line 1", field: "addressLine1" },
              { label: "City", field: "city" },
              { label: "State", field: "state" },
              {
                label: "ZIP Code",
                field: "zipCode",
                keyboardType: "number-pad",
              },
              { label: "Phone", field: "phone", keyboardType: "phone-pad" },
            ].map(({ label, field, keyboardType }) => (
              <View key={field} className="mb-3">
                <Text className="text-sm text-gray-600 mb-1">{label}</Text>
                <TextInput
                  className="border border-gray-200 rounded-lg p-3"
                  value={shipping[field]}
                  onChangeText={(value) => handleShippingChange(field, value)}
                  keyboardType={keyboardType}
                />
              </View>
            ))}
          </View>
          <View className="bg-white p-4 rounded-t-3xl shadow-lg border-t border-gray-100 mt-auto">
            <View className="flex-row justify-between mb-4">
              <Text className="text-gray-600 text-lg">Total</Text>
              <Text className="text-2xl font-bold text-indigo-600">
                ₹{cartTotal}
              </Text>
            </View>
            <TouchableOpacity
              className={`p-4 rounded-xl ${
                syncing ? "bg-indigo-300" : "bg-indigo-600"
              }`}
              onPress={handleCheckout}
              disabled={syncing}
            >
              {syncing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center font-bold text-lg">
                  Checkout (COD)
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
