import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import axios from 'axios';
import { API_URL, useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ListSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { SearchBar } from '../components/SearchBar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ProductCard = React.memo(({ item, onPress, index }) => {
  const getPrimaryImage = (images = []) => {
    return Array.isArray(images) && images.length > 0
      ? images[0]
      : 'https://via.placeholder.com/300';
  };

  return (
    <AnimatedTouchable
      entering={FadeInDown.delay(index * 100).springify()}
      className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden border border-gray-100"
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      testID={`product-card-${item._id}`}
    >
      <Image
        source={{ uri: getPrimaryImage(item.images) }}
        style={{ width: '100%', height: 192 }}
        contentFit="cover"
        transition={200}
        placeholder={require('../../assets/icon.png')}
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
              item.totalStock > 0 ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                item.totalStock > 0 ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {item.totalStock > 0 ? `${item.totalStock} Available` : 'Out of Stock'}
            </Text>
          </View>
        </View>
      </View>
    </AnimatedTouchable>
  );
});

export default function CustomerHomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const fetchProducts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const { data } = await axios.get(`${API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (data.success) {
        setProducts(data.data);
        setFilteredProducts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    fetchProducts(true);
  }, []);

  const handleClearSearch = () => {
    setSearchQuery('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderItem = useCallback(
    ({ item, index }) => (
      <ProductCard
        item={item}
        index={index}
        onPress={() => navigation.navigate('ProductDetails', { product: item })}
      />
    ),
    [navigation]
  );

  const keyExtractor = useCallback((item) => item._id, []);

  const getItemLayout = useCallback(
    (data, index) => ({
      length: 280,
      offset: 280 * index,
      index,
    }),
    []
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 px-4 pt-2">
        <View className="mb-4">
          <Text className="text-2xl font-bold text-gray-900">Discover Gear</Text>
        </View>
        <ListSkeleton count={4} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 px-4 pt-2" testID="customer-home-screen">
      <View className="mb-4">
        <Text className="text-2xl font-bold text-gray-900 mb-3">Discover Gear</Text>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search products..."
          onClear={handleClearSearch}
        />
      </View>

      {filteredProducts.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="No products found"
          description={searchQuery ? 'Try adjusting your search' : 'Check back later'}
          actionText={searchQuery ? 'Clear Search' : undefined}
          onAction={searchQuery ? handleClearSearch : undefined}
        />
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4F46E5"
              colors={['#4F46E5']}
            />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={50}
          initialNumToRender={5}
          windowSize={10}
        />
      )}
    </SafeAreaView>
  );
}
