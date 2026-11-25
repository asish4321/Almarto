'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

interface MarqueeBannerProps {
  initialSettings?: Record<string, string>;
}

export function MarqueeBanner({ initialSettings }: MarqueeBannerProps) {
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings || {});
  const [loaded, setLoaded] = useState(Boolean(initialSettings));

  useEffect(() => {
    // If not provided as props, fetch settings fresh from server
    if (!initialSettings) {
      fetch('/api/settings', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : { settings: {} }))
        .then((data) => {
          setSettings(data.settings || {});
          setLoaded(true);
        })
        .catch(() => setLoaded(true));
    }
  }, [initialSettings]);

  if (!loaded) return null;

  const enabled = settings.marquee_enabled === 'true';
  const rawText = settings.marquee_text?.trim();

  // If not enabled or no text provided by admin, do not render
  if (!enabled || !rawText) return null;

  const text = rawText;
  const theme = settings.marquee_theme || 'gradient';
  const speed = settings.marquee_speed || 'normal';
  const link = settings.marquee_link?.trim() || '/products';

  // Duration in seconds
  let duration = '25s';
  if (speed === 'fast') duration = '14s';
  if (speed === 'slow') duration = '40s';

  // Theme styling (dynamic CSS variables support active theme)
  let themeStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, var(--primary-hover, #22382F), var(--primary-color, #2E4A3E), var(--accent-color, #527863))',
    color: '#FAF7F2',
  };
  let badgeClass = 'bg-white/20 text-[#FAF7F2] border-white/30';
  let linkBadgeClass = 'bg-white text-[#1B2721] hover:bg-[#E8EFE6]';

  if (theme === 'orange') {
    themeStyle = {
      backgroundColor: 'var(--accent-color, #527863)',
      color: '#FAF7F2',
    };
    badgeClass = 'bg-black/20 text-[#FAF7F2] border-white/20';
    linkBadgeClass = 'bg-[#FAF7F2] text-[#2E4A3E] hover:bg-white';
  } else if (theme === 'purple') {
    themeStyle = {
      backgroundColor: 'var(--primary-color, #2E4A3E)',
      color: '#FAF7F2',
    };
    badgeClass = 'bg-white/20 text-[#FAF7F2] border-white/30';
    linkBadgeClass = 'bg-[#FAF7F2] text-[#2E4A3E] hover:bg-white';
  } else if (theme === 'dark') {
    themeStyle = {
      backgroundColor: '#182922',
      color: '#D2DDD0',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
    };
    badgeClass = 'bg-[#527863]/30 text-[#A3B18A] border-[#527863]/40';
    linkBadgeClass = 'bg-[#527863] text-[#FAF7F2] hover:bg-[#3E5C4B]';
  }

  // Split text items by bullet/separator if present for visual rhythm, or single phrase
  const items = text.includes('•')
    ? text.split('•').map((item) => item.trim()).filter(Boolean)
    : [text];

  const renderContent = () => (
    <div className="flex items-center space-x-8 px-6 shrink-0 font-medium text-xs tracking-wide">
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center space-x-2 shrink-0">
          <Sparkles className="w-3.5 h-3.5 shrink-0 opacity-80" />
          <span className="font-semibold">{item}</span>
        </span>
      ))}
      {link && (
        <span className={`inline-flex items-center space-x-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full transition-all shrink-0 ${linkBadgeClass}`}>
          <span>Shop Now</span>
          <ArrowRight className="w-3 h-3" />
        </span>
      )}
    </div>
  );

  const bannerContent = (
    <div
      className="relative overflow-hidden py-2 px-3 flex items-center select-none cursor-pointer transition-colors duration-200"
      style={{ ['--marquee-duration' as any]: duration, ...themeStyle }}
      title={link ? `Click to view: ${link}` : undefined}
    >
      {/* Floating Left Tag */}
      <div className="hidden sm:flex items-center space-x-1.5 shrink-0 pl-2 pr-3 z-10">
        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border backdrop-blur-sm ${badgeClass}`}>
          ⚡ Live Ticker
        </span>
      </div>

      {/* Marquee Track: duplicated 4 times for 100% gapless infinite loop on all screen sizes */}
      <div className="relative flex-1 overflow-hidden">
        <div className="animate-marquee flex items-center">
          {renderContent()}
          {renderContent()}
          {renderContent()}
          {renderContent()}
        </div>
      </div>
    </div>
  );

  if (link) {
    return (
      <Link href={link} className="block group">
        {bannerContent}
      </Link>
    );
  }

  return bannerContent;
}
