'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductItem } from '@/lib/types';

interface WishlistContextType {
  items: ProductItem[];
  itemCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: ProductItem) => void;
  removeFromWishlist: (productId: string) => void;
  loginRequired: boolean;
  setLoginRequired: (v: boolean) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [loginRequired, setLoginRequired] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('almarto_wishlist');
      if (saved) setItems(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('almarto_wishlist', JSON.stringify(items));
    } catch { /* ignore */ }
  }, [items]);

  const isInWishlist = (productId: string) => items.some(i => i.id === productId);

  const toggleWishlist = (product: ProductItem) => {
    const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('almarto_user');
    if (!isLoggedIn) {
      setLoginRequired(true);
      return;
    }
    setItems(prev => {
      const exists = prev.some(i => i.id === product.id);
      return exists ? prev.filter(i => i.id !== product.id) : [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setItems(prev => prev.filter(i => i.id !== productId));
  };

  return (
    <WishlistContext.Provider value={{
      items, itemCount: items.length,
      isInWishlist, toggleWishlist, removeFromWishlist,
      loginRequired, setLoginRequired,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
}
