import React, { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedButton } from '../components/AnimatedButton';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Login Failed', result.error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" testID="login-screen">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6"
      >
        <Animated.View entering={FadeIn} className="mb-10 items-center">
          <Text className="text-6xl mb-4">🚀</Text>
          <Text className="text-3xl font-bold text-indigo-600 text-center">AntiGravity</Text>
          <Text className="text-gray-500 text-center mt-2">Rental Gear Management</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} className="space-y-4">
          <View>
            <Text className="text-gray-700 mb-2 ml-1 font-medium">Email</Text>
            <TextInput
              className="w-full bg-gray-100 p-4 rounded-lg border border-gray-200 text-gray-900"
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
              testID="email-input"
            />
          </View>

          <View>
            <Text className="text-gray-700 mb-2 ml-1 font-medium">Password</Text>
            <TextInput
              className="w-full bg-gray-100 p-4 rounded-lg border border-gray-200 text-gray-900"
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
              testID="password-input"
            />
          </View>

          <AnimatedButton
            className="bg-indigo-600 p-4 rounded-lg mt-6"
            onPress={handleLogin}
            disabled={loading}
            testID="login-button"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">Login</Text>
            )}
          </AnimatedButton>

          <View className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <Text className="text-sm text-gray-700 font-semibold mb-2">Test Credentials:</Text>
            <Text className="text-xs text-gray-600">Customer: customer@test.com / password123</Text>
            <Text className="text-xs text-gray-600">Admin: admin@test.com / password123</Text>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
