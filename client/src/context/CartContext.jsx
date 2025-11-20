import { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity, startDate, endDate, priceTier) => {
    setCart((prevCart) => {
      // Check if item with same product and dates exists
      const existingItemIndex = prevCart.findIndex(
        (item) =>
          item.product._id === product._id &&
          item.startDate === startDate &&
          item.endDate === endDate
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      } else {
        return [
          ...prevCart,
          { product, quantity, startDate, endDate, priceTier },
        ];
      }
    });
  };

  const removeFromCart = (index) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculate rental price based on duration and pricing tiers
  const calculateRentalPrice = (startDate, endDate, pricing) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Minimum 1 day

    // Apply pricing tiers based on duration
    if (days >= 30) {
      // Monthly rate applies
      const months = Math.ceil(days / 30);
      return pricing.month * months;
    } else if (days >= 7) {
      // Weekly rate applies
      const weeks = Math.ceil(days / 7);
      return pricing.week * weeks;
    } else {
      // Daily rate applies
      return pricing.day * days;
    }
  };

  const cartTotal = cart.reduce((total, item) => {
    const itemPrice = calculateRentalPrice(
      item.startDate,
      item.endDate,
      item.product.pricing
    );
    return total + itemPrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
};
