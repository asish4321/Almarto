'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Warehouse,
  Tag,
  Truck,
  FileText,
  Image as ImageIconLucide,
  BarChart3,
  UserCheck,
  Settings,
  ExternalLink,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Palette,
} from 'lucide-react';

const ADMIN_NAV = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: Layers },
  { name: 'Orders & Shipments', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Inventory & Warehouses', href: '/admin/inventory', icon: Warehouse },
  { name: 'Coupons & Offers', href: '/admin/coupons', icon: Tag },
  { name: 'Shipping & Logistics', href: '/admin/shipping', icon: Truck },
  { name: 'Hero Banners & Photos', href: '/admin/content', icon: ImageIconLucide },
  { name: 'Theme & Store Colors', href: '/admin/theme', icon: Palette },
  { name: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
  { name: 'Staff & Roles (RBAC)', href: '/admin/staff', icon: UserCheck },
  { name: 'Logo & Store Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [storeLogo, setStoreLogo] = useState('/logo.png');

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.settings?.store_logo) setStoreLogo(d.settings.store_logo);
      })
      .catch(() => {});
  }, []);

  const isAuthorized =
    user &&
    (user.email.toLowerCase() === 'aswak761@gmail.com' ||
      user.role === 'SUPER_ADMIN' ||
      user.role === 'ADMIN');

  useEffect(() => {
    if (!loading && !isAuthorized) {
      router.push('/almarto_admin');
    }
  }, [user, loading, isAuthorized, router]);

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0F0A1E] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FF7900]/20 border border-[#FF7900]/40 flex items-center justify-center animate-pulse">
          <ShieldCheck className="w-6 h-6 text-[#FF7900]" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-base font-bold">Verifying Administrator Access</h2>
          <p className="text-xs text-purple-300/70">Connecting to Almarto Admin Console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7FB] flex flex-col md:flex-row text-[#19152B] admin-panel-root">
      {/* 1. Admin Left Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-[#1A0553] text-white flex flex-col justify-between transition-transform duration-300 shadow-2xl md:shadow-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Portal Branding */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="relative h-9 w-36 bg-white rounded-lg p-1 flex items-center justify-center">
                <Image src={storeLogo} alt="ALMARTO" fill priority sizes="144px" className="object-contain" unoptimized />
              </div>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-5 py-2.5 bg-[#270A77] flex items-center justify-between text-[11px] text-gray-300">
            <span className="font-bold text-[#FF7900] uppercase tracking-wider flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Center</span>
            </span>
            <span className="bg-white/20 text-white font-mono px-1.5 py-0.5 rounded text-[10px]">
              v2.4 Pro
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all ${
                    isActive
                      ? 'bg-[#FF7900] text-white shadow-md font-bold'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom user profile & Storefront link */}
          <div className="p-4 border-t border-white/10 bg-[#140344] space-y-2">
            <Link
              href="/"
              target="_blank"
              className="w-full flex items-center justify-center space-x-1.5 text-xs text-purple-200 hover:text-white bg-white/10 hover:bg-white/20 py-2 rounded-xl transition-colors font-semibold"
            >
              <span>View Customer Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2 truncate">
                <div className="w-7 h-7 rounded-full bg-[#FF7900] text-white font-bold flex items-center justify-center text-xs">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="truncate text-left text-[11px] leading-tight">
                  <span className="font-bold text-white block truncate">{user?.name || 'Admin User'}</span>
                  <span className="text-[#FF7900] block text-[10px] font-semibold">{user?.role || 'SUPER_ADMIN'}</span>
                </div>
              </div>

              <button
                onClick={() => logout()}
                className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:inline">
              Almarto Operations &amp; Merchant Control
            </span>
          </div>

          {/* Active Administrator Identity & Sign Out */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="hidden sm:flex flex-col items-end">
              <span className="font-bold text-gray-800">{user?.name || 'Aswak'}</span>
              <span className="text-[11px] text-gray-500 font-mono">{user?.email || 'aswak761@gmail.com'}</span>
            </div>
            <span className="px-2.5 py-1 bg-purple-100 text-[#35109B] text-[10px] font-black uppercase rounded-lg border border-purple-200">
              {user?.role || 'SUPER_ADMIN'}
            </span>
            <button
              onClick={async () => {
                await logout();
                router.push('/almarto_admin');
              }}
              className="p-2 border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl transition-colors flex items-center space-x-1"
              title="Sign Out of Admin Console"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline font-bold text-xs">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
