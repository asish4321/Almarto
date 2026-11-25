'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductItem } from '@/lib/types';
import { ProductCard } from '@/components/product/ProductCard';
import { Flame, Clock, ArrowRight } from 'lucide-react';

interface DealOfTheDayProps {
  products: ProductItem[];
}

// Calculate seconds remaining until next midnight
function getSecondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}

function formatCountdown(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return {
    hours: h.toString().padStart(2, '0'),
    minutes: m.toString().padStart(2, '0'),
    seconds: s.toString().padStart(2, '0'),
  };
}

export function DealOfTheDay({ products }: DealOfTheDayProps) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    // Initialize on client only to avoid hydration mismatch
    setSecondsLeft(getSecondsUntilMidnight());
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null || prev <= 0) return getSecondsUntilMidnight();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!products || products.length === 0) return null;

  const time = secondsLeft !== null ? formatCountdown(secondsLeft) : null;

  return (
    <section className="my-10 bg-gradient-to-r from-[#EFE9DF] via-[#F7F2EB] to-[#EAE2D5] p-5 sm:p-7 rounded-2xl border border-[#DED6C7] shadow-sm">
      {/* Deals Header with Countdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#DED6C7] gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#527863] text-[#FAF6F0] flex items-center justify-center shadow-md">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1B2721] tracking-tight">
              Deals of the Day
            </h2>
            <p className="text-xs text-[#5F6E66]">
              Massive discounts refreshed daily at midnight. Grab before stock ends!
            </p>
          </div>
        </div>

        {/* Live Countdown Box */}
        <div className="flex items-center space-x-2 bg-[#FAF6F0] px-4 py-2 rounded-xl shadow-sm border border-[#DED6C7] shrink-0">
          <Clock className="w-4 h-4 text-[#527863]" />
          <span className="text-xs font-bold text-[#5F6E66] uppercase tracking-wider">Ends In:</span>
          <div className="flex items-center space-x-1 font-mono text-sm font-black text-[#2E4A3E]">
            {time ? (
              <>
                <span className="bg-[#2E4A3E] text-[#FAF6F0] px-1.5 py-0.5 rounded text-xs">{time.hours}</span>
                <span>:</span>
                <span className="bg-[#2E4A3E] text-[#FAF7F2] px-1.5 py-0.5 rounded text-xs">{time.minutes}</span>
                <span>:</span>
                <span className="bg-[#527863] text-white px-1.5 py-0.5 rounded text-xs">{time.seconds}</span>
              </>
            ) : (
              <span className="text-xs text-gray-400">--:--:--</span>
            )}
          </div>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mt-6">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* View All Deals button */}
      <div className="mt-6 text-center">
        <Link
          href="/products?isDeal=true"
          className="inline-flex items-center space-x-2 bg-[#2E4A3E] hover:bg-[#22382F] text-[#FAF7F2] font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <span>Explore All Lightning Deals</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
