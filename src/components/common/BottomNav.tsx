'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  ShoppingCart,
  Heart,
  User,
  X,
  Package,
  Layers,
  Flame,
  MapPin,
  Phone,
  Info,
  RotateCcw,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { usePincode } from '@/context/PincodeContext';

export function BottomNav() {
  const pathname = usePathname();
  const { totalItemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { user, logout } = useAuth();
  const { pincodeInfo, setIsPincodeModalOpen } = usePincode();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const navItem = (
    href: string,
    icon: React.ReactNode,
    label: string,
    badge?: number
  ) => (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center flex-1 py-2 gap-0.5 relative transition-colors ${
        isActive(href)
          ? 'text-[#2E4A3E]'
          : 'text-gray-500 hover:text-[#2E4A3E]'
      }`}
    >
      <div className="relative">
        {icon}
        {badge && badge > 0 ? (
          <span className="absolute -top-1.5 -right-1.5 bg-[#527863] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
            {badge > 9 ? '9+' : badge}
          </span>
        ) : null}
      </div>
      <span className="text-[10px] font-semibold leading-none">{label}</span>
      {isActive(href) && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#2E4A3E]" />
      )}
    </Link>
  );

  return (
    <>
      {/* Bottom Nav Bar — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FAF6F0] border-t border-[#DED6C7] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-area-pb">
        <div className="flex items-stretch h-16">
          {navItem('/', <Home className="w-5 h-5" />, 'Home')}
          {navItem('/products', <Layers className="w-5 h-5" />, 'Shop')}
          {navItem('/cart', <ShoppingCart className="w-5 h-5" />, 'Cart', totalItemCount)}
          {navItem('/wishlist', <Heart className="w-5 h-5" />, 'Wishlist', wishlistCount)}

          {/* More button */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className={`flex flex-col items-center justify-center flex-1 py-2 gap-0.5 transition-colors ${
              isMoreOpen ? 'text-[#2E4A3E]' : 'text-gray-500'
            }`}
          >
            <div className="w-5 h-5 flex flex-col items-center justify-center gap-[3px]">
              <span className="w-4 h-0.5 rounded-full bg-current" />
              <span className="w-4 h-0.5 rounded-full bg-current" />
              <span className="w-4 h-0.5 rounded-full bg-current" />
            </div>
            <span className="text-[10px] font-semibold leading-none">More</span>
          </button>
        </div>
      </nav>

      {/* More Drawer — slides up from bottom */}
      {isMoreOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMoreOpen(false)}
          />

          {/* Drawer */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FAF6F0] rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-b border-[#EDE8E0]">
              <span className="font-black text-sm text-[#1B2721]">More Options</span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="px-4 py-3 space-y-1">

              {/* Account section */}
              {user ? (
                <div className="mb-3 p-3 bg-[#DFE8DD]/60 rounded-2xl border border-[#DED6C7]">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-full text-white flex items-center justify-center font-black text-sm uppercase shadow-sm"
                      style={{ backgroundColor: '#527863' }}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#1B2721] truncate">{user.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMoreOpen(false)}
                  className="flex items-center justify-between w-full px-4 py-3 bg-[#2E4A3E] text-white rounded-2xl mb-3"
                >
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5" />
                    <span className="font-bold text-sm">Login / Sign Up</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </Link>
              )}

              {/* Delivery location */}
              <button
                onClick={() => { setIsPincodeModalOpen(true); setIsMoreOpen(false); }}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-[#EFE9DF] transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-[#DFE8DD] flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-[#2E4A3E]" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#1B2721]">Delivery Location</p>
                    <p className="text-[11px] text-gray-500">{pincodeInfo.city}, {pincodeInfo.pincode}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <div className="py-1 px-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Shop</p>
              </div>

              <Link href="/products?isDeal=true" onClick={() => setIsMoreOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-[#EFE9DF] transition-colors">
                <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <span className="text-sm font-semibold text-[#1B2721]">Deals &amp; Offers</span>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
              </Link>

              <div className="py-1 px-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">My Account</p>
              </div>

              {user && (
                <>
                  <Link href="/account" onClick={() => setIsMoreOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-[#EFE9DF] transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-[#DFE8DD] flex items-center justify-center">
                      <User className="w-4 h-4 text-[#2E4A3E]" />
                    </div>
                    <span className="text-sm font-semibold text-[#1B2721]">My Profile</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                  </Link>

                  <Link href="/account/orders" onClick={() => setIsMoreOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-[#EFE9DF] transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-[#DFE8DD] flex items-center justify-center">
                      <Package className="w-4 h-4 text-[#2E4A3E]" />
                    </div>
                    <span className="text-sm font-semibold text-[#1B2721]">My Orders</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                  </Link>

                  {(user.email?.toLowerCase() === 'aswak761@gmail.com' || user.role === 'SUPER_ADMIN') && (
                    <Link href="/admin" onClick={() => setIsMoreOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-[#F2EFFF] hover:bg-[#E8E4FF] transition-colors">
                      <div className="w-8 h-8 rounded-xl bg-[#2E4A3E] flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-bold text-[#2E4A3E]">Admin Dashboard</span>
                      <ChevronRight className="w-4 h-4 text-[#2E4A3E] ml-auto" />
                    </Link>
                  )}
                </>
              )}

              <div className="py-1 px-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Support</p>
              </div>

              <Link href="/contact" onClick={() => setIsMoreOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-[#EFE9DF] transition-colors">
                <div className="w-8 h-8 rounded-xl bg-[#DFE8DD] flex items-center justify-center">
                  <Phone className="w-4 h-4 text-[#2E4A3E]" />
                </div>
                <span className="text-sm font-semibold text-[#1B2721]">Contact Us</span>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
              </Link>

              <Link href="/returns-policy" onClick={() => setIsMoreOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-[#EFE9DF] transition-colors">
                <div className="w-8 h-8 rounded-xl bg-[#DFE8DD] flex items-center justify-center">
                  <RotateCcw className="w-4 h-4 text-[#2E4A3E]" />
                </div>
                <span className="text-sm font-semibold text-[#1B2721]">Returns Policy</span>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
              </Link>

              <Link href="/about" onClick={() => setIsMoreOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-[#EFE9DF] transition-colors">
                <div className="w-8 h-8 rounded-xl bg-[#DFE8DD] flex items-center justify-center">
                  <Info className="w-4 h-4 text-[#2E4A3E]" />
                </div>
                <span className="text-sm font-semibold text-[#1B2721]">About Almarto</span>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
              </Link>

              {user && (
                <button
                  onClick={() => { setIsMoreOpen(false); logout(); }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors w-full mt-1"
                >
                  <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-sm font-semibold text-red-600">Sign Out</span>
                </button>
              )}

              {/* safe area bottom padding */}
              <div className="h-6" />
            </div>
          </div>
        </>
      )}
    </>
  );
}
