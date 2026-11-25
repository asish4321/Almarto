'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, Truck, MapPin, Sparkles, ShoppingBag, Package } from 'lucide-react';

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
  const orderNumber = params.orderNumber as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [confetti, setConfetti] = useState(true);

  // Fetch order details in background — celebration shows immediately from URL
  useEffect(() => {
    const stop = setTimeout(() => setConfetti(false), 4000);

    // Try fetching with retry (order might take a moment to persist)
    let tries = 0;
    const tryFetch = () => {
      fetch(`/api/orders/${orderNumber}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.order) {
            setOrder(data.order);
          } else if (tries < 3) {
            tries++;
            setTimeout(tryFetch, 1500);
          }
        })
        .catch(() => {
          if (tries < 3) { tries++; setTimeout(tryFetch, 1500); }
        });
    };
    tryFetch();

    return () => clearTimeout(stop);
  }, [orderNumber]);

  const shippingAddress = order?.shippingAddressSnapshot
    ? JSON.parse(order.shippingAddressSnapshot)
    : null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">

      {/* Confetti */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(28)].map((_, i) => (
            <span key={i} className="absolute w-2.5 h-2.5 rounded-sm"
              style={{
                left: `${(i * 3.7) % 100}%`,
                top: `-12px`,
                backgroundColor: ['#527863','#A3B18A','#2E4A3E','#DFE8DD','#1B2721','#FAF6F0'][i % 6],
                animation: `confettiFall ${1.8 + (i % 5) * 0.3}s ease-in ${(i % 7) * 0.15}s forwards`,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(100vh) rotate(540deg) scale(0.5); opacity: 0; }
        }
        @keyframes popIn {
          0%   { transform: scale(0.3); opacity: 0; }
          65%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        .pop-in { animation: popIn 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .s0 { animation: slideUp 0.4s ease-out 0.05s both; }
        .s1 { animation: slideUp 0.4s ease-out 0.15s both; }
        .s2 { animation: slideUp 0.4s ease-out 0.25s both; }
        .s3 { animation: slideUp 0.4s ease-out 0.35s both; }
        .s4 { animation: slideUp 0.4s ease-out 0.45s both; }
      `}</style>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

        {/* Celebration header — shows immediately, no API needed */}
        <div className="bg-gradient-to-br from-[#182922] via-[#2E4A3E] to-[#527863] px-6 py-10 text-center text-white">
          <div className="pop-in w-24 h-24 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-5 shadow-2xl ring-4 ring-white/20">
            <CheckCircle2 className="w-13 h-13 text-white" strokeWidth={2} style={{ width: 52, height: 52 }} />
          </div>

          <div className="s0">
            <span className="inline-flex items-center space-x-1.5 bg-[#527863]/80 backdrop-blur text-white text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 shadow">
              <Sparkles className="w-3 h-3" />
              <span>Order Placed Successfully</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-1">
              Thank you! 🎉
            </h1>
            <p className="text-white/80 text-sm">
              Your order <span className="font-black text-white bg-white/20 px-2 py-0.5 rounded-lg">{orderNumber}</span> is confirmed.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* What happens next */}
          <div className="s1 bg-[#DFE8DD]/60 rounded-2xl p-4 border border-[#DFE8DD]">
            <p className="text-[11px] font-black text-[#2E4A3E] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> What happens next
            </p>
            <div className="space-y-2.5">
              {[
                { icon: '📦', label: 'Your order is being packed by our team' },
                { icon: '🚚', label: order?.shipment ? `Shipping via ${order.shipment.courierPartner}` : 'Will be shipped via Delhivery / BlueDart' },
                { icon: '📅', label: order?.estimatedDeliveryDate
                    ? `Estimated delivery: ${new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}`
                    : 'Delivered in 2–3 business days' },
              ].map((s, i) => (
                <div key={i} className="flex items-center space-x-3 text-xs">
                  <span className="text-lg leading-none">{s.icon}</span>
                  <span className="font-semibold text-[#1B2721]">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order summary cards — only show when order loaded */}
          {order ? (
            <>
              <div className="s2 grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <span className="text-gray-400 text-[10px] uppercase tracking-wider block mb-0.5">Amount Paid</span>
                  <span className="font-black text-sm text-[#1B2721]">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                  <span className="text-gray-400 text-[11px] block">{order.paymentMethod}</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <span className="text-gray-400 text-[10px] uppercase tracking-wider block mb-0.5">Tracking AWB</span>
                  <span className="font-black text-sm text-[#1B2721]">{order.shipment?.awbNumber || 'Assigned soon'}</span>
                  <span className="text-gray-400 text-[11px] block">{order.shipment?.courierPartner || 'Delhivery'}</span>
                </div>
              </div>

              {shippingAddress && (
                <div className="s3 flex items-start space-x-3 text-xs bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <MapPin className="w-4 h-4 text-[#527863] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-700 block">Delivering to</span>
                    <span className="text-gray-500">
                      {shippingAddress.fullName}, {shippingAddress.flatHouse}, {shippingAddress.city}, {shippingAddress.state} – {shippingAddress.pincode}
                    </span>
                  </div>
                </div>
              )}

              {order.items.length > 0 && (
                <div className="s3 space-y-2">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Items ordered</p>
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-xs py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg border overflow-hidden shrink-0">
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
              )}
            </>
          ) : (
            /* Skeleton while loading order details */
            <div className="s2 space-y-3 animate-pulse">
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 bg-gray-100 rounded-xl" />
                <div className="h-16 bg-gray-100 rounded-xl" />
              </div>
              <div className="h-12 bg-gray-100 rounded-xl" />
            </div>
          )}

          {/* CTA buttons — always visible */}
          <div className="s4 flex flex-col sm:flex-row gap-3 pt-2">
            <Link href={`/account/orders/${orderNumber}`}
              className="flex-1 flex items-center justify-center space-x-2 bg-[#2E4A3E] hover:bg-[#22382F] text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md">
              <Truck className="w-4 h-4" />
              <span>Track Order</span>
            </Link>
            <Link href="/products"
              className="flex-1 flex items-center justify-center space-x-2 border-2 border-[#2E4A3E] text-[#2E4A3E] hover:bg-[#DFE8DD] py-3.5 rounded-xl font-bold text-sm transition-all">
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
