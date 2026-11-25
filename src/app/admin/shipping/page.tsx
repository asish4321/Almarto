'use client';

import React, { useState, useEffect } from 'react';
import { Truck, ShieldCheck, Settings, Save, Search, CheckCircle2, AlertCircle } from 'lucide-react';

interface CourierItem {
  id: string;
  name: string;
  active: boolean;
  avgDays: string;
  coveragePincodes: string;
}

export default function AdminShippingPage() {
  const [couriers, setCouriers] = useState<CourierItem[]>([]);
  const [freeThreshold, setFreeThreshold] = useState('499');
  const [standardFee, setStandardFee] = useState('49');
  const [expressFee, setExpressFee] = useState('99');
  const [defaultCourier, setDefaultCourier] = useState('DELHIVERY');
  const [shippingMode, setShippingMode] = useState('SANDBOX');
  const [delhiveryToken, setDelhiveryToken] = useState('del_test_token_almarto_2026');
  const [shiprocketKey, setShiprocketKey] = useState('sr_sandbox_key_9981');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Pin tester
  const [testPin, setTestPin] = useState('560001');
  const [testResult, setTestResult] = useState<{ isServiceable: boolean; city?: string; state?: string; estimatedDays?: number; courierPartner?: string } | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetch('/api/admin/shipping')
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          setFreeThreshold(data.config.freeShippingThreshold);
          setStandardFee(data.config.standardShippingCharge);
          setExpressFee(data.config.expressShippingCharge);
          setDefaultCourier(data.config.defaultCourier);
          setShippingMode(data.config.shippingMode);
          if (data.config.delhiveryToken) setDelhiveryToken(data.config.delhiveryToken);
          if (data.config.shiprocketKey) setShiprocketKey(data.config.shiprocketKey);
        }
        if (data.couriers) setCouriers(data.couriers);
      });
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freeShippingThreshold: freeThreshold,
          standardShippingCharge: standardFee,
          expressShippingCharge: expressFee,
          defaultCourier,
          shippingMode,
          delhiveryToken,
          shiprocketKey,
        }),
      });

      if (res.ok) {
        setSaveMessage('Shipping settings & courier integrations updated successfully.');
      }
    } catch (err) {
      console.error(err);
      setSaveMessage('Failed to update shipping settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestPincode = async () => {
    if (testPin.length !== 6) return;
    setTesting(true);
    try {
      const res = await fetch(`/api/pincode/check?pincode=${testPin}`);
      const data = await res.json();
      setTestResult(data);
    } catch {
      setTestResult(null);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200/80 gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#19152B] tracking-tight">Logistics &amp; Courier Aggregator APIs</h1>
          <p className="text-xs text-brand-muted">
            Configure Delhivery, BlueDart, Shiprocket webhooks, automated AWB generation and rate rules
          </p>
        </div>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Courier Partners Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {couriers.map((c) => (
          <div key={c.id} className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-[#35109B]" />
                <h3 className="font-bold text-sm text-[#19152B]">{c.name}</h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">Average Transit: <strong>{c.avgDays}</strong></p>
              <p className="text-[11px] text-gray-400">Pincode Coverage: {c.coveragePincodes}</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
              {c.active ? 'Connected' : 'Disabled'}
            </span>
          </div>
        ))}
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-6 text-xs">
        <h2 className="text-base font-bold text-[#19152B] pb-3 border-b border-gray-100">
          Shipping Rates &amp; Aggregator Credentials
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Free Shipping Threshold (₹)</label>
            <input
              type="number"
              value={freeThreshold}
              onChange={(e) => setFreeThreshold(e.target.value)}
              className="w-full p-2.5 border rounded-xl"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">Free delivery applied above this cart value</span>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Standard Courier Fee (₹)</label>
            <input
              type="number"
              value={standardFee}
              onChange={(e) => setStandardFee(e.target.value)}
              className="w-full p-2.5 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Express 1-Day Priority Fee (₹)</label>
            <input
              type="number"
              value={expressFee}
              onChange={(e) => setExpressFee(e.target.value)}
              className="w-full p-2.5 border rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Default Courier Partner</label>
            <select
              value={defaultCourier}
              onChange={(e) => setDefaultCourier(e.target.value)}
              className="w-full p-2.5 border rounded-xl bg-white"
            >
              <option value="DELHIVERY">Delhivery Surface &amp; Express</option>
              <option value="BLUEDART">BlueDart Apex Air</option>
              <option value="SHIPROCKET">Shiprocket Aggregator</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Integration Environment Mode</label>
            <select
              value={shippingMode}
              onChange={(e) => setShippingMode(e.target.value)}
              className="w-full p-2.5 border rounded-xl bg-white font-bold"
            >
              <option value="SANDBOX">Sandbox / Testing Mode (Simulated AWB)</option>
              <option value="LIVE">Live Production Mode</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Delhivery Client API Token</label>
            <input
              type="password"
              value={delhiveryToken}
              onChange={(e) => setDelhiveryToken(e.target.value)}
              className="w-full p-2.5 border rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Shiprocket Bearer Key</label>
            <input
              type="password"
              value={shiprocketKey}
              onChange={(e) => setShiprocketKey(e.target.value)}
              className="w-full p-2.5 border rounded-xl font-mono"
            />
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#35109B] hover:bg-[#270A77] text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-colors flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Logistics Configuration'}</span>
          </button>
        </div>
      </form>

      {/* Interactive PIN Code Serviceability Checker */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4 text-xs">
        <h2 className="text-base font-bold text-[#19152B] pb-2 border-b border-gray-100 flex items-center space-x-2">
          <Search className="w-4 h-4 text-[#FF7900]" />
          <span>Interactive Indian PIN Code Serviceability Tester</span>
        </h2>
        <p className="text-gray-500">
          Verify delivery routing, estimated business days, and COD availability for any Indian postal code.
        </p>

        <div className="flex max-w-sm space-x-2">
          <input
            type="text"
            maxLength={6}
            value={testPin}
            onChange={(e) => setTestPin(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 6-digit PIN"
            className="flex-1 p-2.5 border rounded-xl font-bold font-mono"
          />
          <button
            type="button"
            onClick={handleTestPincode}
            disabled={testing || testPin.length !== 6}
            className="bg-[#FF7900] hover:bg-[#ea580c] disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl"
          >
            {testing ? 'Testing...' : 'Test PIN'}
          </button>
        </div>

        {testResult && (
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <span className="font-bold text-gray-800 text-sm">
              PIN Code: {testPin} ({testResult.city}, {testResult.state})
            </span>
            <p className="text-emerald-700 font-semibold">
              ✓ Serviceable via {testResult.courierPartner} (Est. {testResult.estimatedDays} business days)
            </p>
            <p className="text-gray-500">Cash on Delivery (COD): Supported</p>
          </div>
        )}
      </div>
    </div>
  );
}
