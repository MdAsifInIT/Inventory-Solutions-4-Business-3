import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { Platform } from 'react-native';

// Replace with your machine's local IP address
// Android Emulator uses 10.0.2.2, iOS Simulator uses localhost
// For physical device, use your computer's LAN IP (e.g., 192.168.1.x)
export const API_URL = 'http://192.168.1.69:5000/api'; 

const AuthContext = createContext(null);

// Helper for storage
const saveItem = async (key, value) => {
    if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
    } else {
        await SecureStore.setItemAsync(key, value);
    }
};

const getItem = async (key) => {
    if (Platform.OS === 'web') {
        return localStorage.getItem(key);
    } else {
        return await SecureStore.getItemAsync(key);
    }
};

const deleteItem = async (key) => {
    if (Platform.OS === 'web') {
        localStorage.removeItem(key);
    } else {
        await SecureStore.deleteItemAsync(key);
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            const storedToken = await getItem('token');
            if (storedToken) {
                setToken(storedToken);
                // Verify token and get user data
                const { data } = await axios.get(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${storedToken}` }
                });
                if (data.success) {
                    setUser(data.data);
                } else {
                    await logout();
                }
            }
        } catch (error) {
            console.log('Auth check failed', error);
            await logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
            if (data.success) {
                const accessToken = data.token; // Assuming API returns token in body for mobile
                await saveItem('token', accessToken);
                setToken(accessToken);
                
                // Fetch user details immediately
                const userRes = await axios.get(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                setUser(userRes.data.data);
                return { success: true };
            }
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Login failed' 
            };
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await axios.post(`${API_URL}/auth/register`, { name, email, password });
            if (data.success) {
                const accessToken = data.token;
                await saveItem('token', accessToken);
                setToken(accessToken);
                setUser(data.user); // Assuming register returns user object
                return { success: true };
            }
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Registration failed' 
            };
        }
    };

    const logout = async () => {
        await deleteItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
