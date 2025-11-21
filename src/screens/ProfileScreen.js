import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { AnimatedButton } from '../components/AnimatedButton';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            logout();
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" testID="profile-screen">
      <ScrollView className="px-4 pt-4">
        <Text className="text-2xl font-bold text-gray-900 mb-6">Profile</Text>
        
        <View className="bg-white rounded-xl p-6 mb-4 shadow-sm border border-gray-100">
          <View className="items-center mb-6">
            <View className="w-20 h-20 bg-indigo-100 rounded-full items-center justify-center mb-3">
              <Text className="text-4xl">👤</Text>
            </View>
            <Text className="text-xl font-bold text-gray-900">{user?.name || 'User'}</Text>
            <Text className="text-gray-500 mt-1">{user?.email}</Text>
          </View>

          <View className="border-t border-gray-100 pt-4">
            <View className="flex-row justify-between py-3">
              <Text className="text-gray-600">Role</Text>
              <Text className="font-semibold text-gray-900">{user?.role || 'Customer'}</Text>
            </View>
            <View className="flex-row justify-between py-3 border-t border-gray-50">
              <Text className="text-gray-600">Member Since</Text>
              <Text className="font-semibold text-gray-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
          <Text className="font-bold text-gray-900 mb-3">Settings</Text>
          
          <TouchableOpacity className="py-3 flex-row justify-between items-center border-b border-gray-50">
            <Text className="text-gray-700">Notifications</Text>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="py-3 flex-row justify-between items-center border-b border-gray-50">
            <Text className="text-gray-700">Privacy</Text>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="py-3 flex-row justify-between items-center">
            <Text className="text-gray-700">Help & Support</Text>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>
        </View>

        <AnimatedButton
          onPress={handleLogout}
          className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6"
          testID="logout-button"
        >
          <Text className="text-red-600 text-center font-bold text-lg">Logout</Text>
        </AnimatedButton>

        <Text className="text-center text-gray-400 text-xs mb-4">
          Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
