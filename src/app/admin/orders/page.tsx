'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Search,
  Filter,
  Truck,
  Printer,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Eye,
  Save,
  Trash2,
} from 'lucide-react';

interface OrderAdminItem {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryOption: string;
  createdAt: string;
  shippingAddressSnapshot: string;
  user?: { name: string; email: string; phone?: string | null };
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
  } | null;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Selected Order for Detail Drawer
  const [selectedOrder, setSelectedOrder] = useState<OrderAdminItem | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [courierPartner, setCourierPartner] = useState('');
  const [awbNumber, setAwbNumber] = useState('');
  const [trackingActivity, setTrackingActivity] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (statusFilter !== 'ALL') q.set('status', statusFilter);
      if (search) q.set('search', search);
      q.set('limit', '50');

      const res = await fetch(`/api/orders?${q.toString()}`);
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
  }, [statusFilter, search]);

  const handleOpenDetail = (ord: OrderAdminItem) => {
    setSelectedOrder(ord);
    setNewStatus(ord.status);
    setCourierPartner(ord.shipment?.courierPartner || 'DELHIVERY');
    setAwbNumber(ord.shipment?.awbNumber || `DEL${Date.now()}`);
    setTrackingActivity('');
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteOrder = async (ord: OrderAdminItem) => {
    if (!confirm(`Permanently delete order ${ord.orderNumber}? This cannot be undone.`)) return;
    setDeletingId(ord.id);
    try {
      const res = await fetch(`/api/orders/${ord.id}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== ord.id));
        if (selectedOrder?.id === ord.id) setSelectedOrder(null);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete order');
      }
    } catch {
      alert('Network error while deleting order');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveOrderUpdates = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          courierPartner,
          awbNumber,
          trackingActivity: trackingActivity.trim() || undefined,
        }),
      });

      if (res.ok) {
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Delivered</span>;
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">In Transit</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Cancelled</span>;
      case 'RETURN_REQUESTED':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Return Requested</span>;
      default:
        return <span className="bg-purple-100 text-[#35109B] text-[10px] font-bold px-2 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200/80 gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#19152B] tracking-tight">Order Fulfillment &amp; Dispatch</h1>
          <p className="text-xs text-brand-muted">
            Manage dispatch statuses, generate courier AWBs, print invoices and process returns
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order # or Customer..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#35109B]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'RETURN_REQUESTED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-[#35109B] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-gray-50/80 text-gray-400 border-b border-gray-100 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 font-semibold">Order #</th>
                <th className="py-3.5 px-4 font-semibold">Customer</th>
                <th className="py-3.5 px-4 font-semibold">Items</th>
                <th className="py-3.5 px-4 font-semibold">Total Amount</th>
                <th className="py-3.5 px-4 font-semibold">Payment</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Courier / AWB</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">Loading orders...</td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#35109B]">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-800 block">{ord.user?.name || 'Customer'}</span>
                      <span className="text-[11px] text-gray-400">{ord.user?.phone || ord.user?.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-700">{ord.items.length} items</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-gray-700 block">{ord.paymentMethod}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">{ord.paymentStatus}</span>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(ord.status)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      <span className="font-semibold block">{ord.shipment?.courierPartner || 'Delhivery'}</span>
                      <span className="text-[10px] font-mono text-gray-400">{ord.shipment?.awbNumber || 'Pending'}</span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        href={`/account/orders/${ord.orderNumber}/invoice`}
                        target="_blank"
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-[#35109B] inline-block"
                        title="View GST Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleOpenDetail(ord)}
                        className="bg-[#35109B] hover:bg-[#270A77] text-white px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors"
                      >
                        Manage
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(ord)}
                        disabled={deletingId === ord.id}
                        className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-600 inline-block transition-colors"
                        title="Delete Order"
                      >
                        {deletingId === ord.id
                          ? <span className="text-[10px] text-red-500">...</span>
                          : <Trash2 className="w-4 h-4" />
                        }
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Management Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="bg-[#35109B] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="font-bold text-base">Fulfillment Control: #{selectedOrder.orderNumber}</h3>
                <span className="text-xs text-purple-200">Customer: {selectedOrder.user?.name} ({selectedOrder.user?.email})</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Status Updater */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3">
                <h4 className="font-bold text-gray-800 uppercase text-[11px] tracking-wider">
                  Update Order Pipeline Status
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">New Order Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full p-2.5 border rounded-xl bg-white font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[#35109B]"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="PACKED">PACKED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="RETURN_REQUESTED">RETURN REQUESTED</option>
                      <option value="REFUNDED">REFUNDED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Courier Partner</label>
                    <select
                      value={courierPartner}
                      onChange={(e) => setCourierPartner(e.target.value)}
                      className="w-full p-2.5 border rounded-xl bg-white font-bold text-xs"
                    >
                      <option value="DELHIVERY">Delhivery Express</option>
                      <option value="BLUEDART">BlueDart Apex Air</option>
                      <option value="SHIPROCKET">Shiprocket Aggregator</option>
                      <option value="DTDC">DTDC Express</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">AWB Tracking Number</label>
                    <input
                      type="text"
                      value={awbNumber}
                      onChange={(e) => setAwbNumber(e.target.value)}
                      placeholder="AWB Number"
                      className="w-full p-2.5 border rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Add Tracking Activity Log</label>
                    <input
                      type="text"
                      value={trackingActivity}
                      onChange={(e) => setTrackingActivity(e.target.value)}
                      placeholder="e.g. Package dispatched from Bengaluru sorting hub"
                      className="w-full p-2.5 border rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Items in order */}
              <div>
                <h4 className="font-bold text-gray-800 uppercase text-[11px] tracking-wider mb-2">
                  Shipment Items ({selectedOrder.items.length})
                </h4>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                  {selectedOrder.items.map((it) => (
                    <div key={it.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-10 h-10 bg-gray-50 border rounded-lg overflow-hidden shrink-0">
                          <Image src={it.image} alt={it.title} fill className="object-contain p-1" />
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block line-clamp-1">{it.title}</span>
                          <span className="text-[10px] text-gray-400 font-mono">SKU: {it.sku} • Qty: {it.quantity}</span>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">₹{(it.price * it.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions footer */}
              <div className="pt-4 border-t flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/account/orders/${selectedOrder.orderNumber}/invoice`}
                    target="_blank"
                    className="border border-gray-300 px-4 py-2 rounded-xl font-bold text-gray-700 hover:bg-gray-50 flex items-center space-x-1.5 text-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print GST Invoice</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDeleteOrder(selectedOrder)}
                    disabled={deletingId === selectedOrder.id}
                    className="border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{deletingId === selectedOrder.id ? 'Deleting...' : 'Delete Order'}</span>
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 border rounded-xl font-semibold text-gray-600 hover:bg-gray-50 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveOrderUpdates}
                    disabled={updating}
                    className="bg-[#FF7900] hover:bg-[#ea580c] text-white px-5 py-2 rounded-xl font-bold transition-colors shadow-md flex items-center space-x-1.5 text-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>{updating ? 'Updating...' : 'Save & Sync Shipment'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
