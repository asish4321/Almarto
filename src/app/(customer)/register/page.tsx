'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithGoogle, sendOtp, verifyOtp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [googleSetupUrl, setGoogleSetupUrl] = useState<string | null>(null);

  // OTP Verification state
  const [otpStep, setOtpStep] = useState<'FORM' | 'CODE'>('FORM');
  const [otpCode, setOtpCode] = useState('');

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);
    setGoogleSetupUrl(null);
    const res = await loginWithGoogle();
    if (!res.success) {
      setGoogleLoading(false);
      if (res.setupUrl) {
        setGoogleSetupUrl(res.setupUrl);
      } else {
        setErrorMsg(res.message || 'Google sign-up could not be completed.');
      }
    }
  };

  // Step 1: Send verification code to email
  const handleInitiateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    const res = await sendOtp(email, name, phone);
    setLoading(false);

    if (res.success) {
      setOtpStep('CODE');
      setInfoMsg(`A 6-digit verification code has been sent to ${email}. Please check your email inbox.`);
    } else {
      setErrorMsg(res.message || 'Failed to send verification code.');
    }
  };

  // Step 2: Verify code & complete registration
  const handleVerifyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await verifyOtp(email, otpCode.trim(), name);
    setLoading(false);

    if (res.success) {
      router.push('/');
    } else {
      setErrorMsg(res.message || 'Invalid verification code. Please check and try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="relative h-12 w-44 mx-auto">
            <Image
              src="/logo.png"
              alt="ALMARTO"
              fill
              priority
              sizes="(max-width: 768px) 150px, 176px"
              className="object-contain"
            />
          </div>
          <h1 className="text-xl font-bold text-[#19152B]">Create an ALMARTO Account</h1>
          <p className="text-xs text-gray-500">
            Sign up and receive 100 bonus SuperCoins immediately!
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="p-3.5 bg-purple-50 text-purple-900 border border-purple-200 rounded-xl text-xs font-semibold flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#35109B] mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {googleSetupUrl && (
          <div className="p-4 bg-purple-50 text-purple-900 border border-purple-200 rounded-2xl text-xs space-y-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-[#35109B] shrink-0" />
              <span className="font-bold text-sm">Supabase Google Provider Setup</span>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">
              Google Sign-In is not enabled yet in your Supabase project (<strong>mnftlaxcqpwpylswkkjm</strong>).
            </p>
            <ol className="list-decimal list-inside text-[11px] text-gray-600 space-y-1 pl-1">
              <li>Open Supabase Dashboard: <strong>Authentication → Providers → Google</strong></li>
              <li>Toggle <strong>&quot;Enable Google provider&quot;</strong> to ON</li>
              <li>Add your Google OAuth Client ID &amp; Secret</li>
            </ol>
            <div className="pt-2">
              <a
                href={googleSetupUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 bg-[#35109B] text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-[#270A77] transition-colors shadow-sm"
              >
                <span>Open Supabase Providers Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Continue with Google */}
        {otpStep === 'FORM' && (
          <>
            <div>
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={googleLoading || loading}
                className="w-full py-3 px-4 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 border border-gray-300 rounded-xl font-bold text-xs transition-all shadow-sm hover:shadow flex items-center justify-center space-x-3 disabled:opacity-60"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 text-[#35109B] animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider absolute">
                or register with email verification
              </span>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleInitiateRegister} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Your Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aswak"
                    className="w-full pl-10 pr-3 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#35109B]"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. aswak761@gmail.com"
                    className="w-full pl-10 pr-3 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#35109B]"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mobile Number (Optional)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9123456789"
                    className="w-full pl-10 pr-3 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#35109B]"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full py-3 bg-[#FF7900] hover:bg-[#ea580c] disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center space-x-1.5 transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Send Verification Code &amp; Register</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {/* Step 2: Code verification */}
        {otpStep === 'CODE' && (
          <form onSubmit={handleVerifyRegister} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-700">
                  6-Digit Verification Code
                </label>
                <button
                  type="button"
                  onClick={() => setOtpStep('FORM')}
                  className="text-[11px] text-[#35109B] hover:underline"
                >
                  Edit Details
                </button>
              </div>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full py-3 text-center text-lg font-mono tracking-widest font-black border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#35109B]"
              />
              <p className="text-[11px] text-gray-500 text-center mt-1">
                Enter the 6-digit code sent to <strong>{email}</strong>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#35109B] hover:bg-[#270A77] disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center space-x-1.5 transform hover:-translate-y-0.5"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Code &amp; Create Account</span>
                </>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleInitiateRegister}
                disabled={loading}
                className="text-xs font-semibold text-gray-500 hover:text-[#FF7900] underline"
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-[#35109B] hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
