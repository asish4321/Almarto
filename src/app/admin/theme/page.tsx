'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Palette,
  Check,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Save,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Search,
  Star,
  Zap,
  MapPin,
  Sliders,
  Eye,
} from 'lucide-react';
import { THEMES, ThemeDefinition, ThemeStyles, getThemeById } from '@/lib/themes';

export default function AdminThemePage() {
  const [activeThemeId, setActiveThemeId] = useState('toy_kingdom');
  const [selectedThemeId, setSelectedThemeId] = useState('toy_kingdom');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  // Custom colors mode
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customPrimary, setCustomPrimary] = useState('#4F46E5');
  const [customAccent, setCustomAccent] = useState('#FF7900');
  const [customBg, setCustomBg] = useState('#FFFFFF');

  const fetchCurrentTheme = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/theme');
      if (res.ok) {
        const data = await res.json();
        if (data.activeThemeId) {
          setActiveThemeId(data.activeThemeId);
          setSelectedThemeId(data.activeThemeId);
          if (data.activeTheme?.styles) {
            setCustomPrimary(data.activeTheme.styles.primaryColor);
            setCustomAccent(data.activeTheme.styles.accentColor);
            setCustomBg(data.activeTheme.styles.bgColor);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load theme:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentTheme();
  }, []);

  const selectedTheme = getThemeById(selectedThemeId);

  // Computed preview styles
  const previewStyles: ThemeStyles = isCustomMode
    ? {
        ...selectedTheme.styles,
        primaryColor: customPrimary,
        primaryHover: customPrimary,
        accentColor: customAccent,
        accentHover: customAccent,
        bgColor: customBg,
        headerBg: customPrimary,
      }
    : selectedTheme.styles;

  const handleSaveTheme = async () => {
    setSaving(true);
    setFeedback(null);

    const payload = isCustomMode
      ? {
          themeId: 'custom',
          customStyles: {
            primaryColor: customPrimary,
            accentColor: customAccent,
            bgColor: customBg,
            headerBg: customPrimary,
          },
        }
      : {
          themeId: selectedThemeId,
        };

    try {
      const res = await fetch('/api/admin/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setActiveThemeId(selectedThemeId);
        setFeedback({
          text: 'Theme saved! Colors are now active across the entire customer store.',
        });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ text: data.message || 'Failed to save theme', isError: true });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ text: 'Error connecting to server', isError: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200/80 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#4F46E5] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              Appearance &amp; Branding
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight mt-1">
            Store Theme &amp; Color Customizer
          </h1>
          <p className="text-xs text-gray-500">
            Switch to vibrant, child-attractive, playful toy palettes or configure your own brand colors. Changes sync to Supabase database.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2 border border-gray-200 text-gray-700 hover:border-indigo-600 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 bg-white shadow-sm"
          >
            <span>View Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </Link>

          <button
            onClick={handleSaveTheme}
            disabled={saving}
            className="bg-[#FF7900] hover:bg-[#ea580c] disabled:opacity-60 text-white px-5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 shadow-md transform hover:-translate-y-0.5"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Theme...' : 'Save & Apply Theme'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center space-x-2 shadow-sm animate-fade-in ${
            feedback.isError
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          {feedback.isError ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* LIVE STOREFRONT PREVIEW BAR */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900">
                Live Interactive Store Preview
              </h2>
              <p className="text-[11px] text-gray-500">
                Preview how &ldquo;{selectedTheme.name}&rdquo; will look to your customers in real-time
              </p>
            </div>
          </div>

          <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Live Preview Mode
          </span>
        </div>

        {/* Mock Storefront Window */}
        <div
          className="rounded-2xl border-2 border-gray-200/90 overflow-hidden shadow-inner transition-colors duration-300"
          style={{ backgroundColor: previewStyles.bgColor }}
        >
          {/* Mock Browser Header Bar */}
          <div
            className="p-3 text-white transition-all duration-300 flex items-center justify-between gap-4"
            style={{ background: previewStyles.headerBg, color: previewStyles.headerText }}
          >
            {/* Logo */}
            <div className="bg-white text-gray-900 font-black text-xs px-3 py-1 rounded-lg shadow-sm flex items-center space-x-1.5 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>ALMARTO</span>
            </div>

            {/* Deliver to pin */}
            <div className="hidden sm:flex items-center space-x-1.5 bg-white/15 px-2.5 py-1 rounded-lg text-[10px]">
              <MapPin className="w-3 h-3 text-white" />
              <span>Deliver to Bengaluru 560001</span>
            </div>

            {/* Search Input Mock */}
            <div className="flex-1 max-w-sm relative">
              <input
                type="text"
                readOnly
                value="Search Pop DIY Toys, Kits..."
                className="w-full py-1.5 pl-3 pr-8 rounded-lg bg-white text-gray-700 text-[11px] shadow-sm cursor-default"
              />
              <button
                className="absolute right-1 top-1 bottom-1 px-2 text-white rounded text-[10px] font-bold flex items-center justify-center transition-colors"
                style={{ backgroundColor: previewStyles.accentColor }}
              >
                <Search className="w-3 h-3" />
              </button>
            </div>

            {/* Cart Button Mock */}
            <button
              className="text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
              style={{ backgroundColor: previewStyles.accentColor }}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cart (2)</span>
            </button>
          </div>

          {/* Mock Subcategory Navigation Strip */}
          <div className="bg-white border-b border-gray-200/80 px-4 py-2 flex items-center space-x-2 text-[11px] overflow-x-auto">
            <span
              className="font-bold px-2.5 py-1 rounded-lg text-white"
              style={{ backgroundColor: previewStyles.primaryColor }}
            >
              All Products
            </span>
            <span
              className="font-bold px-2.5 py-1 rounded-lg text-white"
              style={{ backgroundColor: previewStyles.accentColor }}
            >
              ⚡ Festive Deals
            </span>
            <span className="text-gray-600 px-2">Paint Vinyls</span>
            <span className="text-gray-600 px-2">Blind Boxes</span>
            <span className="text-gray-600 px-2">Miniature Dioramas</span>
          </div>

          {/* Mock Storefront Body with Sample Product Card */}
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Promo Card */}
            <div
              className="p-4 rounded-2xl text-white flex flex-col justify-between h-44 shadow-sm"
              style={{ background: previewStyles.headerBg }}
            >
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block mb-1">
                  NEW ARRIVALS
                </span>
                <h3 className="font-extrabold text-sm mt-1">Creative DIY Kits for Kids &amp; Creators</h3>
                <p className="text-[11px] text-white/80 mt-1">Zero mess non-toxic craft studios.</p>
              </div>
              <button
                className="text-white text-xs font-black py-2 px-4 rounded-xl shadow-md self-start"
                style={{ backgroundColor: previewStyles.accentColor }}
              >
                Explore Collection →
              </button>
            </div>

            {/* Product Card Preview 1 */}
            <div className="bg-white rounded-2xl p-3 border border-gray-200/80 shadow-sm flex flex-col justify-between h-44">
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase"
                    style={{ backgroundColor: previewStyles.primaryLight, color: previewStyles.primaryColor }}
                  >
                    Bestseller
                  </span>
                  <h4 className="font-bold text-xs text-gray-900 mt-1 line-clamp-1">
                    DIY Anime Vinyl Figure Kit
                  </h4>
                  <div className="flex items-center space-x-1 mt-0.5 text-amber-500 text-[10px]">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-bold">4.9</span>
                    <span className="text-gray-400">(128 reviews)</span>
                  </div>
                </div>

                <span
                  className="text-[10px] font-extrabold px-1.5 py-0.5 rounded text-white"
                  style={{ backgroundColor: previewStyles.accentColor }}
                >
                  35% OFF
                </span>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="font-black text-sm" style={{ color: previewStyles.primaryColor }}>
                    ₹1,299
                  </span>
                  <span className="text-[10px] text-gray-400 line-through ml-1.5">₹1,999</span>
                </div>
                <button
                  className="text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"
                  style={{ backgroundColor: previewStyles.accentColor }}
                >
                  + Add to Cart
                </button>
              </div>
            </div>

            {/* Product Card Preview 2 */}
            <div className="bg-white rounded-2xl p-3 border border-gray-200/80 shadow-sm flex flex-col justify-between h-44">
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase"
                    style={{ backgroundColor: previewStyles.primaryLight, color: previewStyles.primaryColor }}
                  >
                    Staff Pick
                  </span>
                  <h4 className="font-bold text-xs text-gray-900 mt-1 line-clamp-1">
                    Illuminated Miniature Book Nook
                  </h4>
                  <div className="flex items-center space-x-1 mt-0.5 text-amber-500 text-[10px]">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-bold">5.0</span>
                    <span className="text-gray-400">(94 reviews)</span>
                  </div>
                </div>

                <span
                  className="text-[10px] font-extrabold px-1.5 py-0.5 rounded text-white"
                  style={{ backgroundColor: previewStyles.accentColor }}
                >
                  40% OFF
                </span>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="font-black text-sm" style={{ color: previewStyles.primaryColor }}>
                    ₹2,499
                  </span>
                  <span className="text-[10px] text-gray-400 line-through ml-1.5">₹3,999</span>
                </div>
                <button
                  className="text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"
                  style={{ backgroundColor: previewStyles.accentColor }}
                >
                  + Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* THEMES SELECTION CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-gray-900">
              Select Curated Theme Palette
            </h2>
            <p className="text-xs text-gray-500">
              Click any theme card to preview it instantly. Hit &ldquo;Save &amp; Apply Theme&rdquo; to publish.
            </p>
          </div>

          <button
            onClick={() => setIsCustomMode(!isCustomMode)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 p-2 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            <Sliders className="w-4 h-4" />
            <span>{isCustomMode ? '← Back to Curated Presets' : 'Customize Colors Manually'}</span>
          </button>
        </div>

        {!isCustomMode ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {THEMES.map((theme) => {
              const isSelected = selectedThemeId === theme.id;
              const isCurrentlyActive = activeThemeId === theme.id;

              return (
                <div
                  key={theme.id}
                  onClick={() => setSelectedThemeId(theme.id)}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative flex flex-col justify-between bg-white shadow-sm hover:shadow-md ${
                    isSelected
                      ? 'border-indigo-600 ring-4 ring-indigo-500/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {theme.category}
                    </span>
                    {theme.badge && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        {theme.badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900 flex items-center justify-between">
                      <span>{theme.name}</span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {theme.description}
                    </p>
                  </div>

                  {/* 4-Color Swatch Pill */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                      Palette Swatch
                    </div>
                    <div className="flex items-center space-x-1.5 h-6 rounded-lg overflow-hidden border">
                      {theme.previewColors.map((color, idx) => (
                        <div
                          key={idx}
                          className="flex-1 h-full"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      {isCurrentlyActive ? (
                        <span className="text-[10px] font-black text-emerald-600 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Currently Active</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400">
                          Click to Preview
                        </span>
                      )}

                      <span
                        className={`text-xs font-bold ${
                          isSelected ? 'text-indigo-600' : 'text-gray-400'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Custom Color Palette Controls */
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-sm text-gray-900">Custom Palette Designer</h3>
              <p className="text-xs text-gray-500">Pick any custom hexadecimal color for your store</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Primary Color */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3">
                <label className="block text-xs font-extrabold text-gray-800">
                  Primary Brand Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={customPrimary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer border border-gray-300"
                  />
                  <input
                    type="text"
                    value={customPrimary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-xl font-mono text-xs uppercase font-bold"
                  />
                </div>
                <p className="text-[11px] text-gray-500">
                  Used for header backgrounds, active navigation tabs, price tags, and primary badges.
                </p>
              </div>

              {/* Accent Color */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3">
                <label className="block text-xs font-extrabold text-gray-800">
                  Accent Action Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={customAccent}
                    onChange={(e) => setCustomAccent(e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer border border-gray-300"
                  />
                  <input
                    type="text"
                    value={customAccent}
                    onChange={(e) => setCustomAccent(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-xl font-mono text-xs uppercase font-bold"
                  />
                </div>
                <p className="text-[11px] text-gray-500">
                  Used for action buttons, &ldquo;Add to Cart&rdquo;, promotional banners, and discount pills.
                </p>
              </div>

              {/* Background Color */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3">
                <label className="block text-xs font-extrabold text-gray-800">
                  Store Background Tone
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={customBg}
                    onChange={(e) => setCustomBg(e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer border border-gray-300"
                  />
                  <input
                    type="text"
                    value={customBg}
                    onChange={(e) => setCustomBg(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-xl font-mono text-xs uppercase font-bold"
                  />
                </div>
                <p className="text-[11px] text-gray-500">
                  Used for page backgrounds, section contrast, and container framing.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
