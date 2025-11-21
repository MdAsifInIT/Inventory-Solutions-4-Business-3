import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from "expo-camera";
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL, useAuth } from '../context/AuthContext';

export default function ScannerScreen({ navigation }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [processing, setProcessing] = useState(false);
    const { token } = useAuth();

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);

    const hasPermission = permission?.granted;

    const handleBarCodeScanned = async ({ type, data }) => {
        if (scanned || processing) return;
        
        setScanned(true);
        setProcessing(true);

        try {
            // Extract order ID from QR code data
            // Expected format: orderId or JSON with orderId
            let orderId = data;
            try {
                const parsed = JSON.parse(data);
                orderId = parsed.orderId || parsed.id || data;
            } catch (e) {
                // data is already a plain string
            }

            // Call backend API to process scan
            const response = await axios.post(
                `${API_URL}/orders/${orderId}/scan`,
                { action: 'scan' },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                Alert.alert(
                    "Success! ✅",
                    response.data.message || "Item scanned successfully",
                    [
                        { text: "Scan Another", onPress: () => { setScanned(false); setProcessing(false); } },
                        { text: "Done", onPress: () => navigation.goBack() }
                    ]
                );
            }
        } catch (error) {
            const errorMsg = error.response?.data?.error || "Failed to process scan";
            Alert.alert(
                "Scan Failed ❌",
                errorMsg,
                [
                    { text: "Try Again", onPress: () => { setScanned(false); setProcessing(false); } },
                    { text: "Cancel", onPress: () => navigation.goBack() }
                ]
            );
        } finally {
            setProcessing(false);
        }
    };

    if (hasPermission === null) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text className="text-gray-500 mt-4">Requesting camera permission...</Text>
            </View>
        );
    }
    
    if (hasPermission === false) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50 px-6">
                <Text className="text-xl font-bold text-gray-900 mb-2">Camera Access Required</Text>
                <Text className="text-gray-500 text-center mb-6">
                    Please enable camera access in your device settings to scan QR codes.
                </Text>
                <TouchableOpacity 
                    className="bg-indigo-600 px-6 py-3 rounded-lg"
                    onPress={() => navigation.goBack()}
                >
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            <View className="flex-1 relative">
                <CameraView
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr", "pdf417"],
                    }}
                    style={StyleSheet.absoluteFillObject}
                />
                
                <View className="absolute top-10 left-0 right-0 items-center">
                    <View className="bg-black/70 px-6 py-3 rounded-full">
                        <Text className="text-white font-bold text-base">📷 Scan Order QR Code</Text>
                    </View>
                </View>

                {/* Scanning frame */}
                <View className="absolute inset-0 justify-center items-center">
                    <View className="w-64 h-64 border-4 border-white rounded-2xl opacity-50" />
                </View>

                <View className="absolute bottom-20 left-0 right-0 items-center">
                    <TouchableOpacity 
                        className="bg-white px-8 py-4 rounded-full shadow-lg"
                        onPress={() => navigation.goBack()}
                        disabled={processing}
                    >
                        <Text className="text-black font-bold text-base">Cancel</Text>
                    </TouchableOpacity>
                </View>

                {processing && (
                    <View className="absolute inset-0 justify-center items-center bg-black/70">
                        <ActivityIndicator size="large" color="#fff" />
                        <Text className="text-white font-bold mt-4">Processing scan...</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
