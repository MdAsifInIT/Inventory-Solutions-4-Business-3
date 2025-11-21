import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Platform,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AnimatedButton } from '../components/AnimatedButton';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export default function ProductDetailsScreen({ route, navigation }) {
  const { product } = route.params;
  const { addToCart } = useCart();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 3))
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const pricing = product.pricing || {};

  const primaryImage =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : 'https://via.placeholder.com/400';

  const ensureEndDateIsAfterStart = (maybeEndDate) => {
    if (maybeEndDate <= startDate) {
      const adjusted = new Date(startDate);
      adjusted.setDate(adjusted.getDate() + 1);
      return adjusted;
    }
    return maybeEndDate;
  };

  const handleStartDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
    }
    if (selectedDate) {
      setStartDate(selectedDate);
      setEndDate((prev) => ensureEndDateIsAfterStart(prev));
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowEndPicker(false);
    }
    if (selectedDate) {
      setEndDate(ensureEndDateIsAfterStart(selectedDate));
    }
  };

  const handleAddToCart = async () => {
    if (endDate <= startDate) {
      Alert.alert('Invalid Dates', 'End date must be after start date');
      return;
    }
    
    setLoading(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addToCart(product, startDate.toISOString(), endDate.toISOString());
    setLoading(false);
    
    Alert.alert('Success', 'Added to cart!', [
      { text: 'Continue Shopping', onPress: () => navigation.goBack() },
      { text: 'Go to Cart', onPress: () => navigation.navigate('CustomerTabs', { screen: 'Cart' }) },
    ]);
  };

  const DatePickerButton = ({ label, date, onPress, testID }) => (
    <AnimatedButton
      onPress={onPress}
      className="flex-1 bg-white rounded-lg border border-gray-200 p-3"
      testID={testID}
    >
      <Text className="text-xs text-gray-500">{label}</Text>
      <Text className="text-base font-semibold text-gray-900 mt-1">
        {date.toLocaleDateString()}
      </Text>
    </AnimatedButton>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']} testID="product-details-screen">
      <ScrollView>
        <Animated.View entering={FadeIn}>
          <Image
            source={{ uri: primaryImage }}
            style={{ width: '100%', height: 288 }}
            contentFit="cover"
            transition={300}
          />
        </Animated.View>

        <Animated.View entering={SlideInDown} className="p-6">
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
                product.totalStock > 0 ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  product.totalStock > 0 ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {product.totalStock > 0
                  ? `${product.totalStock} Available`
                  : 'Out of Stock'}
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
            <View className="flex-row justify-between gap-2">
              <DatePickerButton
                label="Start Date"
                date={startDate}
                onPress={() => setShowStartPicker(true)}
                testID="start-date-picker"
              />
              <DatePickerButton
                label="End Date"
                date={endDate}
                onPress={() => setShowEndPicker(true)}
                testID="end-date-picker"
              />
            </View>
          </View>

          <AnimatedButton
            onPress={handleAddToCart}
            disabled={product.totalStock === 0 || loading}
            className={`p-4 rounded-xl ${
              product.totalStock > 0 && !loading ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
            testID="add-to-cart-button"
          >
            <Text className="text-white text-center font-bold text-lg">
              {loading ? 'Adding...' : product.totalStock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Text>
          </AnimatedButton>
        </Animated.View>
      </ScrollView>

      {/* iOS Date Picker Modal */}
      {Platform.OS === 'ios' && showStartPicker && (
        <Modal
          transparent
          animationType="slide"
          visible={showStartPicker}
          onRequestClose={() => setShowStartPicker(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl">
              <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                <TouchableOpacity onPress={() => setShowStartPicker(false)}>
                  <Text className="text-indigo-600 font-semibold">Cancel</Text>
                </TouchableOpacity>
                <Text className="font-semibold">Start Date</Text>
                <TouchableOpacity onPress={() => setShowStartPicker(false)}>
                  <Text className="text-indigo-600 font-semibold">Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={startDate}
                mode="date"
                display="spinner"
                onChange={handleStartDateChange}
                minimumDate={new Date()}
              />
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === 'ios' && showEndPicker && (
        <Modal
          transparent
          animationType="slide"
          visible={showEndPicker}
          onRequestClose={() => setShowEndPicker(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl">
              <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                <TouchableOpacity onPress={() => setShowEndPicker(false)}>
                  <Text className="text-indigo-600 font-semibold">Cancel</Text>
                </TouchableOpacity>
                <Text className="font-semibold">End Date</Text>
                <TouchableOpacity onPress={() => setShowEndPicker(false)}>
                  <Text className="text-indigo-600 font-semibold">Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={endDate}
                mode="date"
                display="spinner"
                onChange={handleEndDateChange}
                minimumDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Android Date Pickers */}
      {Platform.OS === 'android' && showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
          minimumDate={new Date()}
        />
      )}

      {Platform.OS === 'android' && showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
          minimumDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)}
        />
      )}
    </SafeAreaView>
  );
}
