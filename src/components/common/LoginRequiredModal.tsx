'use client';

import React from 'react';
import Link from 'next/link';
import { X, LogIn, UserPlus, ShoppingCart, Heart, Lock } from 'lucide-react';

interface LoginRequiredModalProps {
  open: boolean;
  onClose: () => void;
  reason?: 'cart' | 'wishlist' | 'checkout';
}

export function LoginRequiredModal({ open, onClose, reason = 'cart' }: LoginRequiredModalProps) {
  if (!open) return null;

  const messages = {
    cart:     { icon: <ShoppingCart className="w-7 h-7 text-[#527863]" />, text: 'add items to your cart' },
    wishlist: { icon: <Heart className="w-7 h-7 text-red-400" />,          text: 'save items to your wishlist' },
    checkout: { icon: <Lock className="w-7 h-7 text-[#527863]" />,         text: 'proceed to checkout' },
  };
  const { icon, text } = messages[reason];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-7 w-full max-w-sm shadow-2xl border border-gray-100 relative">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-[#DFE8DD] flex items-center justify-center mx-auto mb-4">
            {icon}
          </div>

          {/* Text */}
          <h2 className="text-lg font-black text-[#1B2721] text-center">
            Login Required
          </h2>
          <p className="text-xs text-gray-500 text-center mt-2 leading-relaxed">
            Please sign in to your ALMARTO account to {text}.
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-6">
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center justify-center space-x-2 w-full py-3 bg-[#2E4A3E] hover:bg-[#22382F] text-white rounded-xl font-bold text-sm transition-colors shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
            <Link
              href="/register"
              onClick={onClose}
              className="flex items-center justify-center space-x-2 w-full py-3 border-2 border-[#2E4A3E] text-[#2E4A3E] hover:bg-[#DFE8DD] rounded-xl font-bold text-sm transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </Link>
          </div>

          <p className="text-[11px] text-gray-400 text-center mt-4">
            New customers get 100 bonus SuperCoins on signup!
          </p>
        </div>
      </div>
    </>
  );
}
