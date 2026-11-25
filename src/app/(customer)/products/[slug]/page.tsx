'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ProductItem, ProductVariantItem } from '@/lib/types';
import { ProductCard } from '@/components/product/ProductCard';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { usePincode } from '@/context/PincodeContext';
import { useAuth } from '@/context/AuthContext';
import {
  Star,
  Heart,
  ShoppingCart,
  Zap,
  MapPin,
  Truck,
  RotateCcw,
  ShieldCheck,
  Tag,
  Check,
  ChevronRight,
  Share2,
  Info,
  Clock,
  Sparkles,
  MessageSquare,
  PackageOpen,
  Plus,
  Minus,
  Box,
} from 'lucide-react';

interface ReviewItem {
  id: string;
  rating: number;
  title?: string | null;
  comment: string;
  createdAt: string;
  user: { name: string };
  helpfulCount: number;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { pincode, pincodeInfo, checkPincode, setIsPincodeModalOpen } = usePincode();
  const { user } = useAuth();

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [similarProducts, setSimilarProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantItem | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Zoom lens state
  const [isZooming, setIsZooming] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 0, y: 0, percentX: 0, percentY: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Delivery check state
  const [pinInput, setPinInput] = useState(pincode);
  const [pinResult, setPinResult] = useState<string | null>(null);
  const [checkingPin, setCheckingPin] = useState(false);

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>([]);

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const percentX = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const percentY = Math.max(0, Math.min(100, (y / rect.height) * 100));
    setZoomCoords({ x, y, percentX, percentY });
    setIsZooming(true);
  };

  const handleImageMouseLeave = () => {
    setIsZooming(false);
  };

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
          setSimilarProducts(data.similarProducts || []);
          setReviewsList(data.product.reviews || []);
          if (data.product.variants && data.product.variants.length > 0) {
            setSelectedVariant(data.product.variants[0]);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    setPinInput(pincode);
  }, [pincode]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block w-8 h-8 border-4 border-[#35109B] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-500">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
        <p className="text-sm text-gray-500 mb-6">The product you requested might have been moved or removed.</p>
        <Link href="/products" className="bg-[#35109B] text-white px-6 py-2.5 rounded-lg font-bold text-xs">
          Browse All Products
        </Link>
      </div>
    );
  }

  const activePrice = selectedVariant ? selectedVariant.price : product.price;
  const activeMrp = selectedVariant ? selectedVariant.mrp : product.mrp;
  const activeStock = selectedVariant ? selectedVariant.stock : product.stock;
  const activeDiscount = Math.max(0, Math.round(((activeMrp - activePrice) / activeMrp) * 100));

  const images = product.images && product.images.length > 0 ? product.images : [];
  const activeImageUrl = images[selectedImageIndex]?.url || images[0]?.url || '';

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariant);
    router.push('/checkout');
  };

  const handlePinCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length !== 6) return;
    setCheckingPin(true);
    const res = await checkPincode(pinInput);
    setCheckingPin(false);
    if (res.success && res.info) {
      setPinResult(`Delivery in ${res.info.estimatedDays || 2-3} days | Free Shipping`);
    } else {
      setPinResult(res.message || 'Serviceable via Express Courier');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewMessage(null);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating: newRating,
          title: newReviewTitle,
          comment: newReviewComment,
        }),
      });
      const data = await res.json();
      if (res.ok && data.review) {
        setReviewsList([data.review, ...reviewsList]);
        setReviewMessage('Your review has been submitted successfully!');
        setTimeout(() => {
          setIsReviewModalOpen(false);
          setReviewMessage(null);
          setNewReviewTitle('');
          setNewReviewComment('');
        }, 1500);
      }
    } catch {
      setReviewMessage('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const parsedHighlights = product.highlights ? JSON.parse(product.highlights) : [];
  const parsedSpecs = product.specifications ? JSON.parse(product.specifications) : {};

  // Extract What's in the Box items
  let inTheBoxList: string[] = [];
  const inTheBoxRaw = parsedSpecs["What's in the Box"] || parsedSpecs["Included"] || parsedSpecs["Package Contents"] || parsedSpecs["inTheBox"];
  if (inTheBoxRaw) {
    if (Array.isArray(inTheBoxRaw)) {
      inTheBoxList = inTheBoxRaw;
    } else if (typeof inTheBoxRaw === 'string') {
      inTheBoxList = inTheBoxRaw.split(/\n|,|;/).map((s: string) => s.trim()).filter(Boolean);
    }
  }
  if (inTheBoxList.length === 0) {
    inTheBoxList = [
      '1x Premium Smooth Blank Vinyl Canvas Figure',
      '12x High-Density Non-Toxic Acrylic Paint Pots',
      '3x Precision Detailing Paint Brushes (Fine, Detail, Shader)',
      '1x Magnetic Studio Display Plaque & Collector Stand',
      '1x Protective Gloss Sealant Varnish Topcoat',
      '1x Step-by-Step Illustrated Creation & Mixing Guide',
    ];
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-[#35109B]">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/products?category=${product.category?.slug}`} className="hover:text-[#35109B]">
          {product.category?.name || 'Category'}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="font-semibold text-gray-800 truncate max-w-xs">{product.title}</span>
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Zoom Preview Container */}
          <div
            ref={imageContainerRef}
            onMouseMove={handleImageMouseMove}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={handleImageMouseLeave}
            className="relative w-full pt-[95%] bg-[#FDFDFD] border border-gray-100 rounded-2xl overflow-hidden group cursor-crosshair select-none"
          >
            {activeImageUrl ? (
              <Image
                src={activeImageUrl}
                alt={product.title}
                fill
                priority
                unoptimized
                className="object-contain p-6"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#F2EFFF] to-[#FFF6ED] text-center p-6">
                <PackageOpen className="w-16 h-16 text-[#35109B]/40 mb-2" />
                <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Almarto Pop DIY</span>
              </div>
            )}

            {/* Magnifier Lens on top of active image */}
            {isZooming && activeImageUrl && (
              <div
                className="absolute pointer-events-none border-2 border-[#FF7900] bg-white/20 backdrop-contrast-125 rounded-lg shadow-sm"
                style={{
                  width: 140,
                  height: 140,
                  left: Math.max(0, Math.min(zoomCoords.x - 70, (imageContainerRef.current?.clientWidth || 300) - 140)),
                  top: Math.max(0, Math.min(zoomCoords.y - 70, (imageContainerRef.current?.clientHeight || 300) - 140)),
                }}
              />
            )}

            {/* Hover Zoom Helper Badge */}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full pointer-events-none flex items-center space-x-1">
              <span>🔍 Hover to Zoom</span>
            </div>

            {activeDiscount > 0 && (
              <span className="absolute top-3 left-3 bg-[#FF7900] text-white text-xs font-black px-2.5 py-1 rounded shadow-md">
                {activeDiscount}% OFF
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product)}
              className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur rounded-full shadow-md text-gray-400 hover:text-red-500 transition-colors z-10"
              aria-label="Wishlist"
            >
              <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>

          {/* Side Zoom Preview Window (Visible on desktop when hovering) */}
          {isZooming && activeImageUrl && (
            <div className="hidden lg:block absolute left-[43%] top-6 w-[540px] h-[520px] rounded-3xl bg-white border-2 border-[#35109B] shadow-2xl overflow-hidden z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
              <div className="absolute top-3 left-3 z-10 bg-[#35109B]/95 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-[#FF7900]" />
                <span>2.8x Artisan Detail Zoom</span>
              </div>
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `url("${activeImageUrl}")`,
                  backgroundPosition: `${zoomCoords.percentX}% ${zoomCoords.percentY}%`,
                  backgroundSize: '280%',
                  backgroundRepeat: 'no-repeat',
                }}
              />
            </div>
          )}

          {/* Thumbnails (Multi-Photos Gallery) */}
          {images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 bg-gray-50 shrink-0 transition-all ${
                    idx === selectedImageIndex ? 'border-[#35109B] shadow-sm scale-105' : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img.url} alt="" fill unoptimized className="object-contain p-1" />
                </button>
              ))}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-50/70 border border-purple-100 shadow-xs">
            <span className="text-xs font-bold text-gray-700">Select Order Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold transition-colors"
                title="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-black text-xs text-[#19152B] select-none">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(activeStock || 99, q + 1))}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold transition-colors"
                title="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action Buttons (Desktop & Tablet) */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-md ${
                addedToCart
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#FF7900] hover:bg-[#ea580c] text-white'
              }`}
            >
              {addedToCart ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Added {quantity} to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add {quantity > 1 ? `(${quantity})` : ''} to Cart</span>
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 px-4 bg-[#35109B] hover:bg-[#270A77] text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-md"
            >
              <Zap className="w-5 h-5 text-[#FF7900] fill-[#FF7900]" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>

        {/* Right Column: Product Details & Purchase Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Brand, Type & Title */}
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-bold text-[#777487] uppercase tracking-wider">
                {product.brand?.name || 'ALMARTO POP STUDIO'}
              </span>
              {parsedSpecs["Product Type"] && (
                <span className="bg-[#35109B] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  {parsedSpecs["Product Type"]}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#19152B] mt-1 leading-snug">
              {product.title}
            </h1>
          </div>

          {/* Ratings & Assured Badge */}
          <div className="flex items-center space-x-3 text-xs">
            <span className="bg-emerald-600 text-white px-2 py-0.5 rounded font-bold flex items-center space-x-1">
              <span>{product.rating.toFixed(1)}</span>
              <Star className="w-3 h-3 fill-white" />
            </span>
            <span className="text-gray-500">
              {reviewsList.length} Verified Artisan Ratings &amp; Reviews
            </span>
            <span className="text-[#35109B] font-bold flex items-center space-x-1 bg-purple-50 px-2 py-0.5 rounded">
              <Check className="w-3.5 h-3.5 text-blue-600" />
              <span>ALMARTO Verified Studio Kit</span>
            </span>
          </div>

          {/* Price Box */}
          <div className="bg-[#F7F7FB] p-4 rounded-xl border border-gray-100 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-black text-[#19152B]">
              ₹{activePrice.toLocaleString('en-IN')}
            </span>
            {activeMrp > activePrice && (
              <>
                <span className="text-base text-gray-400 line-through">
                  ₹{activeMrp.toLocaleString('en-IN')}
                </span>
                <span className="text-sm font-extrabold text-[#FF7900]">
                  {activeDiscount}% Off
                </span>
              </>
            )}
            <span className="text-xs text-gray-500 w-full block">
              Inclusive of all taxes. Free shipping on this item.
            </span>
          </div>

          {/* Shipping & Studio Assurance */}
          <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 flex items-center space-x-2 text-xs text-gray-700">
            <Truck className="w-4 h-4 text-[#FF7900] shrink-0" />
            <span>
              <strong>Free Express Shipping:</strong> Fast courier dispatch across all serviceable PIN codes in India on orders above ₹499.
            </span>
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Select Option / Edition:
              </span>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                      selectedVariant?.id === v.id
                        ? 'border-[#35109B] bg-[#F2EFFF] text-[#35109B] ring-2 ring-[#35109B]/20'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span>{v.title}</span>
                    <span className="block text-[11px] text-gray-500 font-normal">
                      ₹{v.price.toLocaleString('en-IN')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Delivery & Pincode Checker */}
          <div className="pt-3 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
              Check Delivery &amp; Services
            </span>
            <form onSubmit={handlePinCheck} className="flex max-w-xs space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit PIN"
                  className="w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#35109B]"
                />
                <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              </div>
              <button
                type="submit"
                disabled={checkingPin || pinInput.length !== 6}
                className="bg-[#35109B] hover:bg-[#270A77] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
              >
                {checkingPin ? 'Checking...' : 'Check'}
              </button>
            </form>

            {pinResult && (
              <p className="text-xs font-semibold text-emerald-700 mt-2 flex items-center space-x-1.5">
                <Truck className="w-3.5 h-3.5" />
                <span>{pinResult}</span>
              </p>
            )}

            <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-600">
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-4 h-4 text-[#FF7900]" />
                <span>7 Days Replacement</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-[#FF7900]" />
                <span>Free Express Delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#FF7900]" />
                <span>{product.warrantyInfo || '100% Non-Toxic Guarantee'}</span>
              </div>
            </div>
          </div>

          {/* Seller Information */}
          <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600 flex items-center justify-between">
            <div>
              <span className="text-gray-400 block text-[10px]">Seller:</span>
              <span className="font-bold text-gray-800">{product.sellerName}</span>
            </div>
            <div className="text-right">
              <span className="text-emerald-700 font-bold block">4.9 ★ Rating</span>
              <span className="text-[10px] text-gray-400">Purchase Protected</span>
            </div>
          </div>
        </div>
      </div>

      {/* "What's Inside the Box" Section */}
      {inTheBoxList.length > 0 && (
        <div className="my-8 bg-gradient-to-r from-[#F2EFFF] via-white to-[#FFF6ED] rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-purple-200/50 gap-2 mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-[#35109B] text-white flex items-center justify-center shadow-md">
                <PackageOpen className="w-6 h-6 text-[#FF7900]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#19152B] flex items-center space-x-2">
                  <span>📦 What's Inside the Studio Box</span>
                  <span className="bg-[#FF7900] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Full Studio Set
                  </span>
                </h2>
                <p className="text-xs text-gray-500">
                  Unpack and start creating immediately — zero extra tools required!
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
              <Check className="w-3.5 h-3.5" />
              <span>100% Non-Toxic &amp; Child-Safe</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {inTheBoxList.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 p-3.5 rounded-2xl bg-white border border-purple-100 shadow-xs hover:border-[#35109B] hover:shadow-sm transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-purple-100 text-[#35109B] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3] text-[#35109B]" />
                </div>
                <span className="text-xs font-bold text-gray-800 leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specifications & Highlights Section */}
      <div className="my-8 bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[#19152B] mb-3">Product Overview &amp; Key Highlights</h2>
          <p className="text-xs text-gray-700 leading-relaxed">{product.description}</p>
        </div>

        {parsedHighlights && parsedHighlights.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-2.5">Highlights:</h3>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-gray-700">
              {parsedHighlights.map((hl: string, i: number) => (
                <li key={i}>{hl}</li>
              ))}
            </ul>
          </div>
        )}

        {Object.keys(parsedSpecs).length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3">Technical Specifications:</h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <tbody>
                  {Object.entries(parsedSpecs).map(([key, value], idx) => (
                    <tr key={key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-2.5 font-bold text-gray-700 w-1/3 border-b border-gray-100">{key}</td>
                      <td className="px-4 py-2.5 text-gray-600 border-b border-gray-100">{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Customer Ratings & Reviews Section */}
      <div className="my-8 bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#19152B]">Ratings &amp; Customer Reviews</h2>
            <div className="flex items-center space-x-3 mt-1.5">
              <span className="text-3xl font-black text-[#19152B]">{product.rating.toFixed(1)}</span>
              <div className="text-amber-500 text-lg">{'★'.repeat(Math.round(product.rating))}</div>
              <span className="text-xs text-gray-500">Based on {reviewsList.length} verified reviews</span>
            </div>
          </div>

          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="bg-[#35109B] hover:bg-[#270A77] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm flex items-center space-x-2"
          >
            <MessageSquare className="w-4 h-4 text-[#FF7900]" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Reviews List */}
        <div className="mt-6 space-y-4">
          {reviewsList.length > 0 ? (
            reviewsList.map((rev) => (
              <div key={rev.id} className="border-b border-gray-100 pb-4 text-xs">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded text-[10px]">
                    {rev.rating} ★
                  </span>
                  <span className="font-bold text-gray-800">{rev.title || 'Review'}</span>
                </div>
                <p className="text-gray-600 my-1 leading-relaxed">{rev.comment}</p>
                <div className="flex items-center space-x-2 text-[10px] text-gray-400 mt-2">
                  <span>{rev.user.name}</span>
                  <span>•</span>
                  <span>{new Date(rev.createdAt).toLocaleDateString('en-IN')}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold">Verified Purchaser</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 py-4">No reviews yet for this product. Be the first to review!</p>
          )}
        </div>
      </div>

      {/* Similar Pop DIY Products Section */}
      {similarProducts.length > 0 && (
        <section className="my-12">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-[#35109B] text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-[#FF7900]" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-black text-[#19152B]">
                  Similar Pop DIY Creations
                </h2>
                <p className="text-xs text-gray-500">
                  Creators who crafted this also explored these kits
                </p>
              </div>
            </div>
            <Link
              href={`/products?category=${product.category?.slug}`}
              className="text-xs font-bold text-[#35109B] hover:text-[#FF7900] flex items-center space-x-1"
            >
              <span>Explore Category</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-[#35109B] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Write a Customer Review</h3>
              <button onClick={() => setIsReviewModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
              {reviewMessage && (
                <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
                  {reviewMessage}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Your Star Rating</label>
                <div className="flex space-x-2 text-2xl text-amber-400 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className={star <= newRating ? 'text-amber-500' : 'text-gray-300'}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Review Headline</label>
                <input
                  type="text"
                  required
                  value={newReviewTitle}
                  onChange={(e) => setNewReviewTitle(e.target.value)}
                  placeholder="e.g. Fantastic build quality & worth every rupee!"
                  className="w-full p-2.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#35109B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Detailed Review</label>
                <textarea
                  rows={4}
                  required
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Share details about performance, durability, comfort and delivery experience..."
                  className="w-full p-2.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#35109B]"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-[#FF7900] hover:bg-[#ea580c] disabled:opacity-50 text-white font-bold text-xs px-5 py-2 rounded-lg transition-colors shadow-sm"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
