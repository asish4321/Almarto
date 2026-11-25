'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Download, ShieldCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  isBlocked: boolean;
  createdAt: string;
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleBlock = async (customerId: string, currentBlocked: boolean) => {
    const action = currentBlocked ? 'unblock' : 'block';
    if (!confirm(`Are you sure you want to ${action} this customer?`)) return;

    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, isBlocked: !currentBlocked }),
      });
      if (res.ok) fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Orders', 'Total Spent (INR)', 'Coins', 'Status'];
    const rows = filtered.map((c) => [
      c.id,
      `"${c.name}"`,
      c.email,
      c.phone,
      c.totalOrders,
      c.totalSpent,
      c.loyaltyPoints,
      c.isBlocked ? 'BLOCKED' : 'ACTIVE',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `almarto_customers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200/80 gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#19152B] tracking-tight">Customer Relationship Management</h1>
          <p className="text-xs text-brand-muted">
            Customer lifetime values, purchase profiles, security access control and activity logs
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Customer Directory</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email or mobile..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#35109B]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-gray-50/80 text-gray-400 border-b border-gray-100 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 font-semibold">Customer</th>
                <th className="py-3.5 px-4 font-semibold">Contact Details</th>
                <th className="py-3.5 px-4 font-semibold">Orders Count</th>
                <th className="py-3.5 px-4 font-semibold">Total Spent</th>
                <th className="py-3.5 px-4 font-semibold">SuperCoins</th>
                <th className="py-3.5 px-4 font-semibold">Account Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">Loading customers...</td>
                </tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/80">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#35109B] text-white flex items-center justify-center font-bold text-xs">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">{c.name}</span>
                        <span className="text-[10px] text-gray-400">
                          Joined {new Date(c.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-700 block">{c.email}</span>
                    <span className="text-gray-400 text-[11px] font-mono">{c.phone}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-800">{c.totalOrders} orders</td>
                  <td className="py-3 px-4 font-black text-[#19152B]">
                    ₹{c.totalSpent.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-orange-50 text-[#FF7900] font-bold px-2 py-0.5 rounded text-[11px]">
                      {c.loyaltyPoints} Coins
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${
                        c.isBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {c.isBlocked ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleBlock(c.id, c.isBlocked)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        c.isBlocked
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'border border-red-200 text-red-600 hover:bg-red-50'
                      }`}
                    >
                      {c.isBlocked ? 'Unblock' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
