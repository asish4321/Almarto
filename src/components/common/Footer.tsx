'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, CheckCircle2, MessageCircle } from 'lucide-react';

interface FooterSettings {
  store_logo?: string;
  store_name?: string;
  support_phone: string;
  support_email: string;
  business_address: string;
  whatsapp_number: string;
  whatsapp_message: string;
  social_facebook: string;
  social_instagram: string;
  social_youtube: string;
}

const DEFAULTS: FooterSettings = {
  store_logo: '/logo.png',
  store_name: 'ALMARTO',
  support_phone: '7032503603',
  support_email: 'almarto14@gmail.com',
  business_address: 'Bahadurpally, Hyderabad, Telangana – 500043\nOpposite Pista House',
  whatsapp_number: '917032503603',
  whatsapp_message: 'Hi! I need help with my Almarto order.',
  social_facebook: '',
  social_instagram: '',
  social_youtube: '',
};

interface FooterProps {
  initialSettings?: Record<string, string>;
}

export function Footer({ initialSettings }: FooterProps = {}) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Use server-passed settings directly — no client fetch needed
  const s: FooterSettings = {
    support_phone:    initialSettings?.support_phone    || DEFAULTS.support_phone,
    support_email:    initialSettings?.support_email    || DEFAULTS.support_email,
    business_address: initialSettings?.business_address || DEFAULTS.business_address,
    whatsapp_number:  initialSettings?.whatsapp_number  || DEFAULTS.whatsapp_number,
    whatsapp_message: initialSettings?.whatsapp_message || DEFAULTS.whatsapp_message,
    social_facebook:  initialSettings?.social_facebook  || '',
    social_instagram: initialSettings?.social_instagram || '',
    social_youtube:   initialSettings?.social_youtube   || '',
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.includes('@')) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  const waUrl = `https://wa.me/${s.whatsapp_number}?text=${encodeURIComponent(s.whatsapp_message)}`;

  return (
    <>
      {/* WhatsApp floating button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-16 h-16 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110"
        aria-label="Chat on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        {/* WhatsApp SVG icon */}
        <svg viewBox="0 0 32 32" className="w-9 h-9" fill="currentColor">
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.47.643 4.788 1.768 6.805L2 30l7.418-1.74A13.93 13.93 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.44 11.44 0 01-5.84-1.6l-.418-.25-4.4 1.034 1.052-4.288-.272-.44A11.445 11.445 0 014.5 16C4.5 9.596 9.596 4.5 16 4.5S27.5 9.596 27.5 16 22.404 27.5 16 27.5zm6.29-8.47c-.345-.173-2.04-1.006-2.356-1.12-.316-.115-.546-.173-.776.173-.23.345-.89 1.12-1.09 1.35-.2.23-.4.26-.745.086-.345-.173-1.456-.536-2.773-1.71-1.025-.914-1.717-2.044-1.918-2.39-.2-.345-.022-.532.15-.704.155-.155.345-.404.518-.605.173-.202.23-.345.345-.575.115-.23.057-.432-.028-.605-.086-.173-.776-1.87-1.063-2.56-.28-.672-.565-.58-.776-.59l-.66-.012a1.264 1.264 0 00-.918.432c-.316.345-1.207 1.178-1.207 2.873 0 1.695 1.236 3.333 1.408 3.563.173.23 2.432 3.714 5.892 5.208.824.356 1.467.568 1.968.728.827.263 1.58.226 2.175.137.663-.099 2.04-.833 2.328-1.638.287-.805.287-1.495.2-1.638-.086-.144-.316-.23-.66-.402z" />
        </svg>
      </a>

      <footer className="bg-[#182922] text-[#D2DDD0] text-xs border-t border-[#DFE5DC]">
        {/* Main grid */}
        <div className="container mx-auto py-8 px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

            {/* Col 1 — Brand + newsletter */}
            <div className="col-span-2 md:col-span-1 space-y-3">
              <div className="relative h-9 w-32 bg-[#FAF6F0] border border-[#DED6C7] rounded-xl p-1 flex items-center justify-center shadow-sm">
                <Image src={s.store_logo || '/logo.png'} alt={s.store_name || "ALMARTO"} fill sizes="128px" className="object-contain" unoptimized />
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                India's Pop DIY Toy &amp; Designer Craft Universe — based in Hyderabad.
              </p>

              {/* Social icons */}
              <div className="flex items-center space-x-2 pt-1">
                {s.social_facebook && (
                  <a href={s.social_facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-[#1877F2] flex items-center justify-center transition-colors">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                    </svg>
                  </a>
                )}
                {s.social_instagram && (
                  <a href={s.social_instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#FCAF45] flex items-center justify-center transition-colors">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </a>
                )}
                {s.social_youtube && (
                  <a href={s.social_youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-[#FF0000] flex items-center justify-center transition-colors">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
                {/* WhatsApp inline icon */}
                <a href={waUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-[#25D366] flex items-center justify-center transition-colors">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M16 2C8.268 2 2 8.268 2 16c0 2.47.643 4.788 1.768 6.805L2 30l7.418-1.74A13.93 13.93 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm6.29 19.03c-.345-.173-2.04-1.006-2.356-1.12-.316-.115-.546-.173-.776.173-.23.345-.89 1.12-1.09 1.35-.2.23-.4.26-.745.086-.345-.173-1.456-.536-2.773-1.71-1.025-.914-1.717-2.044-1.918-2.39-.2-.345-.022-.532.15-.704.155-.155.345-.404.518-.605.173-.202.23-.345.345-.575.115-.23.057-.432-.028-.605-.086-.173-.776-1.87-1.063-2.56-.28-.672-.565-.58-.776-.59l-.66-.012a1.264 1.264 0 00-.918.432c-.316.345-1.207 1.178-1.207 2.873 0 1.695 1.236 3.333 1.408 3.563.173.23 2.432 3.714 5.892 5.208.824.356 1.467.568 1.968.728.827.263 1.58.226 2.175.137.663-.099 2.04-.833 2.328-1.638.287-.805.287-1.495.2-1.638-.086-.144-.316-.23-.66-.402z"/>
                  </svg>
                </a>
              </div>

              {/* Newsletter */}
              <div className="pt-1">
                {subscribed ? (
                  <div className="flex items-center space-x-1.5 text-emerald-400 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Subscribed! Use <strong>ALMARTO500</strong> for 1st order.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex">
                    <input
                      type="email" required value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Your email"
                      className="flex-1 min-w-0 px-2.5 py-1.5 text-[11px] rounded-l-lg bg-white/10 text-[#FAF7F2] placeholder-gray-500 border border-white/15 focus:outline-none focus:ring-1 focus:ring-[#527863]"
                    />
                    <button type="submit" className="bg-[#527863] hover:bg-[#3E5C4B] text-white px-3 py-1.5 text-[11px] font-bold rounded-r-lg transition-colors shrink-0">
                      Join
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Col 2 — Shop links */}
            <div>
              <h4 className="font-bold text-white text-xs mb-3 uppercase tracking-wider">Shop</h4>
              <ul className="space-y-1.5 text-[11px] text-gray-400">
                <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
                <li><Link href="/products?isDeal=true" className="hover:text-white transition-colors">Deals &amp; Offers</Link></li>
                <li><Link href="/products?isTrending=true" className="hover:text-white transition-colors">Trending Now</Link></li>
                <li><Link href="/products?isBestSeller=true" className="hover:text-white transition-colors">Best Sellers</Link></li>
                <li><Link href="/account/orders" className="hover:text-white transition-colors">Track My Order</Link></li>
                <li><Link href="/returns-policy" className="hover:text-white transition-colors">Returns Policy</Link></li>
              </ul>
            </div>

            {/* Col 3 — Company */}
            <div>
              <h4 className="font-bold text-white text-xs mb-3 uppercase tracking-wider">Company</h4>
              <ul className="space-y-1.5 text-[11px] text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/returns-policy" className="hover:text-white transition-colors">Safety Standards</Link></li>
                <li><Link href="/returns-policy" className="hover:text-white transition-colors">Terms of Use</Link></li>
              </ul>
            </div>

            {/* Col 4 — Contact */}
            <div>
              <h4 className="font-bold text-white text-xs mb-3 uppercase tracking-wider">Contact</h4>
              <div className="space-y-2 text-[11px] text-gray-400">
                <p className="leading-relaxed whitespace-pre-line">{s.business_address}</p>
                <p>
                  <a href={`tel:${s.support_phone}`} className="hover:text-white transition-colors">
                    📞 {s.support_phone}
                  </a>
                </p>
                <p>
                  <a href={`mailto:${s.support_email}`} className="hover:text-white transition-colors break-all">
                    ✉ {s.support_email}
                  </a>
                </p>
                <a href={waUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] px-2.5 py-1 rounded-lg transition-colors mt-1">
                  <MessageCircle className="w-3 h-3" />
                  <span className="font-semibold">WhatsApp Us</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
              <span className="flex items-center space-x-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>256-bit Encrypted</span>
              </span>
              <span className="hidden sm:inline text-gray-600">•</span>
              <div className="flex items-center space-x-1">
                {['UPI','Cards','NetBanking','COD'].map(m => (
                  <span key={m} className="bg-white/10 px-1.5 py-0.5 rounded text-[9px] text-white font-bold">{m}</span>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-gray-500">© 2026 ALMARTO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
