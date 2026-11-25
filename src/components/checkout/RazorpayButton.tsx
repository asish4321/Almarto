'use client';

import React, { useState } from 'react';
import { Loader2, CreditCard, ShieldCheck } from 'lucide-react';

interface RazorpayButtonProps {
  amount: number;           // in rupees
  orderNote?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  onSuccess: (paymentId: string, razorpayOrderId: string, signature: string) => void;
  onFailure?: (error: string) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RazorpayButton({
  amount,
  orderNote,
  userName,
  userEmail,
  userPhone,
  onSuccess,
  onFailure,
  disabled,
}: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> =>
    new Promise(resolve => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload  = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePay = async () => {
    setLoading(true);
    try {
      // 1. Load SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        onFailure?.('Failed to load Razorpay. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // 2. Create order on server
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, receipt: `order_${Date.now()}` }),
      });

      if (!res.ok) {
        const err = await res.json();
        onFailure?.(err.error || 'Could not initiate payment. Please try again.');
        setLoading(false);
        return;
      }

      const { orderId, amount: orderAmount } = await res.json();

      // 3. Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency: 'INR',
        name: 'ALMARTO POP DIY',
        description: orderNote || 'Order Payment',
        order_id: orderId,
        prefill: {
          name:  userName  || '',
          email: userEmail || '',
          contact: userPhone || '',
        },
        theme: { color: '#2E4A3E' },
        modal: {
          ondismiss: () => {
            setLoading(false);
            onFailure?.('Payment cancelled.');
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // 4. Verify signature server-side
          const verifyRes = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id:  response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            }),
          });

          const verify = await verifyRes.json();
          if (verify.verified) {
            onSuccess(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
          } else {
            onFailure?.('Payment verification failed. Please contact support.');
          }
          setLoading(false);
        },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.error('Razorpay error:', err);
      onFailure?.('Payment error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePay}
      disabled={disabled || loading}
      className="w-full flex items-center justify-center space-x-2 bg-[#2E4A3E] hover:bg-[#22382F] disabled:opacity-60 text-white font-black text-sm py-4 rounded-2xl shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Opening Payment...</span>
        </>
      ) : (
        <>
          <CreditCard className="w-5 h-5" />
          <span>Pay ₹{amount.toLocaleString('en-IN')} with Razorpay</span>
        </>
      )}
    </button>
  );
}
