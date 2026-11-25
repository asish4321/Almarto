'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Palette, Gift, Home, Boxes, Sparkles, Smile, ArrowRight, Layers } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
}

interface CategoryBrowseProps {
  categories: CategoryItem[];
}

const CATEGORY_META: Record<string, { icon: any; color: string; badge: string; accent: string }> = {
  'paint-your-own-vinyl': {
    icon: Palette,
    color: 'from-purple-600 to-indigo-700',
    badge: 'CUSTOM ART',
    accent: '#35109B',
  },
  'diy-mystery-blind-boxes': {
    icon: Gift,
    color: 'from-amber-500 to-orange-600',
    badge: '1:72 CHASE CHANCE',
    accent: '#FF7900',
  },
  'miniature-pop-dioramas': {
    icon: Home,
    color: 'from-emerald-600 to-teal-700',
    badge: 'LED ILLUMINATED',
    accent: '#059669',
  },
  'pop-brick-mech-kits': {
    icon: Boxes,
    color: 'from-blue-600 to-cyan-700',
    badge: 'POSEABLE MECHS',
    accent: '#2563EB',
  },
  'pop-beads-craft-studio': {
    icon: Sparkles,
    color: 'from-pink-500 to-rose-600',
    badge: 'MAGIC AIR-DRY',
    accent: '#E11D48',
  },
  'sensory-fidget-diys': {
    icon: Smile,
    color: 'from-violet-600 to-purple-800',
    badge: 'GLOW IN DARK',
    accent: '#7C3AED',
  },
};

export function CategoryBrowse({ categories }: CategoryBrowseProps) {
  return (
    <section className="my-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="bg-[#2E4A3E] text-[#FAF7F2] text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
              POP DIY UNIVERSES
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1B2721] tracking-tight">
            Choose Your Craft Adventure
          </h2>
          <p className="text-xs text-[#5F6E66]">
            From blank designer vinyls to motion-lit miniature book nooks
          </p>
        </div>
        <Link
          href="/products"
          className="text-xs font-bold text-[#2E4A3E] hover:text-[#527863] flex items-center space-x-1 transition-colors"
        >
          <span>Explore All Collections</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat.slug] || {
            icon: Layers,
            color: 'from-[#2E4A3E] to-[#182922]',
            badge: 'POP DIY',
            accent: '#2E4A3E',
          };
          const IconComponent = meta.icon;

          return (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative flex flex-col justify-between p-4 bg-[#FAF6F0] rounded-2xl border border-[#DED6C7] hover:border-[#2E4A3E] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              {/* Category preview image */}
              <div className="relative w-full h-28 rounded-xl overflow-hidden bg-gray-100 mb-3 border border-gray-100 group-hover:scale-[1.03] transition-transform duration-300">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#35109B] text-white flex items-center justify-center font-bold">
                    <IconComponent className="w-8 h-8 text-white/80" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className="bg-[#19152B]/80 backdrop-blur-md text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                    {meta.badge}
                  </span>
                </div>
              </div>

              {/* Title & icon */}
              <div>
                <div className="flex items-center space-x-1.5 mb-1">
                  <IconComponent className="w-3.5 h-3.5 text-[#35109B] shrink-0" />
                  <h3 className="font-bold text-xs text-[#19152B] group-hover:text-[#35109B] transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                </div>
                {cat.description && (
                  <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-[#35109B] group-hover:text-[#FF7900] transition-colors">
                <span>Shop Universe</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
