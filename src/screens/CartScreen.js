import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Alert,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { useAuth, API_URL } from '../context/AuthContext';
import axios from 'axios';
import { AnimatedButton } from '../components/AnimatedButton';
import { EmptyState } from '../components/EmptyState';
import Animated, { FadeInRight, FadeOutLeft, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedView = Animated.View;

const CartItem = React.memo(({ item, onRemove, calculateRentalPrice }) => {
  const rentalPrice = calculateRentalPrice(
    item.product,
    item.startDate,
    item.endDate
  );

  return (
    <AnimatedView
      entering={FadeInRight}
      exiting={FadeOutLeft}
      layout={Layout.springify()}
      className="bg-white p-4 rounded-lg mb-3 shadow-sm border border-gray-100"
      testID={`cart-item-${item._id || item.product._id}`}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-3">
          <Text className="font-bold text-gray-900 text-base">{item.product.name}</Text>
          <Text className="text-gray-500 text-xs mt-1">
            {new Date(item.startDate).toLocaleDateString()} -{' '}
            {new Date(item.endDate).toLocaleDateString()}
          </Text>
          <Text className="text-indigo-600 font-medium mt-2">
            ₹{rentalPrice} x {item.quantity} = ₹{rentalPrice * item.quantity}
          </Text>
        </View>
        <AnimatedButton
          onPress={() => onRemove(item)}
          className="bg-red-50 px-3 py-2 rounded-lg border border-red-100"
          testID={`remove-cart-item-${item._id || item.product._id}`}
        >
          <Text className="text-red-600 text-xs font-bold">Remove</Text>
        </AnimatedButton>
      </View>
    </AnimatedView>
  );
});

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
    fullName: '',
    addressLine1: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleShippingChange = (field, value) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  };

  const handleRemove = async (item) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromCart(item),
        },
      ]
    );
  };

  const handleCheckout = async () => {
    try {
      if (!token) {
        Alert.alert('Login Required', 'Please sign in to place an order.');
        return;
      }
      
      if (Object.values(shipping).some((value) => !value)) {
        Alert.alert(
          'Missing Information',
          'Please fill in all shipping details'
        );
        return;
      }

      setCheckoutLoading(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

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
        paymentMethod: 'COD',
      };

      const { data } = await axios.post(`${API_URL}/orders`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        Alert.alert('Success', 'Order placed successfully!', [
          {
            text: 'OK',
            onPress: () => {
              clearCart();
              setShipping({
                fullName: '',
                addressLine1: '',
                city: '',
                state: '',
                zipCode: '',
                phone: '',
              });
              navigation.navigate('Home');
            },
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to place order');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <CartItem
      item={item}
      onRemove={handleRemove}
      calculateRentalPrice={calculateRentalPrice}
    />
  );

  if (syncing && cart.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-gray-500 mt-2">Syncing your cart...</Text>
      </SafeAreaView>
    );
  }

  if (cart.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" testID="cart-screen">
        <View className="px-4 pt-2">
          <Text className="text-2xl font-bold text-gray-900 mb-4">Your Cart</Text>
        </View>
        <EmptyState
          emoji="🛒"
          title="Your cart is empty"
          description="Add some items to get started"
          actionText="Start Shopping"
          onAction={() => navigation.navigate('Home')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" testID="cart-screen">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="px-4 pt-2 flex-1">
          <Text className="text-2xl font-bold text-gray-900 mb-4">Your Cart</Text>

          <FlatList
            data={cart}
            renderItem={renderItem}
            keyExtractor={(item) =>
              item._id || `${item.product._id}-${item.startDate}-${item.endDate}`
            }
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mt-4 mb-4">
                <Text className="text-lg font-bold text-gray-900 mb-3">
                  Shipping Details
                </Text>
                {[
                  { label: 'Full Name', field: 'fullName' },
                  { label: 'Address Line 1', field: 'addressLine1' },
                  { label: 'City', field: 'city' },
                  { label: 'State', field: 'state' },
                  {
                    label: 'ZIP Code',
                    field: 'zipCode',
                    keyboardType: 'number-pad',
                  },
                  { label: 'Phone', field: 'phone', keyboardType: 'phone-pad' },
                ].map(({ label, field, keyboardType }) => (
                  <View key={field} className="mb-3">
                    <Text className="text-sm text-gray-600 mb-1">{label}</Text>
                    <TextInput
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50 text-gray-900"
                      value={shipping[field]}
                      onChangeText={(value) => handleShippingChange(field, value)}
                      keyboardType={keyboardType}
                      placeholder={`Enter ${label.toLowerCase()}`}
                      placeholderTextColor="#9CA3AF"
                      testID={`shipping-${field}`}
                    />
                  </View>
                ))}
              </View>
            }
          />
        </View>

        <AnimatedView
          entering={FadeInRight}
          className="bg-white p-4 border-t border-gray-200 shadow-lg"
        >
          <View className="flex-row justify-between mb-4">
            <Text className="text-gray-600 text-lg">Total</Text>
            <Text className="text-2xl font-bold text-indigo-600">
              ₹{cartTotal}
            </Text>
          </View>
          <AnimatedButton
            onPress={handleCheckout}
            disabled={syncing || checkoutLoading}
            className={`p-4 rounded-xl ${
              syncing || checkoutLoading ? 'bg-indigo-300' : 'bg-indigo-600'
            }`}
            testID="checkout-button"
          >
            {syncing || checkoutLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">
                Checkout (COD)
              </Text>
            )}
          </AnimatedButton>
        </AnimatedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
