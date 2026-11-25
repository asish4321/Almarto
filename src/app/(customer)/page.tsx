import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { DealOfTheDay } from '@/components/home/DealOfTheDay';
import { ProductCard } from '@/components/product/ProductCard';
import {
  TrendingUp,
  Award,
  ChevronRight,
  ShieldCheck,
  Truck,
  HeartHandshake,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { getHomeCache, setHomeCache, CACHE_TTL } from '@/lib/siteCache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function fetchHomeData() {
  // Run only 3 parallel queries instead of 6 — combine product flags with OR
  const [allProducts, banners] = await Promise.all([
    prisma.product.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true, title: true, slug: true, price: true, mrp: true,
        discountPercent: true, stock: true, rating: true, reviewCount: true,
        isDealOfTheDay: true, isTrending: true, isBestSeller: true,
        status: true, createdAt: true,
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        images: { select: { id: true, url: true, isPrimary: true }, take: 1 },
        variants: { select: { id: true, title: true, price: true, mrp: true, stock: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 40,
    }),
    prisma.banner.findMany({
      where: { isActive: true, position: 'HERO' },
      select: { id: true, title: true, subtitle: true, imageUrl: true, linkUrl: true, buttonText: true, displayOrder: true },
      orderBy: { displayOrder: 'asc' },
    }),
  ]);

  return {
    dealProducts:       allProducts.filter(p => p.isDealOfTheDay).slice(0, 8),
    trendingProducts:   allProducts.filter(p => p.isTrending).slice(0, 8),
    bestSellerProducts: allProducts.filter(p => p.isBestSeller).slice(0, 8),
    latestProducts:     allProducts.slice(0, 8),
    heroBanners:        banners,
    heroBgValue:        null, // hero_bg_image is 2.85MB — skip it to keep page fast
  };
}

const getHomeData = async () => {
  const cached = getHomeCache();
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }
  try {
    const data = await Promise.race([
      fetchHomeData(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('home timeout')), 10000)
      ),
    ]);
    setHomeCache(data);
    return data;
  } catch (e) {
    console.error('Home data fetch error:', e);
    if (cached) return cached.data;
    return {
      dealProducts: [] as any[], trendingProducts: [] as any[],
      bestSellerProducts: [] as any[], latestProducts: [] as any[],
      heroBanners: [] as any[], heroBgValue: null as string | null,
    };
  }
};

export default async function HomePage() {
  const { dealProducts, trendingProducts, bestSellerProducts, latestProducts, heroBanners, heroBgValue } =
    await getHomeData();

  const displayTrending = trendingProducts.length > 0 ? trendingProducts : latestProducts;
  const hasAnyProducts = latestProducts.length > 0;

  return (
    <div className="container mx-auto px-4 py-6 space-y-10">
      {/* 1. Hero Carousel with Admin Background Image Support */}
      <HeroCarousel banners={heroBanners} bgImage={heroBgValue} />

      {/* 2. Deals of the Day (if deal products exist) */}
      {dealProducts.length > 0 && <DealOfTheDay products={dealProducts} />}

      {/* 3. Products Section */}
      {hasAnyProducts ? (
        <section className="my-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-[#2E4A3E] text-[#FAF7F2] flex items-center justify-center shadow-sm">
                <TrendingUp className="w-4 h-4 text-[#A3B18A]" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-black text-[#1B2721]">
                  Featured Products
                </h2>
                <p className="text-xs text-[#5F6E66]">
                  Quality products available with fast &amp; secure delivery
                </p>
              </div>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-[#2E4A3E] hover:text-[#527863] flex items-center space-x-1"
            >
              <span>View All Products</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {displayTrending.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : (
        /* Customer-Facing Empty State */
        <section className="bg-[#FAF6F0] rounded-3xl p-8 sm:p-12 text-center border border-[#DED6C7] shadow-sm max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-[#DFE8DD] text-[#2E4A3E] flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-[#527863]" />
          </div>
          <h3 className="text-xl font-black text-[#1B2721]">Store Catalog Updating Soon</h3>
          <p className="text-xs text-[#5F6E66] mt-2 leading-relaxed max-w-lg mx-auto">
            New products and collections will appear here once published by store administrators.
          </p>
        </section>
      )}

      {/* 4. Best Sellers (if any marked) */}
      {bestSellerProducts.length > 0 && (
        <section className="my-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-[#2E4A3E] text-[#FAF7F2] flex items-center justify-center shadow-sm">
                <Award className="w-4 h-4 text-[#A3B18A]" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-black text-[#1B2721]">
                  Best Sellers
                </h2>
                <p className="text-xs text-[#5F6E66]">
                  Most popular and highly-rated items
                </p>
              </div>
            </div>
            <Link
              href="/products?isBestSeller=true"
              className="text-xs font-bold text-[#2E4A3E] hover:text-[#527863] flex items-center space-x-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {bestSellerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 6. The ALMARTO Storefront Promise */}
      <section className="cv-auto bg-gradient-to-r from-[#182922] to-[#2E4A3E] text-[#FAF7F2] rounded-3xl p-6 sm:p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6 text-[#A3B18A]" />
            </div>
            <h4 className="font-bold text-sm text-[#FAF7F2]">100% Quality Assured</h4>
            <p className="text-xs text-[#D2DDD0] mt-1">Verified authentic merchandise</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3">
              <HeartHandshake className="w-6 h-6 text-[#A3B18A]" />
            </div>
            <h4 className="font-bold text-sm text-[#FAF7F2]">Satisfaction Guarantee</h4>
            <p className="text-xs text-[#D2DDD0] mt-1">Prompt customer support &amp; easy returns</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3">
              <Truck className="w-6 h-6 text-[#A3B18A]" />
            </div>
            <h4 className="font-bold text-sm text-[#FAF7F2]">Express Delivery</h4>
            <p className="text-xs text-[#D2DDD0] mt-1">Free shipping on orders above ₹499</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-[#A3B18A]" />
            </div>
            <h4 className="font-bold text-sm text-[#FAF7F2]">Direct Sourcing</h4>
            <p className="text-xs text-[#D2DDD0] mt-1">Sourced from top manufacturers</p>
          </div>
        </div>
      </section>
    </div>
  );
}
