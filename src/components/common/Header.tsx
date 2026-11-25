'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { usePincode } from '@/context/PincodeContext';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  MapPin,
  ChevronDown,
  Flame,
  Package,
  LogOut,
  Layers,
  ShieldCheck,
  X,
} from 'lucide-react';
import { MarqueeBanner } from './MarqueeBanner';

interface SuggestionProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  mrp: number;
  category?: { name: string };
  images?: { url: string }[];
}

interface HeaderCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  image?: string | null;
}

interface HeaderProps {
  initialSettings?: Record<string, string>;
  categories?: HeaderCategory[];
}

export function Header({ initialSettings, categories = [] }: HeaderProps = {}) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { totalItemCount, subtotal } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { pincode, pincodeInfo, setIsPincodeModalOpen } = usePincode();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // Debounced live search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setIsSearchOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(searchQuery.trim())}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.products || []);
          setIsSearchOpen(true);
        }
      } catch (err) {
        console.error('Search suggest error', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setIsMobileSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      setIsMobileSearchOpen(false);
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const SearchSuggestions = () => (
    <div className="absolute left-0 right-0 mt-1.5 bg-[#FAF6F0] text-[#1B2721] rounded-2xl shadow-2xl border border-[#DED6C7] overflow-hidden z-50">
      {isSearching ? (
        <div className="p-4 text-center text-xs text-gray-500 font-medium">Searching catalog...</div>
      ) : suggestions.length > 0 ? (
        <div>
          <div className="px-4 py-2 bg-[#DFE8DD] text-[11px] font-bold uppercase tracking-wider text-[#2E4A3E] border-b flex items-center justify-between">
            <span>Suggestions</span>
            <span className="text-[10px] text-gray-500 font-normal">{suggestions.length} found</span>
          </div>
          {suggestions.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              onClick={() => { setIsSearchOpen(false); setIsMobileSearchOpen(false); }}
              className="flex items-center space-x-3 px-4 py-2.5 hover:bg-[#EFE9DF] transition-colors border-b border-gray-100 last:border-0"
            >
              <div className="relative w-10 h-10 bg-gray-100 rounded-lg shrink-0 overflow-hidden border border-gray-200">
                {p.images?.[0]?.url && (
                  <Image src={p.images[0].url} alt={p.title} fill sizes="40px" className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#19152B] truncate">{p.title}</p>
                <span className="text-[11px] text-[#527863] font-semibold">{p.category?.name || 'Pop DIY'}</span>
              </div>
              <span className="text-xs font-extrabold text-[#2E4A3E] shrink-0">₹{p.price.toLocaleString('en-IN')}</span>
            </Link>
          ))}
          <button
            onClick={handleSearchSubmit}
            className="w-full py-2.5 bg-gray-50 hover:bg-[#EFE9DF] text-center text-xs font-bold text-[#2E4A3E] transition-colors block border-t"
          >
            See all results for &ldquo;{searchQuery}&rdquo; →
          </button>
        </div>
      ) : (
        <div className="p-4 text-center text-xs text-gray-500">
          No results for &ldquo;{searchQuery}&rdquo;
        </div>
      )}
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full shadow-lg">
        <MarqueeBanner initialSettings={initialSettings} />

        {/* ── Main header bar ── */}
        <div
          className="text-white border-b border-white/10 shadow-md"
          style={{ background: 'var(--theme-header-bg, linear-gradient(135deg, #1E332B 0%, #2E4A3E 50%, #3B5A4D 100%))' }}
        >
          {/* ════ DESKTOP layout (md+) ════ */}
          <div className="hidden md:block">
            <div className="container mx-auto flex items-center justify-between gap-4 py-3 px-4">
              {/* Logo */}
              <Link href="/" className="shrink-0 group">
                <div className="relative h-11 w-40 lg:h-12 lg:w-48 bg-[#FAF6F0] border border-[#DED6C7] rounded-xl p-1.5 flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-[1.02]">
                  <Image src="/logo.png" alt="ALMARTO POP DIY" fill priority sizes="(max-width: 1024px) 160px, 192px" className="object-contain" />
                </div>
              </Link>

              {/* Pincode */}
              <button
                onClick={() => setIsPincodeModalOpen(true)}
                className="hidden lg:flex items-center space-x-2 hover:bg-white/15 px-3 py-1.5 rounded-xl transition-all border border-white/15 shrink-0"
              >
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="text-xs leading-tight">
                  <span className="text-white/80 block text-[10px] uppercase font-semibold tracking-wider">Deliver to</span>
                  <span className="font-bold text-white truncate max-w-[120px] block">{pincodeInfo.city || 'India'} {pincode}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-white/70" />
              </button>

              {/* Search */}
              <div ref={searchRef} className="relative flex-1 max-w-2xl">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setIsSearchOpen(true)}
                    placeholder="Search DIY vinyls, blind boxes, dioramas..."
                    className="w-full py-2.5 pl-4 pr-12 rounded-xl bg-[#FAF6F0] border border-[#DED6C7] text-[#1B2721] placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#527863] shadow-sm font-medium"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 px-4 text-white rounded-lg flex items-center justify-center shadow-sm hover:opacity-90"
                    style={{ backgroundColor: 'var(--accent-color, #527863)' }}
                    aria-label="Search"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </form>
                {isSearchOpen && <SearchSuggestions />}
              </div>

              {/* Right: Account + Wishlist + Cart */}
              <div className="flex items-center space-x-2 lg:space-x-3">
                {/* Account */}
                <div ref={accountRef} className="relative">
                  {user ? (
                    <button
                      onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                      className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/20"
                    >
                      <div className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm" style={{ backgroundColor: 'var(--accent-color, #527863)' }}>
                        {user.name.charAt(0)}
                      </div>
                      <div className="hidden lg:block text-left text-xs leading-tight">
                        <span className="text-[#D2DDD0] text-[10px] block font-medium">Hello,</span>
                        <span className="font-bold text-white max-w-[90px] truncate block">{user.name.split(' ')[0]}</span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-[#D2DDD0] hidden lg:block" />
                    </button>
                  ) : (
                    <Link href="/login" className="flex items-center space-x-1.5 bg-[#FAF6F0] text-[#2E4A3E] hover:bg-[#EFE9DF] border border-[#DED6C7] px-3.5 py-2 rounded-xl font-bold text-xs transition-colors shadow-sm">
                      <User className="w-4 h-4" />
                      <span>Login</span>
                    </Link>
                  )}

                  {isAccountMenuOpen && user && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#FAF6F0] text-[#1B2721] rounded-2xl shadow-2xl border border-[#DED6C7] py-2 z-50">
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="font-bold text-sm text-[#19152B] truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link href="/account" onClick={() => setIsAccountMenuOpen(false)} className="flex items-center space-x-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 font-medium">
                        <User className="w-4 h-4 text-gray-400" /><span>My Profile</span>
                      </Link>
                      <Link href="/account/orders" onClick={() => setIsAccountMenuOpen(false)} className="flex items-center space-x-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 font-medium">
                        <Package className="w-4 h-4 text-gray-400" /><span>My Orders</span>
                      </Link>
                      <Link href="/wishlist" onClick={() => setIsAccountMenuOpen(false)} className="flex items-center space-x-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 font-medium">
                        <Heart className="w-4 h-4 text-gray-400" /><span>Wishlist ({wishlistCount})</span>
                      </Link>
                      {(user.email?.toLowerCase() === 'aswak761@gmail.com' || user.role === 'SUPER_ADMIN') && (
                        <Link href="/admin" onClick={() => setIsAccountMenuOpen(false)} className="flex items-center space-x-2 px-4 py-2 text-xs text-[#2E4A3E] bg-[#DFE8DD] hover:bg-[#C8D9C5] font-bold">
                          <ShieldCheck className="w-4 h-4" /><span>Admin Dashboard →</span>
                        </Link>
                      )}
                      <div className="border-t border-gray-100 my-1" />
                      <button onClick={() => { setIsAccountMenuOpen(false); logout(); }} className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left font-medium">
                        <LogOut className="w-4 h-4" /><span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Wishlist — desktop only */}
                <Link href="/wishlist" className="relative p-2.5 rounded-xl hover:bg-white/10 transition-colors" title="Wishlist">
                  <Heart className="w-5 h-5 text-white" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-color, #527863)' }}>
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <Link href="/cart" className="relative flex items-center space-x-2 text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-md hover:opacity-95 transition-all" style={{ backgroundColor: 'var(--accent-color, #527863)' }}>
                  <div className="relative">
                    <ShoppingCart className="w-4 h-4" />
                    {totalItemCount > 0 && (
                      <span className="absolute -top-2.5 -right-2.5 bg-[#FAF6F0] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow" style={{ color: 'var(--primary-color, #2E4A3E)' }}>
                        {totalItemCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:inline">Cart</span>
                  {subtotal > 0 && <span className="hidden lg:inline text-white/95 font-extrabold">₹{subtotal.toLocaleString('en-IN')}</span>}
                </Link>
              </div>
            </div>
          </div>

          {/* ════ MOBILE layout (< md) ════ */}
          <div className="md:hidden">
            <div className="flex items-center gap-2 px-3 py-2.5">
              {/* Logo */}
              <Link href="/" className="shrink-0">
                <div className="relative h-9 w-28 bg-[#FAF6F0] border border-[#DED6C7] rounded-xl p-1 flex items-center justify-center shadow-sm">
                  <Image src="/logo.png" alt="ALMARTO" fill priority sizes="112px" className="object-contain" />
                </div>
              </Link>

              {/* Search bar — takes remaining space */}
              <div ref={mobileSearchRef} className="relative flex-1">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { setIsMobileSearchOpen(true); searchQuery.length >= 2 && setIsSearchOpen(true); }}
                    placeholder="Search products..."
                    className="w-full py-2 pl-3 pr-10 rounded-xl bg-[#FAF6F0] border border-[#DED6C7] text-[#1B2721] placeholder-gray-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#527863] font-medium"
                  />
                  <button type="submit" className="absolute right-1 top-1 bottom-1 px-2.5 text-white rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent-color, #527863)' }} aria-label="Search">
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </form>
                {isMobileSearchOpen && isSearchOpen && <SearchSuggestions />}
              </div>

              {/* Cart icon — mobile */}
              <Link href="/cart" className="relative p-2 rounded-xl hover:bg-white/10 transition-colors shrink-0">
                <ShoppingCart className="w-5 h-5 text-white" />
                {totalItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#527863] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItemCount > 9 ? '9+' : totalItemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* ── Categories strip — desktop only ── */}
        <nav className="hidden md:block bg-[#EFE9DF] border-b border-[#DED6C7] text-xs shadow-sm overflow-x-auto no-scrollbar">
          <div className="container mx-auto flex items-center space-x-2 py-2 px-4 whitespace-nowrap">
            <Link href="/products" className="flex items-center space-x-1.5 font-extrabold text-[#2E4A3E] hover:bg-[#DFE8DD] px-3 py-1.5 rounded-lg transition-colors border border-[#DED6C7] shrink-0">
              <Layers className="w-3.5 h-3.5 text-[#527863]" />
              <span>All Products</span>
            </Link>

            <Link href="/products?isDeal=true" className="flex items-center space-x-1.5 font-bold text-[#527863] hover:bg-[#DFE8DD] px-2.5 py-1.5 rounded-lg transition-colors border border-[#DED6C7] shrink-0">
              <Flame className="w-3.5 h-3.5 text-[#527863] animate-pulse" />
              <span>Deals &amp; Offers</span>
            </Link>

            {categories.length > 0 && <span className="text-gray-300">|</span>}

            {categories.map((cat) => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`} className="hover:text-[#2E4A3E] hover:bg-[#DFE8DD] text-[#1B2721] font-semibold px-2.5 py-1.5 rounded-lg transition-colors shrink-0">
                {cat.name}
              </Link>
            ))}

            <div className="ml-auto flex items-center space-x-3 shrink-0 pl-2">
              <Link href="/account/orders" className="text-[#5F6E66] hover:text-[#2E4A3E] font-medium hidden lg:flex items-center space-x-1 px-2 py-1">
                <Package className="w-3.5 h-3.5" />
                <span>Track Orders</span>
              </Link>
              <Link href="/products" className="font-bold text-[#FAF6F0] bg-[#2E4A3E] hover:bg-[#22382F] px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                Explore All →
              </Link>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
