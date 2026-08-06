'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { CartItem, CartProduct } from './cart-types';

type CartContextValue = {
  items: CartItem[];
  itemsCount: number;
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
};

const CART_STORAGE_KEY = 'horafit-cart';
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);

    if (storedCart) {
      setItems(JSON.parse(storedCart));
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady) {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [isReady, items]);

  function addItem(product: CartProduct, quantity = 1) {
    const safeQuantity = Math.max(1, Math.min(quantity, product.stock));

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.product.id === product.id);

      if (!existingItem) {
        return [{ product, quantity: safeQuantity }, ...currentItems];
      }

      return currentItems.map((item) => {
        if (item.product.id !== product.id) return item;

        return {
          ...item,
          quantity: Math.min(item.quantity + safeQuantity, product.stock),
        };
      });
    });
  }

  function removeItem(productId: number) {
    setItems((currentItems) => currentItems.filter((item) => item.product.id !== productId));
  }

  function updateQuantity(productId: number, quantity: number) {
    setItems((currentItems) =>
      currentItems.flatMap((item) => {
        if (item.product.id !== productId) return item;

        if (quantity <= 0) return [];

        return {
          ...item,
          quantity: Math.min(quantity, item.product.stock),
        };
      }),
    );
  }

  function clearCart() {
    setItems([]);
  }

  const itemsCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, itemsCount, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart deve ser usado dentro de CartProvider.');
  }

  return context;
}
