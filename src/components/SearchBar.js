import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export const SearchBar = ({ value, onChangeText, placeholder = 'Search...', onClear }) => {
  return (
    <View className="bg-gray-100 rounded-lg px-4 py-2 flex-row items-center mb-4">
      <Text className="text-gray-400 mr-2">🔍</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        className="flex-1 text-gray-900"
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        autoCorrect={false}
        testID="search-input"
      />
      {value ? (
        <Animated.View entering={FadeIn} exiting={FadeOut}>
          <TouchableOpacity onPress={onClear} testID="search-clear-btn">
            <Text className="text-gray-400 text-lg">✕</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : null}
    </View>
  );
};
