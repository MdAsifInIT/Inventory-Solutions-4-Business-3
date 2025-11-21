import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions, FlashMode } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AnimatedButton } from '../components/AnimatedButton';

export default function ScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashMode, setFlashMode] = useState('off');

  useEffect(() => {
    if (!permission?.granted && permission?.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const hasPermission = permission?.granted;

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Alert.alert(
      'QR Code Scanned!',
      `Type: ${type}\nData: ${data}`,
      [
        { 
          text: 'Scan Again', 
          onPress: () => {
            setScanned(false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        },
        { text: 'Done', onPress: () => navigation.goBack() }
      ]
    );
  };

  const toggleFlash = () => {
    setFlashMode(prev => prev === 'off' ? 'on' : 'off');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSettingsPress = () => {
    Alert.alert(
      'Camera Permission',
      'Camera permission is required to scan QR codes. Please enable it in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => {
          // In production, use Linking.openSettings()
          Alert.alert('Info', 'Would open device settings');
        }}
      ]
    );
  };

  if (permission === null) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <Text className="text-white">Requesting camera permission...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center px-6">
        <Animated.View entering={ZoomIn} className="items-center">
          <Text className="text-6xl mb-4">📸</Text>
          <Text className="text-white text-xl font-bold mb-2">Camera Access Required</Text>
          <Text className="text-gray-300 text-center mb-6">
            We need camera permission to scan QR codes
          </Text>
          <AnimatedButton
            onPress={permission?.canAskAgain ? requestPermission : handleSettingsPress}
            className="bg-indigo-600 px-6 py-3 rounded-lg mb-3"
          >
            <Text className="text-white font-bold">
              {permission?.canAskAgain ? 'Grant Permission' : 'Open Settings'}
            </Text>
          </AnimatedButton>
          <AnimatedButton
            onPress={() => navigation.goBack()}
            className="bg-gray-700 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-bold">Go Back</Text>
          </AnimatedButton>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top', 'bottom']}>
      <View className="flex-1 relative">
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'pdf417'],
          }}
          flash={flashMode}
          style={StyleSheet.absoluteFillObject}
        />
        
        {/* Scanner Frame Overlay */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <View className="flex-1 justify-center items-center">
            <Animated.View
              entering={FadeIn}
              className="w-64 h-64 border-4 border-white rounded-2xl"
              style={{ borderStyle: 'dashed' }}
            />
          </View>
        </View>

        {/* Top Instruction */}
        <Animated.View entering={FadeIn.delay(200)} className="absolute top-10 left-0 right-0 items-center">
          <View className="bg-black/70 px-6 py-3 rounded-full">
            <Text className="text-white font-bold text-center">
              {scanned ? '✓ Scanned Successfully!' : 'Position QR code within frame'}
            </Text>
          </View>
        </Animated.View>

        {/* Bottom Controls */}
        <Animated.View entering={FadeIn.delay(300)} className="absolute bottom-10 left-0 right-0 items-center">
          <View className="flex-row items-center gap-4">
            {/* Torch/Flash Button */}
            <AnimatedButton
              onPress={toggleFlash}
              className={`px-5 py-3 rounded-full ${
                flashMode === 'on' ? 'bg-yellow-500' : 'bg-white/90'
              }`}
              testID="flash-toggle"
            >
              <Text className="text-xl">{flashMode === 'on' ? '🔦' : '🔆'}</Text>
            </AnimatedButton>

            {/* Cancel Button */}
            <AnimatedButton
              onPress={() => navigation.goBack()}
              className="bg-white/90 px-8 py-3 rounded-full"
              testID="cancel-scan"
            >
              <Text className="text-black font-bold">Cancel</Text>
            </AnimatedButton>
          </View>
        </Animated.View>

        {/* Scanned Overlay */}
        {scanned && (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            className="absolute inset-0 justify-center items-center bg-black/80"
          >
            <AnimatedButton
              onPress={() => setScanned(false)}
              className="bg-white px-8 py-4 rounded-full"
            >
              <Text className="text-black font-bold text-lg">Tap to Scan Again</Text>
            </AnimatedButton>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}
