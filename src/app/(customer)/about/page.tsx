import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Truck, Headphones, RotateCcw, Palette, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-10">
      <div className="text-center space-y-3">
        <div className="relative h-12 w-48 mx-auto mb-2">
          <Image src="/logo.png" alt="ALMARTO POP DIY" fill priority sizes="192px" className="object-contain" />
        </div>
        <h1 className="text-3xl font-black text-[#19152B]">About ALMARTO POP DIY</h1>
        <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
          India&apos;s premier Pop DIY Toy &amp; Designer Craft Universe, empowering creators, collectors, and hobbyists of all ages with high-grade customizable art toys, blind boxes, and miniature dioramas.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm space-y-6 text-xs text-gray-700 leading-relaxed">
        <h2 className="text-lg font-bold text-[#19152B] flex items-center space-x-2">
          <Palette className="w-5 h-5 text-[#35109B]" />
          <span>Our Vision &amp; Mission</span>
        </h2>
        <p>
          Founded in Hyderabad, ALMARTO was born out of a deep passion for hands-on creativity in an increasingly screen-dominated world. We believe that true art toy collecting is 10x more thrilling when you build, paint, and customize it yourself. From blank matte designer vinyls and secret mystery blind boxes to infrared motion-sensing Tokyo alley book nooks, we design and deliver kits where every tool, brush, pigment, and accessory is meticulously provided inside the box.
        </p>

        <h2 className="text-lg font-bold text-[#19152B] pt-4 border-t flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-[#FF7900]" />
          <span>The ALMARTO Creator Promise</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start space-x-3">
            <ShieldCheck className="w-6 h-6 text-[#35109B] shrink-0" />
            <div>
              <span className="font-bold text-sm text-[#19152B] block">100% Non-Toxic &amp; Safe</span>
              <p className="text-gray-500 mt-1">BPA-free eco vinyls, child-safe acrylic pigments, and certified odorless air-dry magic clay.</p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start space-x-3">
            <RotateCcw className="w-6 h-6 text-[#FF7900] shrink-0" />
            <div>
              <span className="font-bold text-sm text-[#19152B] block">Missing Parts Replacement</span>
              <p className="text-gray-500 mt-1">Lost a brick or miniature diorama piece during build? We courier replacements instantly for free.</p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start space-x-3">
            <Truck className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-sm text-[#19152B] block">Pan-India Express Delivery</span>
              <p className="text-gray-500 mt-1">Rapid, secure delivery to 19,000+ PIN codes with live real-time AWB courier tracking.</p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start space-x-3">
            <Headphones className="w-6 h-6 text-[#35109B] shrink-0" />
            <div>
              <span className="font-bold text-sm text-[#19152B] block">24/7 Toy Master Helpline</span>
              <p className="text-gray-500 mt-1">Need tips on paint thinning, wiring LEDs, or fluid pouring? Our master makers are here to help.</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t flex justify-center">
          <Link
            href="/products"
            className="bg-[#35109B] hover:bg-[#270A77] text-white px-8 py-3 rounded-xl font-bold text-xs shadow-md transition-colors"
          >
            Explore the Pop DIY Toy Universe →
          </Link>
        </div>
      </div>
    </div>
  );
}
