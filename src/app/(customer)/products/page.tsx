'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductItem } from '@/lib/types';
import { ProductCard } from '@/components/product/ProductCard';
import { ToyLoader } from '@/components/common/ToyLoader';
import {
  Filter,
  Grid,
  List,
  ChevronRight,
  X,
  Star,
  Check,
  Search,
  Sparkles,
  Palette,
  Flame,
  Layers,
} from 'lucide-react';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

function ProductsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const brandParam = searchParams.get('brand') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const ratingParam = searchParams.get('rating') || '';
  const isDealParam = searchParams.get('isDeal') === 'true';
  const isTrendingParam = searchParams.get('isTrending') === 'true';
  const isBestSellerParam = searchParams.get('isBestSeller') === 'true';
  const inStockParam = searchParams.get('inStock') === 'true';
  const sortParam = searchParams.get('sort') || 'relevance';

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Price inputs state
  const [minPriceInput, setMinPriceInput] = useState(minPriceParam);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPriceParam);

  // Fetch categories for sidebar
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch products whenever params change
  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams(searchParams.toString());
    fetch(`/api/products?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const updateFilter = (key: string, value: string | null) => {
    const current = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') {
      current.delete(key);
    } else {
      current.set(key, value);
    }
    router.push(`/products?${current.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/products');
  };

  const handlePriceApply = () => {
    const current = new URLSearchParams(searchParams.toString());
    if (minPriceInput) current.set('minPrice', minPriceInput);
    else current.delete('minPrice');
    if (maxPriceInput) current.set('maxPrice', maxPriceInput);
    else current.delete('maxPrice');
    router.push(`/products?${current.toString()}`);
  };

  const activeFiltersCount = [
    categoryParam,
    brandParam,
    minPriceParam,
    maxPriceParam,
    ratingParam,
    isDealParam ? 'deal' : null,
    isTrendingParam ? 'trending' : null,
    isBestSellerParam ? 'best' : null,
    inStockParam ? 'stock' : null,
  ].filter(Boolean).length;

  const currentCategoryName = categories.find((c) => c.slug === categoryParam)?.name;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Category Hero / Breadcrumb Bar */}
      <div className="bg-gradient-to-r from-[#1A0553] via-[#35109B] to-[#270A77] text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-xs text-purple-200 mb-2">
            <button onClick={() => router.push('/')} className="hover:text-white transition-colors">Home</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-white">
              {currentCategoryName || (q ? `Search: "${q}"` : 'All Pop DIY Toys')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {currentCategoryName || (q ? `Results for "${q}"` : 'The Pop DIY Toy Universe')}
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-xl">
            {currentCategoryName
              ? `Explore our collection of ${currentCategoryName.toLowerCase()} crafted with 100% non-toxic safe materials.`
              : 'Discover blank vinyl figures, mystery blind boxes, motion-sensing book nooks & modular brick mech kits.'}
          </p>
        </div>

        {/* Decorative circle glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#FF7900]/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      <div className="flex gap-6 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-64 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm shrink-0 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <span className="font-extrabold text-sm text-[#19152B] flex items-center space-x-1.5">
              <Filter className="w-4 h-4 text-[#35109B]" />
              <span>DIY Toy Filters</span>
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-[#FF7900] hover:underline"
              >
                Clear ({activeFiltersCount})
              </button>
            )}
          </div>

          {/* Pop DIY Categories */}
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-500 mb-2.5 flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-[#35109B]" />
              <span>Pop Universes</span>
            </h4>
            <div className="space-y-1">
              <button
                onClick={() => updateFilter('category', null)}
                className={`w-full text-left text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-between ${
                  !categoryParam
                    ? 'bg-[#35109B] text-white font-extrabold shadow-sm'
                    : 'text-gray-700 hover:bg-[#F2EFFF] hover:text-[#35109B] font-medium'
                }`}
              >
                <span>All Pop DIY Toys</span>
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateFilter('category', c.slug)}
                  className={`w-full text-left text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-between ${
                    categoryParam === c.slug
                      ? 'bg-[#35109B] text-white font-extrabold shadow-sm'
                      : 'text-gray-700 hover:bg-[#F2EFFF] hover:text-[#35109B] font-medium'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-500 mb-2.5">
              Price Range (₹)
            </h4>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="w-1/2 p-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#35109B]"
              />
              <span className="text-gray-400 font-bold">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="w-1/2 p-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#35109B]"
              />
            </div>
            <button
              onClick={handlePriceApply}
              className="mt-2.5 w-full py-2 bg-[#35109B] hover:bg-[#270A77] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              Apply Price
            </button>
          </div>

          {/* Customer Rating */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-500 mb-2.5">
              Creator Rating
            </h4>
            <div className="space-y-1.5">
              {[4, 3].map((stars) => (
                <button
                  key={stars}
                  onClick={() => updateFilter('rating', ratingParam === String(stars) ? null : String(stars))}
                  className={`w-full text-left text-xs py-1.5 px-2.5 rounded-xl flex items-center justify-between transition-colors ${
                    ratingParam === String(stars)
                      ? 'bg-[#F2EFFF] text-[#35109B] font-bold'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold">{stars}★ &amp; above</span>
                    <div className="flex text-amber-500">
                      {'★'.repeat(stars)}
                    </div>
                  </div>
                  {ratingParam === String(stars) && <Check className="w-3.5 h-3.5 text-[#35109B]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Badges */}
          <div className="pt-4 border-t border-gray-100 space-y-2.5">
            <label className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={inStockParam}
                onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : null)}
                className="rounded border-gray-300 text-[#35109B] focus:ring-[#35109B]"
              />
              <span>In Stock Only</span>
            </label>

            <label className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={isDealParam}
                onChange={(e) => updateFilter('isDeal', e.target.checked ? 'true' : null)}
                className="rounded border-gray-300 text-[#FF7900] focus:ring-[#FF7900]"
              />
              <span className="flex items-center space-x-1 text-[#FF7900] font-bold">
                <Flame className="w-3.5 h-3.5 animate-pulse" />
                <span>Featured Flash Drops</span>
              </span>
            </label>
          </div>
        </aside>

        {/* Main Content: Header Bar & Product Grid/List */}
        <div className="flex-1 w-full min-w-0">
          {/* Top Control Bar */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs text-gray-700">
              <span className="font-black text-sm text-[#19152B]">
                {products.length} Pop DIY Kits Found
              </span>
              {q && <span className="text-gray-500 font-medium">for &ldquo;{q}&rdquo;</span>}
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center space-x-1.5 px-3 py-2 border rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                <Filter className="w-3.5 h-3.5 text-[#35109B]" />
                <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
              </button>

              {/* Sort By Dropdown */}
              <div className="flex items-center space-x-1.5 text-xs">
                <span className="text-gray-500 font-medium hidden sm:inline">Sort:</span>
                <select
                  value={sortParam}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#35109B]"
                >
                  <option value="relevance">Top Creator Picks</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Highest Rated</option>
                  <option value="newest">Latest DIY Drops</option>
                </select>
              </div>

              {/* Grid / List View Toggle */}
              <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-white text-[#35109B] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                  aria-label="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-white text-[#35109B] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                  aria-label="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Tags */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-bold text-gray-500">Active Filters:</span>
              {categoryParam && (
                <span className="inline-flex items-center space-x-1 bg-[#F2EFFF] text-[#35109B] text-xs font-bold px-3 py-1 rounded-full border border-purple-100">
                  <span>Category: {currentCategoryName || categoryParam}</span>
                  <X className="w-3.5 h-3.5 cursor-pointer ml-1" onClick={() => updateFilter('category', null)} />
                </span>
              )}
              {ratingParam && (
                <span className="inline-flex items-center space-x-1 bg-[#F2EFFF] text-[#35109B] text-xs font-bold px-3 py-1 rounded-full border border-purple-100">
                  <span>Rating: {ratingParam}★ &amp; above</span>
                  <X className="w-3.5 h-3.5 cursor-pointer ml-1" onClick={() => updateFilter('rating', null)} />
                </span>
              )}
              {isDealParam && (
                <span className="inline-flex items-center space-x-1 bg-orange-100 text-[#FF7900] text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
                  <span>Flash Drops Only</span>
                  <X className="w-3.5 h-3.5 cursor-pointer ml-1" onClick={() => updateFilter('isDeal', null)} />
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs text-red-600 hover:underline font-bold ml-2"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Product Items Display */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <ToyLoader size="md" text="Finding your toys..." />
            </div>
          ) : products.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4'
                  : 'space-y-4'
              }
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-md mx-auto my-12 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#FF7900] flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-black text-lg text-[#19152B]">No Matching Pop DIY Toys</h3>
              <p className="text-xs text-gray-500 mt-1 mb-6 leading-relaxed">
                Try loosening your filters, removing price limits, or browsing all Pop DIY collections.
              </p>
              <div className="flex items-center justify-center">
                <button
                  onClick={clearAllFilters}
                  className="bg-[#35109B] text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-[#270A77] transition-colors shadow-md"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/50 backdrop-blur-sm">
          <div className="ml-auto w-4/5 max-w-sm bg-white h-full p-5 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="font-extrabold text-base text-[#19152B]">Filter Pop Toys</span>
                <button onClick={() => setIsMobileFilterOpen(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-600 mb-2">Pop Universes</h4>
                <div className="space-y-1 max-h-56 overflow-y-auto">
                  <button
                    onClick={() => {
                      updateFilter('category', null);
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full text-left text-xs py-2 px-3 rounded-xl font-bold ${
                      !categoryParam ? 'bg-[#35109B] text-white' : 'text-gray-700'
                    }`}
                  >
                    All Pop DIY Toys
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        updateFilter('category', c.slug);
                        setIsMobileFilterOpen(false);
                      }}
                      className={`w-full text-left text-xs py-2 px-3 rounded-xl font-medium ${
                        categoryParam === c.slug ? 'bg-[#35109B] text-white font-bold' : 'text-gray-700'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full bg-[#FF7900] text-white font-bold text-xs py-3 rounded-xl shadow-md"
              >
                Show Pop Toys
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-12 text-center text-sm font-bold text-[#35109B]">Loading Pop DIY catalog...</div>}>
      <ProductsListContent />
    </Suspense>
  );
}
