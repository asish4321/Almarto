'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { LoginRequiredModal } from './LoginRequiredModal';

export function AuthGate() {
  const { loginRequired: cartLogin, setLoginRequired: setCartLogin } = useCart();
  const { loginRequired: wishlistLogin, setLoginRequired: setWishlistLogin } = useWishlist();

  const reason = cartLogin ? 'cart' : wishlistLogin ? 'wishlist' : null;

  const handleClose = () => {
    setCartLogin(false);
    setWishlistLogin(false);
  };

  return (
    <LoginRequiredModal
      open={!!reason}
      onClose={handleClose}
      reason={reason || 'cart'}
    />
  );
}
