'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, ShieldCheck, ShieldAlert, Key } from 'lucide-react';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const ROLES = [
  { id: 'SUPER_ADMIN', name: 'Super Admin', desc: 'Full unrestricted platform access' },
  { id: 'ADMIN', name: 'Admin', desc: 'Configurable operational access' },
  { id: 'PRODUCT_MANAGER', name: 'Product Manager', desc: 'Catalog, pricing & inventory management' },
  { id: 'ORDER_MANAGER', name: 'Order Manager', desc: 'Order fulfillment, shipments & courier dispatch' },
  { id: 'CUSTOMER_SUPPORT', name: 'Customer Support', desc: 'Customer queries, returns & complaints desk' },
  { id: 'FINANCE_MANAGER', name: 'Finance Manager', desc: 'Tax reports, settlements & refund approvals' },
];

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ORDER_MANAGER');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/staff');
      if (res.ok) {
        const data = await res.json();
        setStaff(data.staff || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        setName('');
        setEmail('');
        setPhone('');
        fetchStaff();
      } else {
        setErrorMsg(data.message || 'Failed to add staff member');
      }
    } catch {
      setErrorMsg('Failed to add staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeRole = async (staffId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, role: newRole }),
      });
      if (res.ok) fetchStaff();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200/80 gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#19152B] tracking-tight">Role-Based Access Control (RBAC)</h1>
          <p className="text-xs text-brand-muted">
            Configure employee privileges across Super Admin, Product Lead, Order Dispatch, and Finance
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#FF7900] hover:bg-[#ea580c] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Staff Member</span>
        </button>
      </div>

      {/* Roles explanation cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ROLES.map((r) => (
          <div key={r.id} className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm text-xs">
            <span className="font-bold text-[#35109B] block mb-0.5">{r.name}</span>
            <span className="text-gray-500 text-[11px] block">{r.desc}</span>
          </div>
        ))}
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-gray-50/80 text-gray-400 border-b border-gray-100 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Role Assignment</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">Loading staff users...</td>
                </tr>
              ) : staff.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/80">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-[#35109B] text-white flex items-center justify-center font-bold text-xs">
                        {s.name.charAt(0)}
                      </div>
                      <span className="font-bold text-gray-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 font-medium">{s.email}</td>
                  <td className="py-3 px-4 font-mono text-gray-500">{s.phone || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <select
                      value={s.role}
                      onChange={(e) => handleChangeRole(s.id, e.target.value)}
                      className="px-2 py-1 rounded-lg border border-gray-200 bg-white font-bold text-xs focus:ring-1 focus:ring-[#35109B]"
                    >
                      {ROLES.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border">
            <div className="bg-[#35109B] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">Provision New Employee Access</h3>
              <button onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl font-semibold">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kulkarni"
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Company Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@almarto.com"
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-white font-bold"
                >
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} - {r.desc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 99000 12345"
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#FF7900] hover:bg-[#ea580c] text-white font-bold px-5 py-2 rounded-xl"
                >
                  {submitting ? 'Provisioning...' : 'Provision Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
