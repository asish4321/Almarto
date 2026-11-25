'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, Package, ArrowRight, Truck, MapPin, Sparkles, ShoppingBag, Heart } from 'lucide-react';

interface OrderData {
  orderNumber: string;
  totalAmount: number;
  paymentMethod: string;
  estimatedDeliveryDate: string | null;
  shipment?: { courierPartner: string; awbNumber?: string | null } | null;
  items: { id: string; title: string; image: string; quantity: number; total: number }[];
  shippingAddressSnapshot: string;
}

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params.orderNumber as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confetti, setConfetti] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${orderNumber}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.order) setOrder(data.order); })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Stop confetti after 4 seconds
    const t = setTimeout(() => setConfetti(false), 4000);
    return () => clearTimeout(t);
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-[#DFE8DD] border-t-[#2E4A3E] animate-spin" />
        <p className="text-sm font-bold text-[#2E4A3E]">Confirming your order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <Package className="w-16 h-16 text-gray-300" />
        <h2 className="text-xl font-black text-[#1B2721]">Order not found</h2>
        <Link href="/products" className="bg-[#2E4A3E] text-white px-6 py-2.5 rounded-xl font-bold text-sm">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const shippingAddress = order.shippingAddressSnapshot ? JSON.parse(order.shippingAddressSnapshot) : null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      {/* Confetti dots animation */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(24)].map((_, i) => (
            <span
              key={i}
              className="absolute w-2.5 h-2.5 rounded-full opacity-80"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${10 + Math.random() * 10}px`,
                backgroundColor: ['#527863','#A3B18A','#2E4A3E','#FAF6F0','#DFE8DD','#1B2721'][i % 6],
                animation: `confettiFall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 1}s forwards`,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes popIn {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(24px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        .pop-in   { animation: popIn 0.5s ease-out forwards; }
        .slide-up { animation: slideUp 0.5s ease-out forwards; }
        .slide-up-1 { animation: slideUp 0.5s ease-out 0.1s both; }
        .slide-up-2 { animation: slideUp 0.5s ease-out 0.2s both; }
        .slide-up-3 { animation: slideUp 0.5s ease-out 0.3s both; }
        .slide-up-4 { animation: slideUp 0.5s ease-out 0.4s both; }
      `}</style>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

        {/* Top green celebration bar */}
        <div className="bg-gradient-to-r from-[#182922] to-[#2E4A3E] px-8 py-8 text-center text-white">
          <div className="pop-in w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CheckCircle2 className="w-11 h-11 text-white" strokeWidth={2.5} />
          </div>
          <div className="slide-up">
            <span className="inline-flex items-center space-x-1 bg-[#527863] text-white text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3 h-3" />
              <span>Order Confirmed</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black leading-tight">
              Thank you for your order! 🎉
            </h1>
            <p className="text-white/80 text-sm mt-1">
              Your order <span className="font-black text-white">{order.orderNumber}</span> has been placed successfully.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* What happens next */}
          <div className="slide-up-1 bg-[#DFE8DD]/50 rounded-2xl p-4 border border-[#DFE8DD]">
            <p className="text-xs font-black text-[#2E4A3E] uppercase tracking-wider mb-3">What happens next?</p>
            <div className="space-y-2">
              {[
                { icon: '📦', text: 'Your order is being prepared by our team' },
                { icon: '🚚', text: `Will be shipped via ${order.shipment?.courierPartner || 'Delhivery'}` },
                { icon: '📅', text: `Estimated delivery: ${order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }) : '2–3 business days'}` },
              ].map((s, i) => (
                <div key={i} className="flex items-center space-x-3 text-xs text-[#1B2721]">
                  <span className="text-base">{s.icon}</span>
                  <span className="font-semibold">{s.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order summary */}
          <div className="slide-up-2 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider mb-0.5">Amount Paid</span>
              <span className="font-black text-sm text-[#1B2721]">₹{order.totalAmount.toLocaleString('en-IN')}</span>
              <span className="text-gray-400 block text-[11px]">{order.paymentMethod}</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider mb-0.5">AWB / Tracking</span>
              <span className="font-black text-sm text-[#1B2721]">{order.shipment?.awbNumber || 'Assigned soon'}</span>
              <span className="text-gray-400 block text-[11px]">{order.shipment?.courierPartner || 'Delhivery'}</span>
            </div>
          </div>

          {/* Delivery address */}
          {shippingAddress && (
            <div className="slide-up-2 flex items-start space-x-3 text-xs bg-gray-50 rounded-xl p-3 border border-gray-100">
              <MapPin className="w-4 h-4 text-[#527863] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-700 block">Delivering to</span>
                <span className="text-gray-500">
                  {shippingAddress.fullName}, {shippingAddress.flatHouse}, {shippingAddress.city}, {shippingAddress.state} – {shippingAddress.pincode}
                </span>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="slide-up-3 space-y-2">
            <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Items ordered</p>
            {order.items.map(item => (
              <div key={item.id} className="flex items-center justify-between text-xs py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg border overflow-hidden shrink-0 relative">
                    {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-contain p-1" />}
                  </div>
                  <div>
                    <span className="font-semibold text-[#1B2721] line-clamp-1">{item.title}</span>
                    <span className="text-gray-400 text-[10px]">Qty: {item.quantity}</span>
                  </div>
                </div>
                <span className="font-bold text-[#1B2721]">₹{item.total.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="slide-up-4 flex flex-col sm:flex-row gap-3 pt-2">
            <Link href={`/account/orders/${order.orderNumber}`}
              className="flex-1 flex items-center justify-center space-x-2 bg-[#2E4A3E] hover:bg-[#22382F] text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md">
              <Truck className="w-4 h-4" />
              <span>Track Order</span>
            </Link>
            <Link href="/products"
              className="flex-1 flex items-center justify-center space-x-2 border-2 border-[#2E4A3E] text-[#2E4A3E] hover:bg-[#DFE8DD] py-3 rounded-xl font-bold text-sm transition-all">
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
