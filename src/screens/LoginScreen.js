import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        if (!result.success) {
            Alert.alert('Login Failed', result.error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white justify-center px-6">
            <View className="mb-10">
                <Text className="text-3xl font-bold text-indigo-600 text-center">AntiGravity</Text>
                <Text className="text-gray-500 text-center mt-2">Rental Gear Management</Text>
            </View>

            <View className="space-y-4">
                <View>
                    <Text className="text-gray-700 mb-1 ml-1">Email</Text>
                    <TextInput
                        className="w-full bg-gray-100 p-4 rounded-lg border border-gray-200"
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                <View>
                    <Text className="text-gray-700 mb-1 ml-1">Password</Text>
                    <TextInput
                        className="w-full bg-gray-100 p-4 rounded-lg border border-gray-200"
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity 
                    className="bg-indigo-600 p-4 rounded-lg mt-6"
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-center font-bold text-lg">Login</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Register')} className="mt-4">
                    <Text className="text-center text-gray-500">
                        Don't have an account? <Text className="text-indigo-600 font-bold">Sign Up</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
