'use client';

import { createContext, ReactNode, useContext, useSyncExternalStore } from 'react';
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
const cartStore = new EventTarget();

function getCartSnapshot() {
  return window.localStorage.getItem(CART_STORAGE_KEY) ?? '[]';
}

function getServerCartSnapshot() {
  return '[]';
}

function parseCartSnapshot(snapshot: string): CartItem[] {
  try {
    return JSON.parse(snapshot) as CartItem[];
  } catch {
    return [];
  }
}

function subscribeToCart(callback: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === CART_STORAGE_KEY) callback();
  }

  window.addEventListener('storage', handleStorage);
  cartStore.addEventListener('change', callback);

  return () => {
    window.removeEventListener('storage', handleStorage);
    cartStore.removeEventListener('change', callback);
  };
}

function setStoredItems(items: CartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  cartStore.dispatchEvent(new Event('change'));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const cartSnapshot = useSyncExternalStore(subscribeToCart, getCartSnapshot, getServerCartSnapshot);
  const items = parseCartSnapshot(cartSnapshot);

  function addItem(product: CartProduct, quantity = 1) {
    const safeQuantity = Math.max(1, Math.min(quantity, product.stock));
    const existingItem = items.find((item) => item.product.id === product.id);

    if (!existingItem) {
      setStoredItems([{ product, quantity: safeQuantity }, ...items]);
      return;
    }

    setStoredItems(
      items.map((item) => {
        if (item.product.id !== product.id) return item;

        return {
          ...item,
          quantity: Math.min(item.quantity + safeQuantity, product.stock),
        };
      }),
    );
  }

  function removeItem(productId: number) {
    setStoredItems(items.filter((item) => item.product.id !== productId));
  }

  function updateQuantity(productId: number, quantity: number) {
    setStoredItems(
      items.flatMap((item) => {
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
    setStoredItems([]);
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
