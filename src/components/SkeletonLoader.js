import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

export const ProductCardSkeleton = () => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <View className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden border border-gray-100">
      <Animated.View style={[animatedStyle]} className="w-full h-48 bg-gray-200" />
      <View className="p-4">
        <Animated.View style={[animatedStyle]} className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
        <Animated.View style={[animatedStyle]} className="h-4 bg-gray-200 rounded w-full mb-1" />
        <Animated.View style={[animatedStyle]} className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
        <View className="flex-row justify-between items-center">
          <Animated.View style={[animatedStyle]} className="h-6 bg-gray-200 rounded w-20" />
          <Animated.View style={[animatedStyle]} className="h-8 bg-gray-200 rounded w-24" />
        </View>
      </View>
    </View>
  );
};

export const ListSkeleton = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </>
  );
};
