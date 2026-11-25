'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Zap,
  SlidersHorizontal,
  Flame,
  Palette,
  Eye,
  Radio,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface BannerData {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  buttonText?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export default function AdminContentPage() {
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [loading, setLoading] = useState(true);

  // Marquee Section Settings
  const [marqueeEnabled, setMarqueeEnabled] = useState(true);
  const [marqueeText, setMarqueeText] = useState(
    '🎨 POP DIY CRAFT REVOLUTION: Flat ₹150 OFF on all Paint-Your-Own Vinyls & Book Nooks • 📦 Free Express Delivery Across India on orders above ₹499 • ⚡ 100% Non-Toxic Studio Certified • 🎁 Exclusive Surprise Mystery Bag with every order!'
  );
  const [marqueeTheme, setMarqueeTheme] = useState('gradient');
  const [marqueeSpeed, setMarqueeSpeed] = useState('normal');
  const [marqueeLink, setMarqueeLink] = useState('/products');
  const [marqueeSaving, setMarqueeSaving] = useState(false);

  // Hero Background Image Settings ("Turn Blank Toy Canvases into Desk Legends")
  const [heroBgImage, setHeroBgImage] = useState('');
  const [heroBgSaving, setHeroBgSaving] = useState(false);

  // Add banner modal & form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('/products');
  const [buttonText, setButtonText] = useState('Shop Now');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content');
      if (res.ok) {
        const data = await res.json();
        setBanners(data.banners || []);
        if (data.settings) {
          if (data.settings.marquee_enabled !== undefined) {
            setMarqueeEnabled(data.settings.marquee_enabled === 'true');
          }
          if (data.settings.marquee_text) {
            setMarqueeText(data.settings.marquee_text);
          }
          if (data.settings.marquee_theme) {
            setMarqueeTheme(data.settings.marquee_theme);
          }
          if (data.settings.marquee_speed) {
            setMarqueeSpeed(data.settings.marquee_speed);
          }
          if (data.settings.marquee_link) {
            setMarqueeLink(data.settings.marquee_link);
          }
          if (data.settings.hero_bg_image) {
            setHeroBgImage(data.settings.hero_bg_image);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeroBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setHeroBgImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveHeroBg = async (imageToSave = heroBgImage) => {
    setHeroBgSaving(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_SETTINGS',
          settingsData: {
            hero_bg_image: imageToSave,
          },
        }),
      });
      if (res.ok) {
        setFeedback(
          imageToSave
            ? '✨ Hero Section background image updated and saved to Supabase!'
            : '🔄 Hero Section reset to default gradient background.'
        );
        setTimeout(() => setFeedback(null), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHeroBgSaving(false);
    }
  };

  const handleRemoveHeroBg = async () => {
    setHeroBgImage('');
    await handleSaveHeroBg('');
  };

  const handleSaveMarquee = async () => {
    setMarqueeSaving(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_SETTINGS',
          settingsData: {
            marquee_enabled: String(marqueeEnabled),
            marquee_text: marqueeText,
            marquee_theme: marqueeTheme,
            marquee_speed: marqueeSpeed,
            marquee_link: marqueeLink,
          },
        }),
      });
      if (res.ok) {
        setFeedback(
          marqueeEnabled
            ? '⚡ Marquee Section published live to the main website!'
            : '⏸️ Marquee Section is now paused/hidden from the main website.'
        );
        setTimeout(() => setFeedback(null), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMarqueeSaving(false);
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl || !imageUrl.trim()) {
      setErrorMsg('Please upload an image file or provide an image URL');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_BANNER',
          bannerData: {
            title,
            subtitle,
            imageUrl: imageUrl.trim(),
            linkUrl: linkUrl || '/products',
            buttonText: buttonText || 'Shop Now',
            displayOrder: parseInt(displayOrder, 10) || 0,
            position: 'HERO',
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        setTitle('');
        setSubtitle('');
        setImageUrl('');
        setLinkUrl('/products');
        setButtonText('Shop Now');
        setDisplayOrder('0');
        setFeedback('Hero section banner photo added successfully! It is now live on the homepage.');
        setTimeout(() => setFeedback(null), 4000);
        await fetchContent();
      } else {
        setErrorMsg(data.message || 'Failed to add hero banner');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error while saving banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm('Are you sure you want to remove this hero section photo?')) return;
    try {
      const res = await fetch(`/api/admin/content?bannerId=${bannerId}`, { method: 'DELETE' });
      if (res.ok) {
        setFeedback('Hero banner photo removed.');
        setTimeout(() => setFeedback(null), 3000);
        await fetchContent();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200/80 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#35109B] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              Hero Section Control
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#19152B] tracking-tight mt-1">
            Hero Section Photos &amp; Banners
          </h1>
          <p className="text-xs text-gray-500">
            Upload custom hero photos, manage carousel slides, and customize storewide promotions
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2 border border-gray-200 text-gray-700 hover:border-[#35109B] rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 bg-white shadow-sm"
          >
            <span>View Homepage</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </Link>

          <button
            onClick={() => {
              setErrorMsg(null);
              setIsModalOpen(true);
            }}
            className="bg-[#FF7900] hover:bg-[#ea580c] text-white px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 shadow-md transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Hero Photo</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {feedback && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center space-x-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* HERO SECTION BACKGROUND IMAGE CONFIGURATION */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#FF7900] text-white flex items-center justify-center shadow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#19152B]">
                Hero Section Background Image
              </h2>
              <p className="text-[11px] text-gray-500">
                Upload or change the background image for &quot;Turn Blank Toy Canvases into Desk Legends&quot;. Stored in Supabase.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {heroBgImage && (
              <button
                type="button"
                onClick={handleRemoveHeroBg}
                disabled={heroBgSaving}
                className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Image</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => handleSaveHeroBg()}
              disabled={heroBgSaving}
              className="bg-[#35109B] hover:bg-[#280a7a] disabled:opacity-50 text-white px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{heroBgSaving ? 'Saving to Supabase...' : 'Save Background'}</span>
            </button>
          </div>
        </div>

        {/* Live Preview of the Hero with Background */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-md bg-gradient-to-br from-[#1A0553] via-[#35109B] to-[#270A77] p-6 text-white border border-white/10 min-h-[220px] flex flex-col justify-center">
          {heroBgImage ? (
            <>
              <Image
                src={heroBgImage}
                alt="Hero Background Preview"
                fill
                unoptimized
                className="object-cover object-center z-0"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1A0553]/95 via-[#35109B]/85 to-black/50 z-0" />
            </>
          ) : (
            <div className="absolute top-3 right-3 z-10 bg-white/20 backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
              Current: Default Royal Purple Gradient
            </div>
          )}

          <div className="relative z-10 max-w-xl space-y-2">
            <span className="inline-flex items-center space-x-1 bg-[#FF7900] text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow">
              <Sparkles className="w-2.5 h-2.5 fill-white" />
              <span>OFFICIAL POP DIY CREATOR HUB</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              Turn Blank Toy Canvases into <span className="text-[#FF7900]">Desk Legends</span>
            </h3>
            <p className="text-xs text-purple-100 line-clamp-2">
              Unbox sealed studio kits with primer-ready matte vinyl figures, modular snap-fit mechs, and motion-sensing illuminated miniature book nooks.
            </p>
            <div className="pt-2 flex items-center space-x-2">
              <span className="bg-[#FF7900] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg shadow">
                Explore All Pop DIYs →
              </span>
              <span className="bg-white/15 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/20">
                Paint-Your-Own Vinyl
              </span>
            </div>
          </div>
        </div>

        {/* Upload & URL Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              Upload Background Image File
            </label>
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 hover:border-[#35109B] rounded-2xl cursor-pointer bg-gray-50/50 hover:bg-purple-50/30 transition-all group">
              <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#35109B] mb-1 transition-colors" />
              <span className="text-xs font-bold text-gray-600 group-hover:text-[#35109B]">
                Click to browse photo from computer
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5">
                PNG, JPG, WEBP recommended (1920x600 or larger)
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleHeroBgUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Or Paste Online Image URL
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={heroBgImage}
                  onChange={(e) => setHeroBgImage(e.target.value)}
                  placeholder="https://images.unsplash.com/... or CDN link"
                  className="flex-1 p-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#35109B]"
                />
                {heroBgImage && (
                  <button
                    type="button"
                    onClick={() => setHeroBgImage('')}
                    className="p-2.5 text-gray-400 hover:text-red-500 rounded-xl border border-gray-200"
                    title="Clear"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Sample Presets */}
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Sample Creator Studio Backdrops:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setHeroBgImage(
                      'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1600&q=80'
                    )
                  }
                  className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-[#35109B] rounded-lg text-[10px] font-bold transition-colors"
                >
                  🎨 Creative Studio Desk
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setHeroBgImage(
                      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1600&q=80'
                    )
                  }
                  className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-[#FF7900] rounded-lg text-[10px] font-bold transition-colors"
                >
                  ✨ Vibrant Craft Workshop
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setHeroBgImage(
                      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80'
                    )
                  }
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold transition-colors"
                >
                  🌌 Cosmic Neon Workshop
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Active Hero Banners */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#35109B] text-white flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-[#FF7900]" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#19152B]">
                Active Hero Carousel Photos ({banners.length})
              </h2>
              <p className="text-[11px] text-gray-500">
                Only photos uploaded here appear in the homepage hero carousel. No mock photos!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setErrorMsg(null);
              setIsModalOpen(true);
            }}
            className="text-xs font-bold text-[#35109B] hover:text-[#FF7900] flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Another Slide</span>
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400">Loading hero photos...</div>
        ) : banners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {banners.map((b, idx) => (
              <div
                key={b.id}
                className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm group bg-[#1A0553]"
              >
                {/* Banner Image Preview */}
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={b.imageUrl}
                    alt={b.title}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 flex flex-col justify-end text-white">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="bg-[#FF7900] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                        Slide {idx + 1}
                      </span>
                      <span className="bg-emerald-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                        Live on Homepage
                      </span>
                    </div>
                    <h3 className="font-extrabold text-sm leading-tight text-white drop-shadow">
                      {b.title}
                    </h3>
                    {b.subtitle && (
                      <p className="text-[11px] text-gray-200 line-clamp-1 mt-0.5 drop-shadow">
                        {b.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Banner Details & Action Footer */}
                <div className="p-3 bg-white flex items-center justify-between text-xs border-t border-gray-100">
                  <div className="space-y-0.5 max-w-[260px] truncate">
                    <span className="text-[10px] text-gray-400 font-mono block">
                      Target: {b.linkUrl || '/products'}
                    </span>
                    <span className="text-[11px] font-bold text-[#35109B] block">
                      Button: {b.buttonText || 'Shop Now'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteBanner(b.id)}
                    className="px-2.5 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold flex items-center space-x-1 border border-red-200 transition-colors"
                    title="Remove from Hero"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-[#F7F7FB] border border-dashed border-gray-300">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#35109B] flex items-center justify-center mx-auto mb-3">
              <Upload className="w-7 h-7 text-[#FF7900]" />
            </div>
            <h3 className="text-sm font-black text-[#19152B]">
              No Custom Hero Photos Uploaded Yet
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto leading-relaxed">
              The storefront is currently showing the sleek branded ALMARTO hero banner (with zero mock photos). Click below to upload your first custom hero photo or paste an ImageKit URL!
            </p>
            <button
              onClick={() => {
                setErrorMsg(null);
                setIsModalOpen(true);
              }}
              className="mt-4 bg-[#FF7900] hover:bg-[#ea580c] text-white px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Hero Photo Now</span>
            </button>
          </div>
        )}
      </div>

      {/* SECTION 2: Storewide Scrolling Marquee Section */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200/80 shadow-sm space-y-6 text-xs">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#35109B] to-[#FF7900] text-white flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-[#19152B]">
                  Storewide Scrolling Marquee Section
                </h2>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    marqueeEnabled
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}
                >
                  {marqueeEnabled ? '● LIVE ON WEBSITE' : '○ DISABLED'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Enable or disable a smooth infinite scrolling announcement ticker across the top of the main website
              </p>
            </div>
          </div>

          {/* Quick Toggle Button */}
          <button
            type="button"
            onClick={() => setMarqueeEnabled(!marqueeEnabled)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-2 shrink-0 shadow-sm ${
              marqueeEnabled
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <span>{marqueeEnabled ? 'Marquee is ACTIVE' : 'Marquee is DISABLED'}</span>
            <span className="text-[10px] opacity-75">
              (Click to {marqueeEnabled ? 'Turn Off' : 'Turn On'})
            </span>
          </button>
        </div>

        {/* Live Interactive Preview Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-[#19152B] flex items-center space-x-1.5 text-xs">
              <Eye className="w-3.5 h-3.5 text-[#35109B]" />
              <span>Real-Time Storefront Live Preview</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              Hover to pause • Click to test
            </span>
          </div>

          <div
            className={`relative overflow-hidden rounded-2xl p-2.5 transition-all shadow-sm border ${
              !marqueeEnabled ? 'opacity-40 grayscale' : ''
            } ${
              marqueeTheme === 'orange'
                ? 'bg-[#FF7900] text-white border-orange-400'
                : marqueeTheme === 'purple'
                ? 'bg-[#35109B] text-white border-purple-800'
                : marqueeTheme === 'dark'
                ? 'bg-[#100326] text-amber-300 border-purple-900'
                : 'bg-gradient-to-r from-[#35109B] via-[#6318C8] to-[#FF7900] text-white border-purple-300'
            }`}
            style={{
              ['--marquee-duration' as any]:
                marqueeSpeed === 'fast' ? '14s' : marqueeSpeed === 'slow' ? '40s' : '25s',
            }}
          >
            <div className="flex items-center overflow-hidden">
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm mr-2 shrink-0">
                ⚡ Ticker
              </span>
              <div className="animate-marquee flex items-center space-x-6 text-xs font-semibold">
                <span className="shrink-0">{marqueeText}</span>
                <span className="shrink-0">{marqueeText}</span>
              </div>
            </div>
          </div>
          {!marqueeEnabled && (
            <p className="text-[11px] text-amber-700 font-medium">
              ⚠️ The marquee is currently disabled. Toggle &quot;Turn On&quot; above and click Save to display it on the website.
            </p>
          )}
        </div>

        {/* Marquee Text Input with Presets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-gray-700">
              Ticker Announcement Message (Use &apos;•&apos; to separate highlights)
            </label>
            <span className="text-[10px] text-gray-400 font-mono">
              {marqueeText.length} characters
            </span>
          </div>
          <textarea
            rows={2}
            value={marqueeText}
            onChange={(e) => setMarqueeText(e.target.value)}
            placeholder="e.g. 🎨 POP DIY CREATIVE SALE: Flat ₹150 OFF • 📦 Free Express Delivery Across India • ⚡ 100% Non-Toxic Studio Certified"
            className="w-full p-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#35109B] outline-none text-xs font-medium leading-relaxed"
          />

          {/* 1-Click Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">
              Quick Templates:
            </span>
            <button
              type="button"
              onClick={() =>
                setMarqueeText(
                  '⚡ ALMARTO POP DIY FESTIVAL: Extra ₹200 OFF with code POPFEST • 📦 Free All-India Express Shipping • 🎁 Mystery Collectible in every 3rd order • ⭐ 100% Studio Non-Toxic Acrylics'
                )
              }
              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-[#35109B] rounded-lg text-[10px] font-bold transition-colors"
            >
              🎉 Festive Sale
            </button>
            <button
              type="button"
              onClick={() =>
                setMarqueeText(
                  '🎨 FRESH DROP ALERT: Neon Glow Paint-Your-Own Vinyls & Motion-Lit Diorama Nooks now in stock! • 🚀 Limited Edition 500 units per sculpt • 🎁 Free Crafting Toolset included'
                )
              }
              className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-[#FF7900] rounded-lg text-[10px] font-bold transition-colors"
            >
              🚀 New Creator Drops
            </button>
            <button
              type="button"
              onClick={() =>
                setMarqueeText(
                  '📦 FREE EXPRESS SHIPPING on all orders above ₹499 • ⚡ Dispatched within 24 Hours • 🛡️ Safe Snap-Fit Acrylic Cases • 🌟 Rated 4.9/5 by 12,000+ Pop DIY Creators'
                )
              }
              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold transition-colors"
            >
              🚚 Free Shipping Perks
            </button>
          </div>
        </div>

        {/* Customization Grid: Theme, Speed, Link */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Theme Selector */}
          <div>
            <label className="block font-bold text-gray-700 mb-1.5 flex items-center space-x-1.5">
              <Palette className="w-3.5 h-3.5 text-[#35109B]" />
              <span>Color Theme</span>
            </label>
            <select
              value={marqueeTheme}
              onChange={(e) => setMarqueeTheme(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#35109B] outline-none text-xs font-semibold bg-white"
            >
              <option value="gradient">✨ Neon Pop Gradient (Purple → Orange)</option>
              <option value="orange">🔥 Vibrant Orange (#FF7900)</option>
              <option value="purple">👑 Royal Purple (#35109B)</option>
              <option value="dark">🌙 Electric Midnight &amp; Gold</option>
            </select>
          </div>

          {/* Speed Selector */}
          <div>
            <label className="block font-bold text-gray-700 mb-1.5 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-[#35109B]" />
              <span>Scroll Animation Speed</span>
            </label>
            <select
              value={marqueeSpeed}
              onChange={(e) => setMarqueeSpeed(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#35109B] outline-none text-xs font-semibold bg-white"
            >
              <option value="normal">⚡ Balanced (25 seconds)</option>
              <option value="fast">🚀 Dynamic &amp; Fast (14 seconds)</option>
              <option value="slow">🌿 Relaxed &amp; Smooth (40 seconds)</option>
            </select>
          </div>

          {/* Target Link */}
          <div>
            <label className="block font-bold text-gray-700 mb-1.5 flex items-center space-x-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-[#35109B]" />
              <span>Target Click Destination</span>
            </label>
            <input
              type="text"
              value={marqueeLink}
              onChange={(e) => setMarqueeLink(e.target.value)}
              placeholder="/products"
              className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#35109B] outline-none text-xs font-mono"
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-[11px] text-gray-400">
            Changes will take effect instantly across all customer pages without redeploying.
          </p>

          <button
            onClick={handleSaveMarquee}
            disabled={marqueeSaving}
            className="bg-[#35109B] hover:bg-[#270A77] text-white px-6 py-2.5 rounded-xl font-black text-xs transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{marqueeSaving ? 'Saving Changes...' : 'Save & Publish Marquee'}</span>
          </button>
        </div>
      </div>

      {/* Modal: Upload / Add New Hero Photo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="bg-[#35109B] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-black text-base">Upload Hero Section Photo</h3>
                <p className="text-[11px] text-purple-200">
                  Add photos that will be displayed in the homepage hero carousel
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddBanner} className="p-6 space-y-4 text-xs">
              {/* Image Input Options */}
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#35109B] text-xs">
                    Hero Photo Source *
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">16:9 Recommended</span>
                </div>

                {/* Option 1: File from device */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    Upload from device:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#35109B] file:text-white hover:file:bg-[#270A77] file:cursor-pointer"
                  />
                </div>

                <div className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  — OR —
                </div>

                {/* Option 2: ImageKit or Web URL */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    Paste ImageKit URL or CDN link:
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value.trim())}
                    placeholder="Image URL"
                    className="w-full p-2.5 border rounded-xl bg-white font-mono text-[11px] focus:ring-2 focus:ring-[#35109B] outline-none"
                  />
                </div>

                {/* Live Preview */}
                {imageUrl && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-emerald-700 block mb-1">
                      ✓ Live Banner Preview:
                    </span>
                    <div className="relative h-32 w-full rounded-xl overflow-hidden border-2 border-emerald-500 bg-gray-900 shadow-md">
                      <Image
                        src={imageUrl}
                        alt="Hero Preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex flex-col justify-end text-white">
                        <span className="text-xs font-bold truncate">
                          {title || 'Banner Title Preview'}
                        </span>
                        <span className="text-[10px] text-gray-300 truncate">
                          {subtitle || 'Subtitle Preview'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Banner Title"
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#35109B] outline-none"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Subtitle / Offer Description
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Subtitle or offer details"
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#35109B] outline-none"
                />
              </div>

              {/* Link & Button Text */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target Link</label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="/products"
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#35109B] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="Button text"
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#35109B] outline-none"
                  />
                </div>
              </div>

              {/* Display Order */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Slide Order</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="w-24 p-2.5 border rounded-xl focus:ring-2 focus:ring-[#35109B] outline-none"
                />
                <span className="text-[10px] text-gray-400 ml-2">Lower numbers appear first</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#FF7900] hover:bg-[#ea580c] text-white font-extrabold px-6 py-2 rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                >
                  {submitting ? (
                    <span>Uploading...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Save Hero Photo</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
