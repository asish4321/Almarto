'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItemType, CouponType, ProductItem, ProductVariantItem } from '@/lib/types';

interface CartContextType {
  items: CartItemType[];
  totalItemCount: number;
  subtotal: number;
  mrpTotal: number;
  discount: number;
  couponDiscount: number;
  deliveryCharge: number;
  tax: number;
  grandTotal: number;
  savings: number;
  appliedCoupon: CouponType | null;
  couponError: string | null;
  addToCart: (product: ProductItem, quantity?: number, variant?: ProductVariantItem | null) => void;
  updateQuantity: (productId: string, variantId: string | null | undefined, quantity: number) => void;
  removeFromCart: (productId: string, variantId?: string | null) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  loginRequired: boolean;
  setLoginRequired: (v: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);


export function CartProvider({ children }: { children: React.ReactNode }) {
  // Start empty on server; hydrate from localStorage after mount to avoid SSR mismatch
  const [items, setItems] = useState<CartItemType[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponType | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loginRequired, setLoginRequired] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('almarto_cart');
      if (saved) setItems(JSON.parse(saved));
      const savedCoupon = localStorage.getItem('almarto_coupon');
      if (savedCoupon) setAppliedCoupon(JSON.parse(savedCoupon));
    } catch { /* ignore */ }
  }, []);

  // Persist cart to localStorage whenever it changes

  useEffect(() => {
    try {
      localStorage.setItem('almarto_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem('almarto_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('almarto_coupon');
      }
    } catch (e) {
      console.error('Failed to save coupon to storage', e);
    }
  }, [appliedCoupon]);

  const addToCart = (product: ProductItem, quantity = 1, variant: ProductVariantItem | null = null) => {
    // Check if user is stored in localStorage (set by AuthContext after login)
    const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('almarto_user');
    if (!isLoggedIn) {
      setLoginRequired(true);
      return;
    }
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && (item.variantId || null) === (variant?.id || null)
      );

      const price = variant ? variant.price : product.price;
      const mrp = variant ? variant.mrp : product.mrp;
      const stock = variant ? variant.stock : product.stock;
      const image = product.images?.[0]?.url || '';

      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = Math.min(next[existingIndex].quantity + quantity, stock);
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: newQty,
        };
        return next;
      } else {
        const newItem: CartItemType = {
          id: `${product.id}_${variant?.id || 'default'}`,
          productId: product.id,
          title: product.title,
          slug: product.slug,
          image,
          price,
          mrp,
          quantity: Math.min(quantity, stock),
          variantId: variant?.id || null,
          variantTitle: variant?.title || null,
          stock,
        };
        return [...prev, newItem];
      }
    });
  };

  const updateQuantity = (productId: string, variantId: string | null | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId && (item.variantId || null) === (variantId || null)) {
          return {
            ...item,
            quantity: Math.min(quantity, item.stock),
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string, variantId?: string | null) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && (item.variantId || null) === (variantId || null))
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponError(null);
  };

  // Computations
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const mrpTotal = items.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const discount = Math.max(0, mrpTotal - subtotal);

  // Coupon discount calculation
  let couponDiscount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minOrderValue) {
    if (appliedCoupon.type === 'PERCENTAGE') {
      const calculated = (subtotal * appliedCoupon.value) / 100;
      couponDiscount = appliedCoupon.maxDiscount ? Math.min(calculated, appliedCoupon.maxDiscount) : calculated;
    } else {
      couponDiscount = appliedCoupon.value;
    }
  }

  // Delivery charge (Free above ₹499)
  const deliveryCharge = subtotal > 0 && subtotal < 499 ? 49 : 0;
  // Prices in India are inclusive of GST, so tax breakdown for display:
  const tax = Math.round(((subtotal - couponDiscount) * 0.18) / 1.18);
  const grandTotal = Math.max(0, subtotal - couponDiscount + deliveryCharge);
  const savings = mrpTotal > 0 ? (mrpTotal - subtotal) + couponDiscount : 0;

  const applyCoupon = async (code: string) => {
    setCouponError(null);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase().trim(), subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.coupon) {
        setAppliedCoupon(data.coupon);
        return { success: true, message: `Coupon "${code}" applied successfully! You saved ₹${data.discountApplied}` };
      } else {
        setCouponError(data.message || 'Invalid coupon code');
        return { success: false, message: data.message || 'Invalid coupon code' };
      }
    } catch {
      setCouponError('Error validating coupon. Please try again.');
      return { success: false, message: 'Failed to apply coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItemCount,
        subtotal,
        mrpTotal,
        discount,
        couponDiscount,
        deliveryCharge,
        tax,
        grandTotal,
        savings,
        appliedCoupon,
        couponError,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
        loginRequired,
        setLoginRequired,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
