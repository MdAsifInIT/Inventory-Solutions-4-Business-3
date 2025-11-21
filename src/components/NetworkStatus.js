import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import NetInfo from '@react-native-community/netinfo';

export const NetworkStatus = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  if (!isOffline) return null;

  return (
    <Animated.View
      entering={FadeInDown}
      exiting={FadeOutUp}
      className="absolute top-0 left-0 right-0 bg-red-500 p-3 z-50"
    >
      <Text className="text-white text-center font-semibold">
        ⚠️ No Internet Connection
      </Text>
    </Animated.View>
  );
};
