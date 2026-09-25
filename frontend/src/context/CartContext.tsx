import { createContext, useContext, useMemo, useState } from 'react';
import type { CartItem, Product } from '../types';

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (product: Product) => void;
  updateQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  setPrescriptionForItem: (productId: string, url: string, fileName: string) => void;
  allPrescriptionsAttached: boolean;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product) => {
    setItems((prev) => {
      const found = prev.find((item) => item.id === product.id);
      if (found) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: qty } : item))
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const setPrescriptionForItem = (productId: string, url: string, fileName: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, prescriptionUrl: url, prescriptionFileName: fileName }
          : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const allPrescriptionsAttached = items.length > 0 && items.every((item) => !!item.prescriptionUrl);

  const value = useMemo(
    () => ({
      items,
      totalItems,
      subtotal,
      addItem,
      updateQty,
      removeItem,
      setPrescriptionForItem,
      allPrescriptionsAttached,
      clearCart,
    }),
    [items, totalItems, subtotal, allPrescriptionsAttached]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return context;
}
