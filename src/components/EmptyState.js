import React from 'react';
import { View, Text } from 'react-native';
import { AnimatedButton } from './AnimatedButton';

export const EmptyState = ({
  emoji = '📦',
  title = 'Nothing here yet',
  description = 'Check back later for updates',
  actionText,
  onAction,
}) => {
  return (
    <View className="flex-1 justify-center items-center px-6">
      <Text className="text-6xl mb-4">{emoji}</Text>
      <Text className="text-xl font-bold text-gray-900 mb-2 text-center">{title}</Text>
      <Text className="text-gray-500 text-center mb-6">{description}</Text>
      {actionText && onAction && (
        <AnimatedButton onPress={onAction} className="bg-indigo-600 px-6 py-3 rounded-lg">
          <Text className="text-white font-bold">{actionText}</Text>
        </AnimatedButton>
      )}
    </View>
  );
};
