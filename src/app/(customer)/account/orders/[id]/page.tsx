'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  MapPin,
  ShieldCheck,
  RotateCcw,
  XCircle,
} from 'lucide-react';

interface TrackingStep {
  id: string;
  status: string;
  location: string;
  activity: string;
  timestamp: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  couponDiscount: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryOption: string;
  estimatedDeliveryDate?: string | null;
  shippingAddressSnapshot: string;
  createdAt: string;
  items: {
    id: string;
    title: string;
    image: string;
    price: number;
    quantity: number;
    sku: string;
  }[];
  shipment?: {
    courierPartner: string;
    awbNumber?: string | null;
    status: string;
    trackingSteps: TrackingStep[];
  } | null;
}

export default function OrderTrackingPage() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) setOrder(data.order);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center text-sm text-gray-500">Loading order tracking...</div>;
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
        <Link href="/account/orders" className="text-[#35109B] font-bold text-xs underline">
          Back to My Orders
        </Link>
      </div>
    );
  }

  const shippingAddress = order.shippingAddressSnapshot
    ? JSON.parse(order.shippingAddressSnapshot)
    : null;

  // Stages calculation for progress bar
  const STAGES = ['CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const currentIndex = STAGES.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div className="flex items-center space-x-2 text-xs text-gray-500">
        <Link href="/account" className="hover:text-[#35109B]">My Account</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/account/orders" className="hover:text-[#35109B]">Orders</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="font-bold text-gray-800">{order.orderNumber}</span>
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
          <div>
            <span className="text-xs font-bold text-[#777487] uppercase tracking-wider block">
              Shipment Tracking Details
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#19152B] mt-1">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Courier Partner:{' '}
              <strong className="text-[#35109B]">{order.shipment?.courierPartner || 'Delhivery Surface'}</strong>{' '}
              • AWB Tracking: <strong className="font-mono text-gray-800">{order.shipment?.awbNumber || 'Generating...'}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Invoice removed — available to admin only */}
          </div>
        </div>

        {/* Visual Progress Stepper */}
        {!isCancelled ? (
          <div className="relative py-4">
            <div className="hidden sm:flex items-center justify-between relative z-10">
              {STAGES.map((st, i) => {
                const isPassed = currentIndex >= i;
                const isCurrent = currentIndex === i;
                return (
                  <div key={st} className="flex flex-col items-center flex-1 text-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                        isPassed
                          ? 'bg-[#35109B] text-white ring-4 ring-[#E3DCFF]'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5 text-white" /> : i + 1}
                    </div>
                    <span
                      className={`text-[11px] mt-2 capitalize font-semibold max-w-[80px] leading-tight ${
                        isCurrent ? 'text-[#35109B] font-bold' : isPassed ? 'text-gray-800' : 'text-gray-400'
                      }`}
                    >
                      {st.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Connecting line */}
            <div className="hidden sm:block absolute top-[30px] left-10 right-10 h-1 bg-gray-200 -z-0">
              <div
                className="h-full bg-[#35109B] transition-all duration-500"
                style={{
                  width: `${Math.max(0, Math.min(100, (currentIndex / (STAGES.length - 1)) * 100))}%`,
                }}
              />
            </div>

            {/* Mobile status banner */}
            <div className="sm:hidden p-3 bg-purple-50 rounded-xl text-xs flex items-center space-x-2 text-[#35109B] font-bold">
              <Truck className="w-4 h-4 text-[#FF7900]" />
              <span>Current Status: {order.status.replace(/_/g, ' ')}</span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-red-50 text-red-800 rounded-xl text-xs font-bold flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>This order was cancelled. Any online payment is refunded to original source.</span>
          </div>
        )}

        {/* Live Tracking Activity Feed */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700 flex items-center space-x-2">
            <Truck className="w-4 h-4 text-[#FF7900]" />
            <span>Courier Transit Activity Feed</span>
          </h3>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-300">
            {order.shipment?.trackingSteps && order.shipment.trackingSteps.length > 0 ? (
              order.shipment.trackingSteps.map((step, idx) => (
                <div key={step.id || idx} className="relative text-xs">
                  <div className="absolute -left-[23px] top-0.5 w-3 h-3 rounded-full bg-[#35109B] ring-4 ring-white" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <span className="font-bold text-gray-800">{step.activity}</span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {new Date(step.timestamp).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500 block mt-0.5">Location: {step.location}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-500">
                Shipment electronic data received. Courier dispatch transit details will update shortly.
              </div>
            )}
          </div>
        </div>

        {/* Delivery Address & Price Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 text-xs">
          {/* Address */}
          <div>
            <span className="font-bold text-gray-700 uppercase tracking-wider block mb-2">
              Shipping Destination
            </span>
            {shippingAddress ? (
              <div className="bg-white p-4 rounded-xl border border-gray-200/80 space-y-1 text-gray-600">
                <span className="font-bold text-gray-900 block">{shippingAddress.fullName}</span>
                <p>
                  {shippingAddress.flatHouse}, {shippingAddress.areaColony}
                  <br />
                  {shippingAddress.landmark ? `${shippingAddress.landmark}, ` : ''}
                  {shippingAddress.city}, {shippingAddress.state} - <strong>{shippingAddress.pincode}</strong>
                </p>
                <span className="text-gray-500 block pt-1">Phone: {shippingAddress.phone}</span>
              </div>
            ) : (
              <p className="text-gray-400">Address snapshot unavailable</p>
            )}
          </div>

          {/* Payment summary */}
          <div>
            <span className="font-bold text-gray-700 uppercase tracking-wider block mb-2">
              Payment Summary
            </span>
            <div className="bg-white p-4 rounded-xl border border-gray-200/80 space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <strong className="text-gray-800">{order.paymentMethod}</strong>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="font-bold text-emerald-700">{order.paymentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount:</span>
                  <span>-₹{order.couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge:</span>
                <span>{order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#19152B] pt-2 border-t">
                <span>Total Paid:</span>
                <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Items */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <span className="font-bold text-xs text-gray-700 uppercase tracking-wider block">
            Items in this Order ({order.items.length})
          </span>
          <div className="divide-y divide-gray-100">
            {order.items.map((it) => (
              <div key={it.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3.5">
                  <div className="relative w-14 h-14 bg-gray-50 border rounded-xl overflow-hidden shrink-0">
                    <Image src={it.image} alt={it.title} fill className="object-contain p-1" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 block line-clamp-1">{it.title}</span>
                    <span className="text-gray-400 font-mono text-[11px]">SKU: {it.sku} • Qty: {it.quantity}</span>
                  </div>
                </div>
                <span className="font-bold text-[#19152B] text-sm">
                  ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
