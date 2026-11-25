'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { Heart, ShoppingCart, Trash2, ArrowRight, PackageOpen } from 'lucide-react';

export default function WishlistPage() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <div className="w-20 h-20 bg-orange-50 text-[#FF7900] rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-[#19152B] mb-2">Your Wishlist is Empty</h2>
        <p className="text-xs text-gray-500 mb-6">
          Explore our wide range of products and save your favorite items for later.
        </p>
        <Link
          href="/products"
          className="bg-[#35109B] hover:bg-[#270A77] text-white px-6 py-2.5 rounded-xl font-bold text-xs inline-block"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-black text-[#19152B] mb-6 flex items-center space-x-2">
        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
        <span>My Wishlist ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
        {items.map((product) => {
          const imgUrl = product.images?.[0]?.url || null;
          return (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-sm flex flex-col justify-between relative group hover:border-[#35109B]/40 hover:shadow-card-hover transition-all"
            >
              <div>
                <div className="relative w-full pt-[90%] bg-gray-50 rounded-lg overflow-hidden mb-3">
                  {imgUrl ? (
                    <Image src={imgUrl} alt={product.title} fill unoptimized className="object-contain p-2" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-purple-50 text-center p-2">
                      <PackageOpen className="w-8 h-8 text-[#35109B]/40 mb-1" />
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Almarto Pop DIY</span>
                    </div>
                  )}
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow text-gray-400 hover:text-red-500"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-[10px] font-bold text-[#777487] uppercase tracking-wider block">
                  {product.brand?.name || 'ALMARTO'}
                </span>
                <Link href={`/products/${product.slug}`}>
                  <h3 className="font-semibold text-xs text-[#19152B] hover:text-[#35109B] transition-colors line-clamp-2 mt-0.5">
                    {product.title}
                  </h3>
                </Link>

                <div className="flex items-baseline space-x-2 mt-2">
                  <span className="text-sm font-bold text-[#19152B]">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.mrp > product.price && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{product.mrp.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center space-x-2">
                <button
                  onClick={() => {
                    addToCart(product, 1);
                    removeFromWishlist(product.id);
                  }}
                  className="flex-1 py-2 bg-[#FF7900] hover:bg-[#ea580c] text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-1 shadow-sm"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Move to Cart</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
