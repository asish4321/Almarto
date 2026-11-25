'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Truck,
  RotateCcw,
  Printer,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';

interface OrderItemData {
  id: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  estimatedDeliveryDate?: string | null;
  items: OrderItemData[];
  shipment?: {
    courierPartner: string;
    awbNumber?: string | null;
    status: string;
  } | null;
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancellingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CANCEL' }),
      });
      if (res.ok) {
        setActionMessage('Order cancelled successfully.');
        fetchOrders();
      }
    } catch {
      setActionMessage('Failed to cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleRequestReturn = async (orderId: string) => {
    const reason = prompt('Please enter the reason for return (e.g. Size exchange, Defective item):');
    if (!reason) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REQUEST_RETURN', returnReason: reason }),
      });
      if (res.ok) {
        setActionMessage('Return request submitted. Courier pickup will be scheduled.');
        fetchOrders();
      }
    } catch {
      setActionMessage('Failed to submit return request.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivered</span>
          </span>
        );
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
            <Truck className="w-3.5 h-3.5" />
            <span>In Transit</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        );
      case 'RETURN_REQUESTED':
        return (
          <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Return Requested</span>
          </span>
        );
      default:
        return (
          <span className="bg-purple-100 text-[#35109B] text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center space-x-2 text-xs text-gray-500 mb-6">
        <Link href="/account" className="hover:text-[#35109B]">My Account</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="font-bold text-gray-800">My Orders</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-[#19152B]">My Orders ({orders.length})</h1>
      </div>

      {actionMessage && (
        <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold">
          {actionMessage}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-sm text-gray-500">Loading your orders...</div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden hover:border-[#35109B]/40 transition-all"
            >
              {/* Order Header bar */}
              <div className="bg-gray-50/80 px-6 py-3.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="text-gray-400 block text-[10px]">ORDER PLACED</span>
                    <span className="font-semibold text-gray-700">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px]">TOTAL</span>
                    <span className="font-bold text-[#19152B]">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px]">ORDER #</span>
                    <span className="font-mono font-bold text-[#35109B]">{order.orderNumber}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Order Items Body */}
              <div className="p-6 space-y-4">
                {order.items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3.5">
                      <div className="relative w-14 h-14 bg-gray-50 border rounded-xl overflow-hidden shrink-0">
                        <Image src={it.image} alt={it.title} fill className="object-contain p-1" />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-[#19152B] line-clamp-1">{it.title}</span>
                        <span className="text-gray-500 block text-xs">Qty: {it.quantity} • ₹{it.price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-[#19152B]">
                      ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}

                {/* Footer Controls */}
                <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-gray-500 flex items-center space-x-1.5">
                    <Truck className="w-4 h-4 text-[#FF7900]" />
                    <span>
                      Courier: <strong>{order.shipment?.courierPartner || 'Delhivery'}</strong>
                      {order.shipment?.awbNumber && ` (AWB: ${order.shipment.awbNumber})`}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {['PENDING', 'CONFIRMED'].includes(order.status) && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingId === order.id}
                        className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-semibold"
                      >
                        {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )}

                    {order.status === 'DELIVERED' && (
                      <button
                        onClick={() => handleRequestReturn(order.id)}
                        className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Return / Exchange</span>
                      </button>
                    )}

                    <Link
                      href={`/account/orders/${order.orderNumber}`}
                      className="bg-[#35109B] hover:bg-[#270A77] text-white px-4 py-1.5 rounded-lg font-bold transition-colors flex items-center space-x-1 shadow-sm"
                    >
                      <span>Track Shipment</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <div className="w-16 h-16 rounded-full bg-purple-50 text-[#35109B] flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-base text-[#19152B] mb-1">No Orders Placed Yet</h3>
          <p className="text-xs text-gray-500 mb-6">Explore our curated catalog to place your first order.</p>
          <Link
            href="/products"
            className="bg-[#FF7900] text-white px-6 py-2.5 rounded-xl font-bold text-xs"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
