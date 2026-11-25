'use client';

import React, { useState, useEffect } from 'react';
import { Warehouse, AlertTriangle, Plus, Minus, Search, ShieldCheck } from 'lucide-react';

interface InventoryItem {
  id: string;
  title: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  price: number;
  category?: { name: string };
  variants?: { id: string; title: string; sku: string; stock: number }[];
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('10');
  const [adjustReason, setAdjustReason] = useState('New shipment restock');
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/inventory');
      if (res.ok) {
        const data = await res.json();
        setItems(data.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: adjustingItem.id,
          adjustment: parseInt(adjustAmount, 10),
          reason: adjustReason,
        }),
      });

      if (res.ok) {
        setAdjustingItem(null);
        fetchInventory();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = items.filter(
    (it) => it.title.toLowerCase().includes(search.toLowerCase()) || it.sku.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = items.filter((it) => it.stock <= it.lowStockThreshold && it.stock > 0).length;
  const outOfStockCount = items.filter((it) => it.stock === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200/80 gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#19152B] tracking-tight">Real-Time Inventory &amp; Stock Control</h1>
          <p className="text-xs text-brand-muted">
            Warehouse fulfillment levels, automated low-stock warnings, and manual inventory adjustments
          </p>
        </div>
      </div>

      {/* Stock Health Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total SKUs</span>
            <span className="text-2xl font-black text-[#19152B]">{items.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#35109B] flex items-center justify-center font-bold">
            <Warehouse className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Low Stock Alert (&lt; 10)</span>
            <span className="text-2xl font-black text-amber-600">{lowStockCount} Items</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">Out of Stock</span>
            <span className="text-2xl font-black text-red-600">{outOfStockCount} Items</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name or SKU..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#35109B]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-gray-50/80 text-gray-400 border-b border-gray-100 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Price (₹)</th>
                <th className="py-3 px-4">Stock on Hand</th>
                <th className="py-3 px-4">Alert Threshold</th>
                <th className="py-3 px-4 text-right">Quick Stock Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">Loading stock data...</td>
                </tr>
              ) : filtered.map((it) => (
                <tr key={it.id} className="hover:bg-gray-50/80">
                  <td className="py-3 px-4 font-bold text-gray-900">{it.title}</td>
                  <td className="py-3 px-4 font-mono text-gray-500">{it.sku}</td>
                  <td className="py-3 px-4 text-gray-600">{it.category?.name || 'General'}</td>
                  <td className="py-3 px-4 font-bold">₹{it.price.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-black px-2.5 py-1 rounded-full text-[10px] ${
                        it.stock === 0
                          ? 'bg-red-100 text-red-700'
                          : it.stock <= it.lowStockThreshold
                          ? 'bg-amber-100 text-amber-700 animate-pulse'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {it.stock} units
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{it.lowStockThreshold} units</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setAdjustingItem(it)}
                      className="bg-[#35109B] hover:bg-[#270A77] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border">
            <div className="bg-[#35109B] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">Adjust Stock: {adjustingItem.sku}</h3>
              <button onClick={() => setAdjustingItem(null)}>✕</button>
            </div>

            <form onSubmit={handleAdjustStock} className="p-6 space-y-4 text-xs">
              <p className="text-gray-600 font-semibold">{adjustingItem.title}</p>
              <div className="p-3 bg-gray-50 rounded-xl text-gray-700">
                Current Stock Level: <strong className="text-base text-[#19152B]">{adjustingItem.stock} units</strong>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Stock Adjustment (+ or -)</label>
                <input
                  type="number"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="e.g. +25 or -5"
                  className="w-full p-2.5 border rounded-xl font-bold"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  New stock will be: {Math.max(0, adjustingItem.stock + parseInt(adjustAmount || '0', 10))} units
                </span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Adjustment Reason</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. New consignment arrival, Damaged goods writeoff"
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="px-4 py-2 border rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#FF7900] hover:bg-[#ea580c] text-white font-bold px-5 py-2 rounded-xl"
                >
                  {submitting ? 'Applying...' : 'Apply Stock Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
