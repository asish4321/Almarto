'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Heart, ShoppingCart, Check, Zap, PackageOpen, Plus, Minus, Eye, ArrowRight } from 'lucide-react';
import { ProductItem } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
  product: ProductItem;
  viewMode?: 'grid' | 'list';
}

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const isLiked = isInWishlist(product.id);
  const primaryImage = product.images?.[0]?.url || null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-[#FAF6F0] rounded-xl border border-[#DED6C7] p-4 hover:border-[#2E4A3E]/60 hover:shadow-lg transition-all duration-200 flex flex-col sm:flex-row gap-5 relative group">
        {/* Thumbnail */}
        <Link href={`/products/${product.slug}`} className="relative w-full sm:w-48 h-48 bg-[#EFE9DF]/50 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.title}
              fill
              sizes="192px"
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#E8EFE6] to-[#FAF7F2] text-center p-3">
              <PackageOpen className="w-10 h-10 text-[#2E4A3E]/40 mb-1" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Almarto Pop DIY</span>
            </div>
          )}
          {product.discountPercent > 0 && (
            <span className="absolute top-2 left-2 bg-[#527863] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">
              {product.discountPercent}% OFF
            </span>
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#5F6E66] uppercase tracking-wider">
                {product.brand?.name || 'ALMARTO DIRECT'}
              </span>
              <button
                onClick={handleWishlistToggle}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>

            <Link href={`/products/${product.slug}`}>
              <h3 className="font-semibold text-base text-[#1B2721] hover:text-[#2E4A3E] transition-colors mt-1 line-clamp-2">
                {product.title}
              </h3>
            </Link>

            {/* Rating */}
            <div className="flex items-center space-x-2 mt-2">
              <span className="bg-emerald-600 text-white text-xs font-bold px-1.5 py-0.5 rounded flex items-center space-x-1">
                <span>{product.rating.toFixed(1)}</span>
                <Star className="w-3 h-3 fill-white" />
              </span>
              <span className="text-xs text-gray-500">
                ({product.reviewCount.toLocaleString('en-IN')} ratings)
              </span>
              <span className="text-xs text-[#35109B] font-semibold flex items-center space-x-0.5">
                <Check className="w-3.5 h-3.5 text-blue-600" />
                <span>Assured</span>
              </span>
            </div>

            {product.shortDescription && (
              <p className="text-xs text-gray-600 mt-2 line-clamp-2">{product.shortDescription}</p>
            )}
          </div>

          {/* Pricing & CTA */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-bold text-[#19152B]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.mrp > product.price && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                )}
                {product.discountPercent > 0 && (
                  <span className="text-xs font-bold text-[#FF7900]">
                    Save ₹{(product.mrp - product.price).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-emerald-700 block font-medium">Free Delivery</span>
            </div>

            <div className="flex items-center space-x-2.5">
              {/* Quantity stepper */}
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50 h-9">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setQuantity((prev) => Math.max(1, prev - 1));
                  }}
                  className="w-8 h-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors font-bold"
                  title="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center font-bold text-xs text-[#19152B] select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setQuantity((prev) => Math.min(product.stock || 99, prev + 1));
                  }}
                  className="w-8 h-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors font-bold"
                  title="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className={`px-5 py-2.5 rounded-lg font-semibold text-xs transition-all flex items-center space-x-1.5 shadow-sm ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#2E4A3E] hover:bg-[#22382F] text-[#FAF7F2]'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added {quantity} to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add {quantity > 1 ? `(${quantity})` : ''} to Cart</span>
                  </>
                )}
              </button>

              <Link
                href={`/products/${product.slug}`}
                className="px-4 py-2.5 rounded-lg font-bold text-xs border border-[#DFE5DC] text-[#2E4A3E] hover:bg-[#2E4A3E] hover:text-[#FAF7F2] transition-all flex items-center space-x-1 shadow-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Details</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Grid Card
  return (
    <div className="bg-[#FAF6F0] rounded-xl border border-[#DED6C7] hover:border-[#2E4A3E]/60 hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between overflow-hidden relative group">

      {/* Image area — shorter on mobile */}
      <div className="relative w-full pt-[75%] sm:pt-[95%] bg-[#F5EFE6] overflow-hidden">
        <Link href={`/products/${product.slug}`} className="absolute inset-0 flex items-center justify-center">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-2 sm:p-4 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#E8EFE6] to-[#FAF7F2] text-center p-3">
              <PackageOpen className="w-7 h-7 sm:w-10 sm:h-10 text-[#2E4A3E]/40 mb-1" />
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Almarto</span>
            </div>
          )}
        </Link>

        {/* Discount badge */}
        {product.discountPercent > 0 && (
          <span className="absolute top-1.5 left-1.5 bg-[#527863] text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm">
            {product.discountPercent}% OFF
          </span>
        )}

        {product.isDealOfTheDay && (
          <span className="absolute bottom-1.5 left-1.5 bg-[#2E4A3E] text-[#FAF7F2] text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center space-x-0.5 shadow-sm">
            <Zap className="w-2.5 h-2.5 text-[#A3B18A] fill-[#A3B18A]" />
            <span>Deal</span>
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-1.5 right-1.5 p-1 sm:p-1.5 bg-white/90 backdrop-blur rounded-full shadow-sm text-gray-400 hover:text-red-500 hover:scale-110 transition-all"
          aria-label="Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-2 sm:p-3.5 flex flex-col flex-1 justify-between">
        <div>
          {/* Brand — hidden on mobile to save space */}
          <span className="hidden sm:block text-[10px] font-bold text-[#5F6E66] uppercase tracking-wider">
            {product.brand?.name || 'ALMARTO'}
          </span>

          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-[11px] sm:text-sm text-[#1B2721] hover:text-[#2E4A3E] transition-colors mt-0.5 sm:mt-1 line-clamp-2 leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* Rating — compact on mobile */}
          <div className="flex items-center space-x-1 mt-1">
            <span className="bg-emerald-600 text-white text-[9px] sm:text-[11px] font-bold px-1 sm:px-1.5 py-0.5 rounded flex items-center space-x-0.5">
              <span>{product.rating.toFixed(1)}</span>
              <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-white" />
            </span>
            <span className="hidden sm:inline text-[11px] text-gray-500">
              ({product.reviewCount.toLocaleString('en-IN')})
            </span>
          </div>
        </div>

        {/* Price + Actions */}
        <div className="mt-2 sm:mt-3 pt-2 border-t border-gray-100 space-y-1.5 sm:space-y-2">
          {/* Price row */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm sm:text-base font-black text-[#1B2721]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.mrp > product.price && (
                <span className="text-[10px] sm:text-[11px] text-gray-400 line-through ml-1">
                  ₹{product.mrp.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {/* Quantity stepper — desktop only */}
            <div className="hidden sm:flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50 h-7">
              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuantity((p) => Math.max(1, p - 1)); }}
                className="w-6 h-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                <Minus className="w-2.5 h-2.5" />
              </button>
              <span className="w-6 text-center font-black text-[11px] text-[#1B2721] select-none">{quantity}</span>
              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuantity((p) => Math.min(product.stock || 99, p + 1)); }}
                className="w-6 h-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          {/* Buttons */}
          {/* Mobile: single full-width Add button */}
          <button
            onClick={handleAddToCart}
            className={`sm:hidden w-full py-1.5 rounded-lg font-bold text-[11px] flex items-center justify-center space-x-1 transition-all ${
              added ? 'bg-emerald-600 text-white' : 'bg-[#2E4A3E] text-[#FAF7F2]'
            }`}
          >
            {added ? <><Check className="w-3 h-3" /><span>Added!</span></> : <><ShoppingCart className="w-3 h-3" /><span>Add to Cart</span></>}
          </button>

          {/* Desktop: two-button row */}
          <div className="hidden sm:grid grid-cols-2 gap-1.5">
            <button
              onClick={handleAddToCart}
              className={`py-2 px-2 rounded-xl font-extrabold text-[11px] flex items-center justify-center space-x-1 shadow-sm transition-all ${
                added ? 'bg-emerald-600 text-white' : 'bg-[#2E4A3E] hover:bg-[#22382F] text-[#FAF7F2]'
              }`}
            >
              {added ? <><Check className="w-3.5 h-3.5" /><span>Added!</span></> : <><ShoppingCart className="w-3.5 h-3.5" /><span>Add {quantity > 1 ? `(${quantity})` : ''}</span></>}
            </button>
            <Link
              href={`/products/${product.slug}`}
              className="py-2 px-2 rounded-xl border border-[#DFE5DC] text-[#2E4A3E] bg-[#E8EFE6]/70 hover:bg-[#2E4A3E] hover:text-[#FAF7F2] font-extrabold text-[11px] flex items-center justify-center space-x-1 transition-all group/btn"
            >
              <Eye className="w-3.5 h-3.5 text-[#527863] group-hover/btn:text-white transition-colors" />
              <span>Details</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
