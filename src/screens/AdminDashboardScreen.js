import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL, useAuth } from '../context/AuthContext';
import { AnimatedButton } from '../components/AnimatedButton';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const StatCard = ({ label, value, color, index }) => (
  <Animated.View
    entering={FadeInDown.delay(index * 100).springify()}
    className={`w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-100`}
  >
    <Text className="text-gray-500 text-xs uppercase font-bold">{label}</Text>
    <Text className={`text-2xl font-bold ${color} mt-1`}>
      {typeof value === 'number' && label === 'Revenue' ? `₹${value.toLocaleString()}` : value || 0}
    </Text>
  </Animated.View>
);

export default function AdminDashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token, logout } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const { data } = await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    logout();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-gray-500 mt-2">Loading dashboard...</Text>
      </View>
    );
  }

  const { kpi } = stats || { kpi: {} };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 px-4 pt-2" testID="admin-dashboard">
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Dashboard</Text>
          <Text className="text-gray-500 text-sm">Admin Overview</Text>
        </View>
        <AnimatedButton onPress={handleLogout} testID="admin-logout-button">
          <Text className="text-red-600 font-semibold">Logout</Text>
        </AnimatedButton>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchStats(true)}
            tintColor="#4F46E5"
            colors={['#4F46E5']}
          />
        }
      >
        <View className="flex-row flex-wrap justify-between">
          <StatCard
            label="Revenue"
            value={kpi.revenue}
            color="text-indigo-600"
            index={0}
          />
          <StatCard
            label="Active Rentals"
            value={kpi.activeRentals}
            color="text-green-600"
            index={1}
          />
          <StatCard
            label="Total Products"
            value={kpi.totalProducts}
            color="text-blue-600"
            index={2}
          />
          <StatCard
            label="Low Stock"
            value={kpi.lowStock}
            color="text-red-600"
            index={3}
          />
        </View>

        <Animated.View entering={FadeInDown.delay(400)} className="mt-6 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Quick Actions</Text>
          <AnimatedButton
            onPress={() => navigation.navigate('Scanner')}
            className="bg-indigo-600 p-4 rounded-xl mb-3 flex-row items-center justify-center shadow-sm"
            testID="scan-qr-button"
          >
            <Text className="text-white font-bold text-lg mr-2">📷</Text>
            <Text className="text-white font-bold text-lg">Scan QR Code</Text>
          </AnimatedButton>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
