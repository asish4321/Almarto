'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, Sparkles, ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params.orderNumber as string;
  const { clearCart } = useCart();
  const [countdown, setCountdown] = useState(5);
  const [confetti, setConfetti] = useState(true);

  useEffect(() => {
    // Clear cart definitively
    clearCart();

    // Stop confetti after 4s
    const confettiTimer = setTimeout(() => setConfetti(false), 4000);

    // Countdown then redirect to home
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          router.replace('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(confettiTimer);
      clearInterval(interval);
    };
  }, []); // eslint-disable-line

  return (
    <>
      {/* Confetti */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
          {[...Array(32)].map((_, i) => (
            <span key={i} className="absolute rounded-sm"
              style={{
                width: `${6 + (i % 4) * 2}px`,
                height: `${6 + (i % 3) * 2}px`,
                left: `${(i * 3.3) % 100}%`,
                top: `-16px`,
                backgroundColor: ['#527863','#A3B18A','#2E4A3E','#DFE8DD','#FAF6F0','#1B2721','#ffffff'][i % 7],
                animation: `confettiFall ${1.6 + (i % 6) * 0.25}s ease-in ${(i % 8) * 0.12}s forwards`,
              }}
            />
          ))}
        </div>
      )}

      {/* Full-screen popup overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

          {/* Green header */}
          <div className="bg-gradient-to-br from-[#182922] via-[#2E4A3E] to-[#527863] px-8 py-10 text-center text-white">
            {/* Animated checkmark */}
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-2xl ring-4 ring-white/30"
              style={{ animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
              <CheckCircle2 className="text-white" strokeWidth={2} style={{ width: 52, height: 52 }} />
            </div>

            <div style={{ animation: 'slideUp 0.4s ease-out 0.1s both' }}>
              <span className="inline-flex items-center space-x-1.5 bg-[#527863]/80 text-white text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                <Sparkles className="w-3 h-3" />
                <span>Order Placed Successfully</span>
              </span>
              <h1 className="text-2xl font-black leading-tight">
                Thank you for your order! 🎉
              </h1>
              <p className="text-white/80 text-sm mt-1.5">
                Order <span className="font-black text-white bg-white/20 px-2 py-0.5 rounded-lg text-xs">{orderNumber}</span> confirmed
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="px-7 py-6 space-y-5" style={{ animation: 'slideUp 0.4s ease-out 0.2s both' }}>
            {/* What happens next */}
            <div className="bg-[#DFE8DD]/50 rounded-2xl p-4 border border-[#DFE8DD] space-y-2.5">
              {[
                { icon: '📦', text: 'Your order is being prepared' },
                { icon: '🚚', text: 'Will be shipped within 24 hours' },
                { icon: '📱', text: 'You\'ll get delivery updates on your phone' },
              ].map((s, i) => (
                <div key={i} className="flex items-center space-x-3 text-xs">
                  <span className="text-base">{s.icon}</span>
                  <span className="font-semibold text-[#1B2721]">{s.text}</span>
                </div>
              ))}
            </div>

            {/* Auto-redirect countdown */}
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-3">
                Redirecting to home in <span className="font-black text-[#2E4A3E] text-sm">{countdown}</span> seconds...
              </p>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2E4A3E] rounded-full transition-all duration-1000"
                  style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.replace(`/account/orders/${orderNumber}`)}
                className="flex-1 flex items-center justify-center space-x-2 border-2 border-[#2E4A3E] text-[#2E4A3E] hover:bg-[#DFE8DD] py-3 rounded-xl font-bold text-sm transition-all"
              >
                <Truck className="w-4 h-4" />
                <span>Track Order</span>
              </button>
              <button
                onClick={() => router.replace('/')}
                className="flex-1 flex items-center justify-center space-x-2 bg-[#2E4A3E] hover:bg-[#22382F] text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Go to Home</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(100vh) rotate(540deg) scale(0.4); opacity: 0; }
        }
        @keyframes popIn {
          0%   { transform: scale(0.3); opacity: 0; }
          65%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
