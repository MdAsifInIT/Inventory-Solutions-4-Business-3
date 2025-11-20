import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from "expo-camera";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScannerScreen({ navigation }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);

    const hasPermission = permission?.granted;

    const handleBarCodeScanned = ({ type, data }) => {
        setScanned(true);
        Alert.alert(
            "Scanned!",
            `Type: ${type}\nData: ${data}`,
            [
                { text: "OK", onPress: () => setScanned(false) }
            ]
        );
        // In a real app, you would call an API here to check-in/check-out the item
    };

    if (hasPermission === null) {
        return <View className="flex-1 justify-center items-center"><Text>Requesting for camera permission</Text></View>;
    }
    if (hasPermission === false) {
        return <View className="flex-1 justify-center items-center"><Text>No access to camera</Text></View>;
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
                    <View className="bg-black/50 px-4 py-2 rounded-full">
                        <Text className="text-white font-bold">Scan Item QR Code</Text>
                    </View>
                </View>

                <View className="absolute bottom-10 left-0 right-0 items-center">
                    <TouchableOpacity 
                        className="bg-white px-6 py-3 rounded-full"
                        onPress={() => navigation.goBack()}
                    >
                        <Text className="text-black font-bold">Cancel</Text>
                    </TouchableOpacity>
                </View>

                {scanned && (
                    <View className="absolute inset-0 justify-center items-center bg-black/50">
                        <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
