'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';

const AUTHORIZED_ADMIN_EMAIL = 'aswak761@gmail.com';

export default function AlmartoAdminLoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();

  // If already logged in as the authorized admin, redirect to /admin
  useEffect(() => {
    if (user && (user.email === AUTHORIZED_ADMIN_EMAIL || user.role === 'SUPER_ADMIN')) {
      router.push('/admin');
    }
  }, [user, router]);

  // Exactly 2 inputs: Email and Password
  const [email, setEmail] = useState(AUTHORIZED_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [storeLogo, setStoreLogo] = useState('/logo.png');

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.settings?.store_logo) setStoreLogo(d.settings.store_logo);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();

    // Strict validation: Only aswak761@gmail.com is allowed
    if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL) {
      setErrorMsg(`Access Denied: Only ${AUTHORIZED_ADMIN_EMAIL} is authorized to access the Admin Console.`);
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your administrator password.');
      return;
    }

    setLoading(true);
    const res = await login(cleanEmail, password);
    setLoading(false);

    if (res.success) {
      router.push('/admin');
    } else {
      setErrorMsg(res.message || 'Invalid administrator password.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0A1E] via-[#1A0E35] to-[#270E4E] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#19112F]/95 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 shadow-2xl text-white space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="relative h-12 w-48 mx-auto bg-white/10 rounded-2xl p-2 border border-white/10">
            <Image
              src={storeLogo}
              alt="ALMARTO"
              fill
              priority
              sizes="(max-width: 768px) 150px, 192px"
              className="object-contain"
              unoptimized
            />
          </div>
          <div className="inline-flex items-center space-x-1.5 bg-[#FF7900]/20 text-[#FF7900] border border-[#FF7900]/30 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mt-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>OPERATIONS &amp; MERCHANT PORTAL</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Almarto Admin Console</h1>
          <p className="text-xs text-purple-200/70">
            Authorized administrator access only
          </p>
        </div>

        {/* Security Authorized Badge */}
        <div className="p-3 bg-purple-900/40 border border-purple-500/30 rounded-2xl text-xs flex items-center justify-between text-purple-200">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-purple-300 block uppercase font-bold tracking-wider">
                Authorized Admin:
              </span>
              <strong className="text-white font-mono">{AUTHORIZED_ADMIN_EMAIL}</strong>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
            Whitelisted
          </span>
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <div className="p-3.5 bg-red-950/80 text-red-200 border border-red-500/40 rounded-2xl text-xs font-semibold flex items-start space-x-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form with ONLY 2 Input Fields: Email & Password */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Field 1: Email */}
          <div>
            <label className="block text-xs font-bold text-purple-200 mb-1.5">
              Administrator Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full pl-10 pr-3 py-3 text-xs bg-white/5 border border-purple-500/30 rounded-2xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-[#FF7900]"
                placeholder={AUTHORIZED_ADMIN_EMAIL}
              />
              <Mail className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Field 2: Password */}
          <div>
            <label className="block text-xs font-bold text-purple-200 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full pl-10 pr-3 py-3 text-xs bg-white/5 border border-purple-500/30 rounded-2xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-[#FF7900]"
                placeholder="Enter password (almarto123)"
              />
              <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#FF7900] hover:bg-[#ea580c] disabled:opacity-50 text-white rounded-2xl font-black text-xs transition-all shadow-lg flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <>
                <span>Sign In to Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Back to store */}
        <div className="pt-2 border-t border-purple-500/20 text-center">
          <Link
            href="/"
            className="text-xs text-purple-300 hover:text-white inline-flex items-center space-x-1"
          >
            <span>Return to Customer Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
