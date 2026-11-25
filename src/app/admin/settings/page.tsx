'use client';

import React, { useState, useEffect } from 'react';
import {
  Save, CheckCircle2, CreditCard, Power,
  MapPin, Phone, Mail, MessageCircle,
  Facebook, Instagram, Youtube,
} from 'lucide-react';

export default function AdminSettingsPage() {
  // ── Business info ──
  const [storeName, setStoreName]           = useState('ALMARTO');
  const [supportEmail, setSupportEmail]     = useState('almarto14@gmail.com');
  const [supportPhone, setSupportPhone]     = useState('7032503603');
  const [gstin, setGstin]                   = useState('');
  const [businessAddress, setBusinessAddress] = useState(
    'Bahadurpally, Hyderabad, Telangana – 500043\nOpposite Pista House'
  );

  // ── Social & WhatsApp ──
  const [whatsappNumber, setWhatsappNumber]   = useState('917032503603');
  const [whatsappMessage, setWhatsappMessage] = useState('Hi! I need help with my Almarto order.');
  const [socialFacebook, setSocialFacebook]   = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialYoutube, setSocialYoutube]     = useState('');

  // ── Payment ──
  const [razorpayMode, setRazorpayMode] = useState('TEST');
  const [razorpayKey, setRazorpayKey]   = useState('');
  const [codEnabled, setCodEnabled]     = useState(true);
  const [upiEnabled, setUpiEnabled]     = useState(true);

  // ── System ──
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [saving, setSaving]   = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/content')
      .then((r) => r.json())
      .then((data) => {
        const st = data.settings || {};
        if (st.store_name)              setStoreName(st.store_name);
        if (st.support_email)           setSupportEmail(st.support_email);
        if (st.support_phone)           setSupportPhone(st.support_phone);
        if (st.business_gstin)          setGstin(st.business_gstin);
        if (st.business_address)        setBusinessAddress(st.business_address);
        if (st.whatsapp_number)         setWhatsappNumber(st.whatsapp_number);
        if (st.whatsapp_message)        setWhatsappMessage(st.whatsapp_message);
        if (st.social_facebook)         setSocialFacebook(st.social_facebook);
        if (st.social_instagram)        setSocialInstagram(st.social_instagram);
        if (st.social_youtube)          setSocialYoutube(st.social_youtube);
        if (st.payment_razorpay_mode)   setRazorpayMode(st.payment_razorpay_mode);
        if (st.payment_razorpay_key)    setRazorpayKey(st.payment_razorpay_key);
        if (st.payment_cod_enabled)     setCodEnabled(st.payment_cod_enabled === 'true');
        if (st.payment_upi_enabled)     setUpiEnabled(st.payment_upi_enabled === 'true');
        if (st.maintenance_mode)        setMaintenanceMode(st.maintenance_mode === 'true');
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_SETTINGS',
          settingsData: {
            store_name:             storeName,
            support_email:          supportEmail,
            support_phone:          supportPhone,
            business_gstin:         gstin,
            business_address:       businessAddress,
            whatsapp_number:        whatsappNumber,
            whatsapp_message:       whatsappMessage,
            social_facebook:        socialFacebook,
            social_instagram:       socialInstagram,
            social_youtube:         socialYoutube,
            payment_razorpay_mode:  razorpayMode,
            payment_razorpay_key:   razorpayKey,
            payment_cod_enabled:    String(codEnabled),
            payment_upi_enabled:    String(upiEnabled),
            maintenance_mode:       String(maintenanceMode),
          },
        }),
      });
      if (res.ok) {
        setFeedback('Settings saved successfully.');
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback('Failed to save settings.');
      }
    } catch {
      setFeedback('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, children: React.ReactNode, hint?: string) => (
    <div>
      <label className="block font-bold text-gray-700 mb-1 text-xs">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );

  const input = (value: string, onChange: (v: string) => void, props?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#2E4A3E]"
      {...props}
    />
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-gray-200/80">
        <h1 className="text-2xl font-black text-[#19152B] tracking-tight">Store Settings</h1>
        <p className="text-xs text-gray-400 mt-1">
          Business info, contact details, social links, WhatsApp, and payment configuration.
        </p>
      </div>

      {feedback && (
        <div className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
          feedback.includes('success') || feedback.includes('saved')
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">

        {/* ── Business Info ── */}
        <section className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#19152B] flex items-center space-x-2 pb-2 border-b border-gray-100">
            <MapPin className="w-4 h-4 text-[#527863]" />
            <span>Business Information</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('Brand Name', input(storeName, setStoreName, { placeholder: 'ALMARTO' }))}
            {field('GSTIN', input(gstin, setGstin, { placeholder: '36AAACA1234M1Z5', className: 'w-full p-2.5 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#2E4A3E]' }))}
          </div>
          {field(
            'Store Address',
            <textarea
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              rows={3}
              className="w-full p-2.5 border border-gray-200 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#2E4A3E]"
              placeholder="Street, City, State – PIN&#10;Landmark"
            />,
            'Shown in the footer. Use a new line for the landmark.'
          )}
        </section>

        {/* ── Contact ── */}
        <section className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#19152B] flex items-center space-x-2 pb-2 border-b border-gray-100">
            <Phone className="w-4 h-4 text-[#527863]" />
            <span>Contact Details</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('Support Phone', input(supportPhone, setSupportPhone, { type: 'tel', placeholder: '7032503603' }))}
            {field('Support Email', input(supportEmail, setSupportEmail, { type: 'email', placeholder: 'almarto14@gmail.com' }))}
          </div>
        </section>

        {/* ── WhatsApp ── */}
        <section className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#19152B] flex items-center space-x-2 pb-2 border-b border-gray-100">
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>WhatsApp Chat Button</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field(
              'WhatsApp Number (with country code)',
              input(whatsappNumber, setWhatsappNumber, { placeholder: '917032503603' }),
              'Include country code without +. Example: 917032503603'
            )}
            {field(
              'Pre-filled Message',
              input(whatsappMessage, setWhatsappMessage, { placeholder: 'Hi! I need help...' }),
              'This text auto-fills when customer opens WhatsApp'
            )}
          </div>
        </section>

        {/* ── Social Media ── */}
        <section className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#19152B] flex items-center space-x-2 pb-2 border-b border-gray-100">
            <Facebook className="w-4 h-4 text-[#1877F2]" />
            <span>Social Media Links</span>
          </h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-[#1877F2]/10 flex items-center justify-center shrink-0">
                <Facebook className="w-4 h-4 text-[#1877F2]" />
              </div>
              {field('Facebook Page URL', input(socialFacebook, setSocialFacebook, { type: 'url', placeholder: 'https://facebook.com/almarto' }))}
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center shrink-0">
                <Instagram className="w-4 h-4 text-pink-600" />
              </div>
              {field('Instagram Profile URL', input(socialInstagram, setSocialInstagram, { type: 'url', placeholder: 'https://instagram.com/almarto' }))}
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <Youtube className="w-4 h-4 text-red-600" />
              </div>
              {field('YouTube Channel URL', input(socialYoutube, setSocialYoutube, { type: 'url', placeholder: 'https://youtube.com/@almarto' }))}
            </div>
          </div>
          <p className="text-[11px] text-gray-400">Leave blank to hide the icon in the footer.</p>
        </section>

        {/* ── Payment ── */}
        <section className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#19152B] flex items-center space-x-2 pb-2 border-b border-gray-100">
            <CreditCard className="w-4 h-4 text-[#527863]" />
            <span>Payment Gateway</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('Gateway Mode',
              <select value={razorpayMode} onChange={(e) => setRazorpayMode(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#2E4A3E]">
                <option value="TEST">Sandbox / Test Mode</option>
                <option value="LIVE">Live Production Mode</option>
              </select>
            )}
            {field('Razorpay Key ID', input(razorpayKey, setRazorpayKey, { placeholder: 'rzp_test_...', className: 'w-full p-2.5 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#2E4A3E]' }))}
          </div>
          <div className="flex flex-wrap gap-5 pt-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" checked={upiEnabled} onChange={(e) => setUpiEnabled(e.target.checked)} className="rounded" />
              <span className="text-xs font-semibold text-gray-700">Enable UPI (GPay / PhonePe)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" checked={codEnabled} onChange={(e) => setCodEnabled(e.target.checked)} className="rounded" />
              <span className="text-xs font-semibold text-gray-700">Enable Cash on Delivery</span>
            </label>
          </div>
        </section>

        {/* ── Maintenance ── */}
        <section className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-[#19152B] flex items-center space-x-2 pb-2 border-b border-gray-100">
            <Power className="w-4 h-4 text-red-500" />
            <span>Maintenance Mode</span>
          </h2>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} className="rounded" />
            <span className="text-xs font-bold text-red-600">Activate Maintenance Mode (pauses checkout)</span>
          </label>
          <p className="text-[11px] text-gray-400">Visitors see a maintenance notice. Admins can still access everything.</p>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#2E4A3E] hover:bg-[#22382F] text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-colors flex items-center space-x-2 text-xs disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
