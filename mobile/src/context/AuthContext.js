import React, { createContext, useState, useContext, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";

// API base URL is provided via Expo config (app.config.js -> extra.apiUrl)
const getBaseUrl = () => {
  if (Constants.expoConfig?.extra?.apiUrl) {
    return Constants.expoConfig.extra.apiUrl;
  }
  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000/api";
  }
  return "http://localhost:5000/api";
};

export const API_URL = getBaseUrl();

const AuthContext = createContext(null);

// Helper for storage
const saveItem = async (key, value) => {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const getItem = async (key) => {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

const deleteItem = async (key) => {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

export const api = axios.create({
  baseURL: API_URL,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const storedToken = await getItem("token");
      if (storedToken) {
        setToken(storedToken);
        // Verify token and get user data
        api.defaults.baseURL = API_URL;
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

        const { data } = await api.get(`/auth/me`);
        if (data.success) {
          setUser(data.data);
        } else {
          await logout();
        }
      }
    } catch (error) {
      console.log("Auth check failed", error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post(`/auth/login`, {
        email,
        password,
      });
      if (data.success) {
        const accessToken = data.token; // Assuming API returns token in body for mobile
        await saveItem("token", accessToken);
        setToken(accessToken);

        // Fetch user details immediately
        api.defaults.baseURL = API_URL;
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        const userRes = await api.get(`/auth/me`);
        setUser(userRes.data.data);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post(`/auth/register`, {
        name,
        email,
        password,
      });
      if (data.success) {
        const accessToken = data.token;
        await saveItem("token", accessToken);
        setToken(accessToken);
        setUser(data.user); // Assuming register returns user object
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed",
      };
    }
  };

  const logout = async () => {
    await deleteItem("token");
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
