'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Package,
  Heart,
  MapPin,
  ShieldCheck,
  Award,
  LogOut,
  ChevronRight,
  Sliders,
  Loader2,
} from 'lucide-react';

export default function AccountPage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#35109B] animate-spin" />
        <p className="text-xs text-gray-500 font-medium">Loading your account...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <h2 className="text-xl font-bold text-[#19152B] mb-2">Sign in to View Your Account</h2>
        <p className="text-xs text-gray-500 mb-6">Access your orders, saved addresses, and loyalty rewards.</p>
        <Link href="/login" className="bg-[#35109B] text-white px-6 py-2.5 rounded-lg text-xs font-bold">
          Sign In Now
        </Link>
      </div>
    );
  }

  const isStaff = ['SUPER_ADMIN', 'ADMIN', 'PRODUCT_MANAGER', 'ORDER_MANAGER', 'CUSTOMER_SUPPORT', 'FINANCE_MANAGER'].includes(user.role);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-[#35109B] text-white text-2xl font-black flex items-center justify-center shadow-md">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-[#19152B]">{user.name}</h1>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#F2EFFF] text-[#35109B] rounded-full">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-gray-500">{user.email} {user.phone ? `• ${user.phone}` : ''}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => logout()}
              className="border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center space-x-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Loyalty Points Banner */}
        <div className="bg-gradient-to-r from-[#FFF6ED] to-[#F2EFFF] p-4 rounded-2xl border border-orange-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#FF7900] text-white flex items-center justify-center shadow">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-800">Almarto SuperCoins &amp; Rewards</span>
              <p className="text-xs text-brand-muted">You have <strong>{user.loyaltyPoints || 350} SuperCoins</strong> available to redeem on future orders.</p>
            </div>
          </div>
        </div>

        {/* Account Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/account/orders"
            className="p-5 rounded-2xl border border-gray-200/80 hover:border-[#35109B] hover:shadow-card-hover transition-all bg-white group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#35109B] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#19152B] mb-1">My Orders</h3>
              <p className="text-xs text-gray-500">Track shipments, return or cancel items</p>
            </div>
            <span className="text-xs font-bold text-[#35109B] flex items-center space-x-1 mt-4">
              <span>View Orders</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          </Link>

          <Link
            href="/wishlist"
            className="p-5 rounded-2xl border border-gray-200/80 hover:border-[#35109B] hover:shadow-card-hover transition-all bg-white group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF7900] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#19152B] mb-1">My Wishlist</h3>
              <p className="text-xs text-gray-500">View and purchase your curated saved products</p>
            </div>
            <span className="text-xs font-bold text-[#35109B] flex items-center space-x-1 mt-4">
              <span>View Wishlist</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          </Link>

          <div className="p-5 rounded-2xl border border-gray-200/80 bg-white flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#19152B] mb-1">Saved Addresses</h3>
              <p className="text-xs text-gray-500">Bengaluru (560001) Primary Home Address</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1 mt-4">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Location</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
