import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth, api } from "./AuthContext";

const CartContext = createContext();
const LOCAL_CART_KEY = "inventory:cart";
const DEVICE_ID_KEY = "inventory:device";

const calculateRentalPrice = (product, startDate, endDate) => {
  const pricing = product?.pricing || {};
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.max(end - start, 0);
  const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  if (days >= 30 && pricing.month) {
    const months = Math.ceil(days / 30);
    return pricing.month * months;
  }

  if (days >= 7 && pricing.week) {
    const weeks = Math.ceil(days / 7);
    return pricing.week * weeks;
  }

  return (pricing.day || 0) * days;
};

const buildKey = (item) =>
  `${item.product?._id || item.product}-${item.startDate}-${item.endDate}`;

const mergeLocalItems = (items) => {
  const merged = new Map();
  items.forEach((item) => {
    const key = buildKey(item);
    const existing = merged.get(key);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      merged.set(key, { ...item });
    }
  });
  return Array.from(merged.values());
};

const serializeForServer = (item) => ({
  product: item.product?._id || item.product,
  quantity: item.quantity,
  startDate: item.startDate,
  endDate: item.endDate,
});

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  const isAuthenticated = Boolean(user && token);
  const [cart, setCart] = useState([]);
  const [syncing, setSyncing] = useState(false);

  const loadLocalCart = useCallback(async () => {
    const stored = await AsyncStorage.getItem(LOCAL_CART_KEY);
    if (stored) {
      setCart(JSON.parse(stored));
    }
  }, []);

  const ensureDeviceId = useCallback(async () => {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}`;
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  }, []);

  const fetchServerCart = useCallback(async () => {
    if (!isAuthenticated) return;
    setSyncing(true);
    try {
      const deviceId = await ensureDeviceId();
      const localDraftRaw = await AsyncStorage.getItem(LOCAL_CART_KEY);
      const localDraft = localDraftRaw ? JSON.parse(localDraftRaw) : [];
      if (localDraft.length) {
        await api.post("/cart/merge", {
          deviceId,
          items: localDraft.map(serializeForServer),
        });
        await AsyncStorage.setItem(LOCAL_CART_KEY, JSON.stringify([]));
      }

      const { data } = await api.get("/cart");
      setCart(data.data?.items || []);
    } catch (error) {
      console.error("Failed to sync cart", error);
    } finally {
      setSyncing(false);
    }
  }, [ensureDeviceId, isAuthenticated]);

  useEffect(() => {
    loadLocalCart();
  }, [loadLocalCart]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchServerCart();
    } else {
      loadLocalCart();
    }
  }, [fetchServerCart, isAuthenticated, loadLocalCart]);

  const mergeWithServer = useCallback(
    async (items) => {
      if (!isAuthenticated) return false;
      setSyncing(true);
      try {
        const deviceId = await ensureDeviceId();
        const { data } = await api.post("/cart/merge", {
          deviceId,
          items: items.map(serializeForServer),
        });
        setCart(data.data?.items || []);
        await AsyncStorage.setItem(LOCAL_CART_KEY, JSON.stringify([]));
        return true;
      } catch (error) {
        console.error("Cart merge failed", error);
        return false;
      } finally {
        setSyncing(false);
      }
    },
    [ensureDeviceId, isAuthenticated]
  );

  const queueLocally = useCallback(
    async (items) => {
      const stored = await AsyncStorage.getItem(LOCAL_CART_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      const mergedDraft = mergeLocalItems([...parsed, ...items]);
      await AsyncStorage.setItem(LOCAL_CART_KEY, JSON.stringify(mergedDraft));

      if (isAuthenticated) {
        setCart((prev) => mergeLocalItems([...prev, ...items]));
      } else {
        setCart(mergedDraft);
      }
    },
    [isAuthenticated]
  );

  const addToCart = async (product, startDate, endDate, quantity = 1) => {
    const newItem = { product, startDate, endDate, quantity };
    if (isAuthenticated) {
      const success = await mergeWithServer([newItem]);
      if (!success) {
        await queueLocally([newItem]);
      }
    } else {
      await queueLocally([newItem]);
    }
  };

  const removeFromCart = async (line) => {
    if (isAuthenticated && line?._id) {
      try {
        setSyncing(true);
        const { data } = await api.delete(`/cart/items/${line._id}`);
        setCart(data.data?.items || []);
        return;
      } catch (error) {
        console.error("Failed to remove item", error);
      } finally {
        setSyncing(false);
      }
    }

    const filtered = cart.filter((item) => buildKey(item) !== buildKey(line));
    await AsyncStorage.setItem(LOCAL_CART_KEY, JSON.stringify(filtered));
    setCart(filtered);
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        setSyncing(true);
        await api.delete("/cart/clear");
        setCart([]);
        await AsyncStorage.setItem(LOCAL_CART_KEY, JSON.stringify([]));
        return;
      } catch (error) {
        console.error("Failed to clear cart", error);
      } finally {
        setSyncing(false);
      }
    }
    await AsyncStorage.setItem(LOCAL_CART_KEY, JSON.stringify([]));
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => {
    if (!item.product) return total;
    const rentalPrice = calculateRentalPrice(
      item.product,
      item.startDate,
      item.endDate
    );
    return total + rentalPrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        cartTotal,
        calculateRentalPrice,
        syncing,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
