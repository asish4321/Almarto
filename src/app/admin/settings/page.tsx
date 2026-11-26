'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Save, CheckCircle2, CreditCard, Power,
  MapPin, Phone, Mail, MessageCircle,
  Facebook, Instagram, Youtube, Upload,
  Image as ImageIcon, RotateCcw, Sparkles, ExternalLink,
} from 'lucide-react';

export default function AdminSettingsPage() {
  // ── Brand logo ──
  const [storeLogo, setStoreLogo]               = useState('/logo.png');
  const [logoInputUrl, setLogoInputUrl]         = useState('');

  // ── Business info ──
  const [storeName, setStoreName]               = useState('ALMARTO');
  const [supportEmail, setSupportEmail]         = useState('almarto14@gmail.com');
  const [supportPhone, setSupportPhone]         = useState('7032503603');
  const [gstin, setGstin]                       = useState('');
  const [businessAddress, setBusinessAddress]   = useState(
    'Bahadurpally, Hyderabad, Telangana – 500043\nOpposite Pista House'
  );

  // ── Social & WhatsApp ──
  const [whatsappNumber, setWhatsappNumber]     = useState('917032503603');
  const [whatsappMessage, setWhatsappMessage]   = useState('Hi! I need help with my Almarto order.');
  const [socialFacebook, setSocialFacebook]     = useState('');
  const [socialInstagram, setSocialInstagram]   = useState('');
  const [socialYoutube, setSocialYoutube]       = useState('');

  // ── Payment ──
  const [razorpayMode, setRazorpayMode]         = useState('TEST');
  const [razorpayKey, setRazorpayKey]           = useState('');
  const [codEnabled, setCodEnabled]             = useState(true);
  const [upiEnabled, setUpiEnabled]             = useState(true);

  // ── System ──
  const [maintenanceMode, setMaintenanceMode]   = useState(false);

  const [saving, setSaving]                     = useState(false);
  const [feedback, setFeedback]                 = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/content')
      .then((r) => r.json())
      .then((data) => {
        const st = data.settings || {};
        if (st.store_logo) {
          setStoreLogo(st.store_logo);
          setLogoInputUrl(st.store_logo);
        }
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('File size exceeds 3MB. Please upload an optimized image or paste an ImageKit URL.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setStoreLogo(reader.result);
          setLogoInputUrl('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
            store_logo:             storeLogo,
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
        setFeedback('Store settings and logo saved successfully! Changes are live across the site.');
        setTimeout(() => setFeedback(null), 3500);
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
      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#35109B]"
      {...props}
    />
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-gray-200/80">
        <h1 className="text-2xl font-black text-[#19152B] tracking-tight">Store Settings &amp; Branding</h1>
        <p className="text-xs text-gray-400 mt-1">
          Upload official store logo, business info, contact details, social links, WhatsApp, and payment configuration.
        </p>
      </div>

      {feedback && (
        <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center space-x-2 ${
          feedback.includes('success') || feedback.includes('saved')
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        {/* ── Official Store Logo & Branding ── */}
        <section className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#19152B] flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-[#FF7900]" />
                <span>Store Logo &amp; Official Visual Identity</span>
              </h2>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Upload or set your official store logo. It updates dynamically on header, mobile nav, footer, invoices, and login screens.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  setStoreLogo('/logo.png');
                  setLogoInputUrl('/logo.png');
                }}
                className="text-[11px] font-bold text-gray-500 hover:text-red-600 flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-red-50 transition-colors"
                title="Reset to default logo"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Default</span>
              </button>
            </div>
          </div>

          {/* Live Previews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F7F7FB] p-4 rounded-2xl border border-gray-200/70">
            {/* Light Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                  Storefront Header Preview (Light)
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                  Live Preview
                </span>
              </div>
              <div className="relative h-14 w-full bg-[#FAF6F0] border border-[#DED6C7] rounded-2xl p-2 flex items-center justify-center shadow-sm">
                <Image
                  src={storeLogo || '/logo.png'}
                  alt="Store Logo Preview"
                  fill
                  unoptimized
                  className="object-contain p-1"
                />
              </div>
            </div>

            {/* Dark Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                  Admin Console Preview (Dark)
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded">
                  Live Preview
                </span>
              </div>
              <div className="relative h-14 w-full bg-[#1A0553] border border-purple-900 rounded-2xl p-2 flex items-center justify-center shadow-sm">
                <Image
                  src={storeLogo || '/logo.png'}
                  alt="Admin Logo Preview"
                  fill
                  unoptimized
                  className="object-contain p-1"
                />
              </div>
            </div>
          </div>

          {/* Upload Inputs: File & URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* File Upload from Device */}
            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2">
              <label className="text-[11px] font-bold text-[#35109B] block flex items-center space-x-1.5">
                <Upload className="w-3.5 h-3.5 text-[#FF7900]" />
                <span>Upload Logo File from Device</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#35109B] file:text-white hover:file:bg-[#270A77] file:cursor-pointer"
              />
              <p className="text-[10px] text-gray-400">
                Supports PNG, SVG, JPG, WebP. Transparent background recommended.
              </p>
            </div>

            {/* ImageKit / Direct URL */}
            <div className="p-4 bg-orange-50/40 rounded-2xl border border-orange-100 space-y-2">
              <label className="text-[11px] font-bold text-[#FF7900] block flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Or Paste ImageKit / CDN Image URL</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={logoInputUrl}
                  onChange={(e) => {
                    setLogoInputUrl(e.target.value);
                    if (e.target.value.trim()) {
                      setStoreLogo(e.target.value.trim());
                    }
                  }}
                  placeholder="https://ik.imagekit.io/.../logo.png"
                  className="flex-1 p-2 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#FF7900]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (logoInputUrl.trim()) setStoreLogo(logoInputUrl.trim());
                  }}
                  className="px-3.5 py-1.5 bg-[#FF7900] text-white rounded-xl text-xs font-bold hover:bg-[#ea580c] transition-colors shrink-0 shadow-sm"
                >
                  Apply
                </button>
              </div>
              <p className="text-[10px] text-gray-400">
                Paste any hosted logo image URL directly from your CDN.
              </p>
            </div>
          </div>
        </section>

        {/* ── Business Info ── */}
        <section className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#19152B] flex items-center space-x-2 pb-2 border-b border-gray-100">
            <MapPin className="w-4 h-4 text-[#527863]" />
            <span>Business Information</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('Brand Name', input(storeName, setStoreName, { placeholder: 'ALMARTO' }))}
            {field('GSTIN', input(gstin, setGstin, { placeholder: '36AAACA1234M1Z5', className: 'w-full p-2.5 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#35109B]' }))}
          </div>
          {field(
            'Store Address',
            <textarea
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              rows={3}
              className="w-full p-2.5 border border-gray-200 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#35109B]"
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
            {field('Facebook URL', input(socialFacebook, setSocialFacebook, { placeholder: 'https://facebook.com/almarto' }))}
            {field('Instagram URL', input(socialInstagram, setSocialInstagram, { placeholder: 'https://instagram.com/almarto' }))}
            {field('YouTube URL', input(socialYoutube, setSocialYoutube, { placeholder: 'https://youtube.com/@almarto' }))}
          </div>
        </section>

        {/* ── Payment Configuration ── */}
        <section className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#19152B] flex items-center space-x-2 pb-2 border-b border-gray-100">
            <CreditCard className="w-4 h-4 text-[#527863]" />
            <span>Payment Gateways</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1 text-xs">Razorpay Mode</label>
              <select
                value={razorpayMode}
                onChange={(e) => setRazorpayMode(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#35109B]"
              >
                <option value="TEST">TEST Mode (Simulated)</option>
                <option value="LIVE">LIVE Mode (Real Money)</option>
              </select>
            </div>
            {field('Razorpay Key ID', input(razorpayKey, setRazorpayKey, { placeholder: 'rzp_test_...', className: 'w-full p-2.5 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#35109B]' }))}
          </div>
          <div className="pt-2 flex flex-wrap gap-6">
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={codEnabled}
                onChange={(e) => setCodEnabled(e.target.checked)}
                className="rounded text-[#35109B] focus:ring-[#35109B]"
              />
              <span>Cash on Delivery (COD)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={upiEnabled}
                onChange={(e) => setUpiEnabled(e.target.checked)}
                className="rounded text-[#35109B] focus:ring-[#35109B]"
              />
              <span>UPI / QR Payment</span>
            </label>
          </div>
        </section>

        {/* ── System ── */}
        <section className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#19152B] flex items-center space-x-2 pb-2 border-b border-gray-100">
            <Power className="w-4 h-4 text-red-500" />
            <span>System Mode</span>
          </h2>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="rounded text-red-600 focus:ring-red-500"
            />
            <div>
              <span className="text-xs font-bold text-gray-800 block">Maintenance Mode</span>
              <span className="text-[11px] text-gray-400">
                When enabled, visitors see a maintenance screen. Admins can still access /admin.
              </span>
            </div>
          </label>
        </section>

        {/* Submit button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#35109B] hover:bg-[#270A77] text-white px-8 py-3 rounded-2xl text-xs font-black flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save All Settings & Logo'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
