'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { usePincode } from '@/context/PincodeContext';
import {
  Trash2,
  Plus,
  Minus,
  Tag,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Truck,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const {
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
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const { pincode, pincodeInfo, setIsPincodeModalOpen } = usePincode();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ text: string; isError?: boolean } | null>(null);
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (codeToApply: string) => {
    setApplying(true);
    setCouponFeedback(null);
    const res = await applyCoupon(codeToApply);
    setApplying(false);
    if (res.success) {
      setCouponFeedback({ text: res.message });
      setCouponInput('');
    } else {
      setCouponFeedback({ text: res.message, isError: true });
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <div className="w-24 h-24 bg-purple-50 text-[#35109B] rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-[#19152B] mb-2">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-gray-500 mb-8 leading-relaxed">
          Looks like you haven&apos;t added anything to your cart yet. Explore our bestsellers and exclusive daily deals!
        </p>
        <Link
          href="/products"
          className="bg-[#FF7900] hover:bg-[#ea580c] text-white font-bold text-sm px-8 py-3 rounded-xl transition-all shadow-md inline-block"
        >
          Explore Catalog &amp; Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-[#19152B] mb-6">
        Shopping Cart ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Deliver to bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-[#35109B]" />
              <span className="text-gray-600">
                Deliver to: <strong>{pincodeInfo.city} - {pincode}</strong> (Estimated in {pincodeInfo.estimatedDays} days)
              </span>
            </div>
            <button
              onClick={() => setIsPincodeModalOpen(true)}
              className="text-xs font-bold text-[#35109B] hover:underline"
            >
              Change PIN
            </button>
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                    <Image src={item.image} alt={item.title} fill className="object-contain p-1.5" />
                  </div>
                  <div>
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-sm font-bold text-[#19152B] hover:text-[#35109B] transition-colors line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    {item.variantTitle && (
                      <span className="text-xs text-gray-500 block mt-0.5">
                        Variant: {item.variantTitle}
                      </span>
                    )}
                    <div className="flex items-baseline space-x-2 mt-1.5">
                      <span className="text-base font-bold text-[#19152B]">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                      {item.mrp > item.price && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{item.mrp.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between w-full sm:w-auto space-x-4">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <button
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                      className="p-1.5 hover:bg-gray-200 text-gray-600 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                      className="p-1.5 hover:bg-gray-200 text-gray-600 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId, item.variantId)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-xs">
            <button
              onClick={clearCart}
              className="text-red-600 hover:underline font-semibold"
            >
              Clear Cart
            </button>
            <Link href="/products" className="text-[#35109B] font-bold hover:underline">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right: Coupon & Price Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Coupon Box */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700 flex items-center space-x-1.5">
              <Tag className="w-4 h-4 text-[#FF7900]" />
              <span>Apply Promo Code</span>
            </h3>

            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">{appliedCoupon.code}</span> applied!
                    <span className="text-[11px] block text-emerald-600">
                      You saved ₹{couponDiscount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (couponInput.trim()) handleApplyCoupon(couponInput.trim());
                  }}
                  className="flex space-x-2"
                >
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter coupon (e.g. ALMARTO500)"
                    className="flex-1 px-3 py-2 text-xs border rounded-lg uppercase font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#35109B]"
                  />
                  <button
                    type="submit"
                    disabled={applying || !couponInput.trim()}
                    className="bg-[#35109B] hover:bg-[#270A77] disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                  >
                    {applying ? '...' : 'Apply'}
                  </button>
                </form>

                {couponFeedback && (
                  <p
                    className={`text-[11px] mt-2 flex items-center space-x-1 ${
                      couponFeedback.isError ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    {couponFeedback.isError ? (
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{couponFeedback.text}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700 pb-2 border-b border-gray-100">
              Price Details
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Price ({totalItemCount} items)</span>
                <span>₹{mrpTotal.toLocaleString('en-IN')}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount on MRP</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Savings</span>
                  <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Delivery Charges</span>
                <span>
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    `₹${deliveryCharge}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-gray-400 text-[11px]">
                <span>Taxes &amp; GST (Included)</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-between text-base font-extrabold text-[#19152B]">
                <span>Total Amount</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {savings > 0 && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold text-center border border-emerald-200">
                🎉 You will save ₹{savings.toLocaleString('en-IN')} on this order!
              </div>
            )}

            <button
              onClick={() => router.push('/checkout')}
              className="w-full py-3.5 bg-[#FF7900] hover:bg-[#ea580c] text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe and Secure 256-bit Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
