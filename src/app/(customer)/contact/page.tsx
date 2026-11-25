'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle2, Send, MessageCircle } from 'lucide-react';

interface ContactSettings {
  support_phone: string;
  support_email: string;
  business_address: string;
  whatsapp_number: string;
  whatsapp_message: string;
}

const DEFAULTS: ContactSettings = {
  support_phone: '7032503603',
  support_email: 'almarto14@gmail.com',
  business_address: 'Bahadurpally, Hyderabad, Telangana – 500043\nOpposite Pista House',
  whatsapp_number: '917032503603',
  whatsapp_message: 'Hi! I need help with my Almarto order.',
};

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  // Use hardcoded defaults — settings are already available via admin panel
  // Avoids an extra DB round-trip on page load
  const s: ContactSettings = DEFAULTS;

  const waUrl = `https://wa.me/${s.whatsapp_number}?text=${encodeURIComponent(s.whatsapp_message)}`;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#19152B]">Contact ALMARTO</h1>
        <p className="text-xs text-gray-500 mt-1">
          We're here to help with orders, returns, delivery updates, and anything else.
        </p>
      </div>

      {/* Contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Phone */}
        <a
          href={`tel:${s.support_phone}`}
          className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-1.5 text-xs hover:border-[#527863] transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-[#DFE8DD] flex items-center justify-center mb-2">
            <Phone className="w-5 h-5 text-[#2E4A3E]" />
          </div>
          <h3 className="font-bold text-sm text-[#19152B]">Call Us</h3>
          <p className="text-[#2E4A3E] font-bold">{s.support_phone}</p>
          <span className="text-[11px] text-gray-400">Available 9 AM – 9 PM</span>
        </a>

        {/* Email */}
        <a
          href={`mailto:${s.support_email}`}
          className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-1.5 text-xs hover:border-[#527863] transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-[#DFE8DD] flex items-center justify-center mb-2">
            <Mail className="w-5 h-5 text-[#2E4A3E]" />
          </div>
          <h3 className="font-bold text-sm text-[#19152B]">Email Us</h3>
          <p className="text-[#2E4A3E] font-bold break-all">{s.support_email}</p>
          <span className="text-[11px] text-gray-400">Reply within 2–4 hours</span>
        </a>

        {/* Address */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-1.5 text-xs">
          <div className="w-9 h-9 rounded-xl bg-[#DFE8DD] flex items-center justify-center mb-2">
            <MapPin className="w-5 h-5 text-[#2E4A3E]" />
          </div>
          <h3 className="font-bold text-sm text-[#19152B]">Our Location</h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{s.business_address}</p>
        </div>
      </div>

      {/* WhatsApp CTA */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#1a9e4e] px-5 py-4 rounded-2xl transition-colors"
      >
        <div className="w-10 h-10 bg-[#25D366] rounded-xl flex items-center justify-center shrink-0">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm">Chat on WhatsApp</p>
          <p className="text-xs text-gray-500">Fastest response — usually within minutes</p>
        </div>
      </a>

      {/* Contact form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm">
        <h2 className="text-base font-bold text-[#19152B] mb-4">Send a Message</h2>
        {submitted ? (
          <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Thank you! We'll get back to you at <strong>{s.support_email}</strong> shortly.</span>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Your Name</label>
                <input type="text" required placeholder="Full Name" className="w-full p-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#527863]" />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                <input type="email" required placeholder="yourname@example.com" className="w-full p-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#527863]" />
              </div>
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Order ID (optional)</label>
              <input type="text" placeholder="e.g. ALM-2026-1001" className="w-full p-2.5 border rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#527863]" />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Subject</label>
              <input type="text" required placeholder="Question about my order / return" className="w-full p-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#527863]" />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Message</label>
              <textarea rows={4} required placeholder="Describe your query..." className="w-full p-2.5 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#527863]" />
            </div>
            <button
              type="submit"
              className="bg-[#2E4A3E] hover:bg-[#22382F] text-white px-6 py-2.5 rounded-xl font-bold transition-colors flex items-center space-x-1.5 shadow"
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
