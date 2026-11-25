'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Gift } from 'lucide-react';

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  buttonText?: string | null;
  position?: string;
  displayOrder?: number;
}

interface HeroCarouselProps {
  banners?: BannerItem[];
  bgImage?: string | null;
}

// ── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 45, startDelay = 400) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const delay = setTimeout(() => {
      const timer = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(timer);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(timer);
    }, startDelay);
    return () => clearTimeout(delay);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

// ── Cursor blink component ───────────────────────────────────────────────────
function Cursor({ visible }: { visible: boolean }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setOn(p => !p), 530);
    return () => clearInterval(t);
  }, [visible]);
  if (!visible) return null;
  return (
    <span
      className="inline-block w-[3px] h-[1em] align-middle ml-0.5 rounded-sm"
      style={{
        backgroundColor: 'var(--accent-color, #8DA38A)',
        opacity: on ? 1 : 0,
        transition: 'opacity 0.1s',
      }}
    />
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export function HeroCarousel({ banners = [], bgImage }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadedBgImage, setLoadedBgImage] = useState<string | null>(bgImage || null);
  const hasBanners = banners && banners.length > 0;

  // Lazy-fetch bg image if not passed (it's 2.85MB so loaded after page renders)
  useEffect(() => {
    if (bgImage || hasBanners || loadedBgImage) return;
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.settings?.hero_bg_image) {
          setLoadedBgImage(data.settings.hero_bg_image);
        }
      })
      .catch(() => {});
  }, [bgImage, hasBanners, loadedBgImage]);

  // Full sentence typewriter — entire line animates
  const fullText = 'Turn Blank Toy Canvases into Desk Legends';
  const { displayed, done } = useTypewriter(fullText, 50, 400);

  // Split at the colour boundary — first part white, last two words accent
  const splitAt = fullText.indexOf('Desk Legends');
  const whitePart = displayed.slice(0, Math.min(displayed.length, splitAt));
  const accentPart = displayed.length > splitAt ? displayed.slice(splitAt) : '';

  const activeBg = loadedBgImage;

  useEffect(() => {
    if (!hasBanners || banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [hasBanners, banners.length]);

  // ── Banner carousel (admin images) ────────────────────────────────────────
  if (hasBanners) {
    return (
      <div className="relative w-full h-[200px] sm:h-[340px] md:h-[480px] overflow-hidden rounded-2xl shadow-lg bg-[#182922] group">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {(index === currentSlide || index < currentSlide || index === currentSlide + 1) && (
              <Image
                src={banner.imageUrl}
                alt={banner.title || 'ALMARTO Hero Banner'}
                fill sizes="100vw"
                priority={index === 0}
                className="object-cover object-center"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#182922]/95 via-[#2E4A3E]/85 to-black/30" />

            <div className="relative h-full container mx-auto px-4 sm:px-12 flex flex-col justify-center max-w-2xl text-[#FAF7F2]">
              <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                <span className="inline-flex items-center space-x-1 bg-[#527863] text-[#FAF7F2] text-[9px] sm:text-[11px] font-black uppercase tracking-widest px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" />
                  <span>POP DIY DROP</span>
                </span>
              </div>
              <h1 className="text-lg sm:text-4xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
                {banner.title}
              </h1>
              {banner.subtitle && (
                <p className="mt-2 text-[11px] sm:text-sm md:text-base text-[#D2DDD0] hidden sm:block line-clamp-2 leading-relaxed drop-shadow">
                  {banner.subtitle}
                </p>
              )}
              <div className="mt-3 sm:mt-6 flex flex-wrap items-center gap-2">
                <Link
                  href={banner.linkUrl || '/products'}
                  className="inline-flex items-center space-x-1.5 bg-[#2E4A3E] hover:bg-[#22382F] text-[#FAF7F2] text-[11px] sm:text-sm font-extrabold px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg transition-all"
                >
                  <span>{banner.buttonText || 'Shop Now'}</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
                <Link
                  href="/products"
                  className="hidden sm:inline-flex items-center space-x-2 bg-white/15 hover:bg-white/25 text-[#FAF7F2] text-xs sm:text-sm font-bold px-5 py-3 rounded-xl backdrop-blur-sm transition-colors border border-white/20"
                >
                  <span>Explore All</span>
                </Link>
              </div>
            </div>
          </div>
        ))}

        {banners.length > 1 && (
          <>
            <button onClick={() => setCurrentSlide(p => p === 0 ? banners.length - 1 : p - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md"
              aria-label="Previous slide">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setCurrentSlide(p => (p + 1) % banners.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md"
              aria-label="Next slide">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
              {banners.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-[#8DA38A]' : 'w-2 bg-white/50 hover:bg-white'}`}
                  aria-label={`Go to slide ${idx + 1}`} />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Default branded hero (no admin banners) ────────────────────────────────
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl shadow-lg text-white border border-white/10"
      style={{
        background: activeBg
          ? undefined
          : 'linear-gradient(135deg, var(--primary-hover, #22382F) 0%, var(--primary-color, #2E4A3E) 60%, var(--accent-color, #527863) 100%)',
      }}
    >
      {activeBg && (
        <>
          <Image src={activeBg} alt="Hero Background" fill priority sizes="100vw" className="object-cover object-center z-0" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30 z-0" />
        </>
      )}

      {/* Ambient glow — desktop only */}
      <div className="hidden md:block absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── Mobile ── */}
      <div className="relative z-10 md:hidden px-5 py-5 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <span
            className="inline-flex items-center space-x-1 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-2"
            style={{ backgroundColor: 'var(--accent-color, #527863)' }}
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>POP DIY STORE</span>
          </span>
          {/* Typewriter on mobile too — shorter text */}
          <h1 className="text-lg font-black leading-tight text-white min-h-[2.5em]">
            <span className="text-white">{whitePart.length > 0 ? whitePart : ''}</span>
            <span style={{ color: 'var(--accent-color, #A3B18A)' }}>{accentPart}</span>
            <Cursor visible={!done} />
          </h1>
          <p className="text-[11px] text-white/75 mt-1 leading-relaxed line-clamp-2">
            Blank vinyls, blind boxes &amp; miniature dioramas — delivered across India.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Link href="/products"
              className="inline-flex items-center space-x-1 text-[#FAF7F2] text-[11px] font-black px-4 py-2 rounded-xl shadow transition-all"
              style={{ backgroundColor: 'var(--primary-color, #2E4A3E)' }}>
              <span>Shop Now</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link href="/products?isDeal=true"
              className="inline-flex items-center space-x-1 bg-white/15 text-white text-[11px] font-bold px-3 py-2 rounded-xl border border-white/20">
              <Gift className="w-3 h-3 text-[#A3B18A]" />
              <span>Deals</span>
            </Link>
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-center gap-1.5 text-[9px] text-white/70 font-bold">
          <span className="bg-white/10 px-2 py-1 rounded-lg text-center leading-tight">🌿 Non-Toxic</span>
          <span className="bg-white/10 px-2 py-1 rounded-lg text-center leading-tight">🚚 Free Ship</span>
          <span className="bg-white/10 px-2 py-1 rounded-lg text-center leading-tight">🔧 Warranty</span>
        </div>
      </div>

      {/* ── Desktop ── */}
      <div className="relative z-10 hidden md:block p-12 lg:p-16 max-w-3xl space-y-5">
        <div
          className="inline-flex items-center space-x-2 text-white text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md"
          style={{ backgroundColor: 'var(--accent-color, #527863)' }}
        >
          <Sparkles className="w-3.5 h-3.5 fill-white" />
          <span>OFFICIAL POP DIY CREATOR HUB</span>
        </div>

        {/* Typewriter headline — full line animates, last 2 words in accent colour */}
        <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-tight min-h-[2.5em]">
          <span className="text-white">{whitePart}</span>
          <span style={{ color: 'var(--accent-color, #8DA38A)' }}>{accentPart}</span>
          <Cursor visible={!done} />
        </h1>

        <p className="text-base text-white/90 max-w-2xl leading-relaxed drop-shadow-sm">
          Unbox sealed studio kits with primer-ready matte vinyl figures, modular snap-fit mechs, and motion-sensing illuminated miniature book nooks. Zero prior artistic skill required.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-3">
          <Link href="/products"
            className="inline-flex items-center space-x-2 text-[#FAF7F2] text-sm font-black px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 hover:opacity-95"
            style={{ backgroundColor: 'var(--primary-color, #2E4A3E)' }}>
            <span>Explore All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/products?isTrending=true"
            className="inline-flex items-center space-x-2 bg-white/15 hover:bg-white/25 text-white text-sm font-bold px-5 py-3.5 rounded-xl backdrop-blur-md transition-colors border border-white/20">
            <Sparkles className="w-4 h-4 text-[#A3B18A]" />
            <span>Trending Collections</span>
          </Link>
          <Link href="/products?isDeal=true"
            className="inline-flex items-center space-x-2 bg-white/15 hover:bg-white/25 text-white text-sm font-bold px-5 py-3.5 rounded-xl backdrop-blur-md transition-colors border border-white/20">
            <Gift className="w-4 h-4 text-[#A3B18A]" />
            <span>Exclusive Deals</span>
          </Link>
        </div>

        <div className="pt-6 border-t border-white/15 grid grid-cols-3 gap-4 max-w-lg text-[11px] text-white/80">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--accent-color, #8DA38A)' }} />
            <span className="font-bold">100% Non-Toxic</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="font-bold">Part Warranty</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-300" />
            <span className="font-bold">Free Shipping ₹499+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
