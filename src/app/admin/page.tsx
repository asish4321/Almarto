'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';

interface AdminStatsResponse {
  metrics: {
    totalRevenue: number;
    todayRevenue: number;
    monthRevenue: number;
    totalOrders: number;
    rangeOrdersCount: number;
    pendingOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalCustomers: number;
    totalProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    returnRequests: number;
  };
  chartData: { date: string; revenue: number; orders: number }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    user?: { name: string; email: string };
    items: { id: string; title: string; quantity: number }[];
  }[];
  topCategories: { id: string; name: string; slug: string; productCount: number }[];
}

export default function AdminDashboardPage() {
  const [range, setRange] = useState<'today' | '7d' | '30d' | '90d' | 'all'>('30d');
  const [data, setData] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stats?range=${range}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [range]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const maxRevenue = data?.chartData ? Math.max(...data.chartData.map((d) => d.revenue), 1) : 1;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Date Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200/80 gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#19152B] tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-brand-muted">
            Live business performance, order pipelines and inventory telemetry across India
          </p>
        </div>

        {/* Date Filters */}
        <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-gray-200 shadow-sm text-xs">
          {(['today', '7d', '30d', '90d', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all ${
                range === r
                  ? 'bg-[#35109B] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : r === '90d' ? '90 Days' : r === 'all' ? 'All Time' : 'Today'}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Key Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Total Revenue ({range})
            </span>
            <span className="text-2xl font-black text-[#19152B] mt-1 block">
              ₹{(data?.metrics?.totalRevenue || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center space-x-0.5 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>Today: ₹{(data?.metrics?.todayRevenue || 0).toLocaleString('en-IN')}</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#35109B] flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Orders Placed
            </span>
            <span className="text-2xl font-black text-[#19152B] mt-1 block">
              {data?.metrics?.totalOrders || 0}
            </span>
            <span className="text-[11px] text-[#35109B] font-bold flex items-center space-x-1 mt-1">
              <Clock className="w-3 h-3 text-[#FF7900]" />
              <span>{data?.metrics?.pendingOrders || 0} Pending Dispatch</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF7900] flex items-center justify-center font-bold">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Delivered / Completed */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Delivered Successfully
            </span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">
              {data?.metrics?.deliveredOrders || 0}
            </span>
            <span className="text-[11px] text-gray-500 font-medium block mt-1">
              {data?.metrics?.cancelledOrders || 0} cancelled
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Customers & Inventory */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Customers &amp; Stock
            </span>
            <span className="text-2xl font-black text-[#19152B] mt-1 block">
              {data?.metrics?.totalCustomers || 0} Customers
            </span>
            <span className="text-[11px] text-amber-600 font-bold flex items-center space-x-1 mt-1">
              <AlertTriangle className="w-3 h-3" />
              <span>{data?.metrics?.lowStockProducts || 0} Low Stock Alerts</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Interactive Revenue & Order Volume Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#19152B]">Revenue &amp; Order Volume Trend</h2>
            <p className="text-xs text-gray-400">Daily financial trajectory for the selected timeframe</p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-semibold">
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded bg-[#35109B]" />
              <span className="text-gray-600">Revenue (₹)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded bg-[#FF7900]" />
              <span className="text-gray-600">Orders</span>
            </div>
          </div>
        </div>

        {/* Bar Chart Visualization */}
        <div className="pt-6 pb-2">
          {data?.chartData && data.chartData.length > 0 ? (
            <div className="flex items-end justify-between h-48 gap-2 pt-6 border-b border-gray-100">
              {data.chartData.map((d, i) => {
                const heightPercent = Math.max(10, Math.round((d.revenue / maxRevenue) * 100));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-[10px] py-1 px-2 rounded shadow-lg transition-opacity pointer-events-none z-10 whitespace-nowrap">
                      ₹{d.revenue.toLocaleString('en-IN')} ({d.orders} orders)
                    </div>

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[28px] bg-gradient-to-t from-[#35109B] to-[#5B2EFF] rounded-t-md group-hover:from-[#FF7900] group-hover:to-[#FB923C] transition-all duration-300"
                    />

                    {/* Date label */}
                    <span className="text-[10px] text-gray-400 mt-2 truncate w-full text-center">
                      {d.date}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-gray-400">
              No chart data available for this range
            </div>
          )}
        </div>
      </div>

      {/* 3. Grid: Recent Orders (8 cols) + Top Performing Categories (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-[#19152B]">Recent Orders</h2>
              <p className="text-xs text-gray-400">Real-time orders queue awaiting fulfillment</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-[#35109B] hover:text-[#FF7900] flex items-center space-x-1"
            >
              <span>View All Orders</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Status Transition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.recentOrders && data.recentOrders.length > 0 ? (
                  data.recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 font-mono font-bold text-[#35109B]">
                        <Link href={`/account/orders/${ord.orderNumber}`} className="hover:underline">
                          {ord.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3">
                        <span className="font-semibold text-gray-800 block">{ord.user?.name || 'Customer'}</span>
                        <span className="text-[11px] text-gray-400">{ord.user?.email}</span>
                      </td>
                      <td className="py-3 font-bold text-gray-900">
                        ₹{ord.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3">
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                          className="text-[11px] font-bold px-2 py-1 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#35109B]"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="PACKED">PACKED</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400">
                      No recent orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Categories & Quick Actions */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#19152B] pb-2 border-b border-gray-100">
              Top Categories
            </h2>

            <div className="space-y-3">
              {data?.topCategories?.map((cat, idx) => (
                <div key={cat.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#F2EFFF] text-[#35109B] font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-gray-800">{cat.name}</span>
                  </div>
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-bold">
                    {cat.productCount} Items
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-gradient-to-r from-[#35109B] to-[#270A77] text-white p-5 rounded-2xl shadow-sm space-y-3">
            <h3 className="font-bold text-sm">Quick Operations</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/admin/content"
                className="bg-[#FF7900] hover:bg-[#ea580c] p-2.5 rounded-xl font-bold transition-colors text-center text-white col-span-2 flex items-center justify-center space-x-1.5 shadow"
              >
                <span>📸 Upload Hero Section Photos</span>
              </Link>
              <Link
                href="/admin/products"
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl font-semibold transition-colors text-center"
              >
                + Add Product
              </Link>
              <Link
                href="/admin/coupons"
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl font-semibold transition-colors text-center"
              >
                + Create Coupon
              </Link>
              <Link
                href="/admin/inventory"
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl font-semibold transition-colors text-center"
              >
                Adjust Stock
              </Link>
              <Link
                href="/admin/reports"
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl font-semibold transition-colors text-center"
              >
                Export CSV
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
