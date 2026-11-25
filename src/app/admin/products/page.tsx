'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Zap,
  Layers,
  Image as ImageIcon,
  DollarSign,
  Tag,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface ProductAdminItem {
  id: string;
  title: string;
  slug: string;
  sku: string;
  mrp: number;
  price: number;
  discountPercent?: number;
  stock: number;
  status: string;
  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  isDealOfTheDay: boolean;
  category?: { name: string; id: string; slug: string };
  brand?: { name: string };
  images: { url: string; altText?: string; isPrimary?: boolean }[];
  description?: string;
  shortDescription?: string;
  specifications?: string;
  highlights?: string;
  sellerName?: string;
  warrantyInfo?: string;
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductAdminItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductAdminItem | null>(null);

  // Form inputs
  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isCreatingNewCat, setIsCreatingNewCat] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [mrp, setMrp] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');

  // Multi-photo gallery state
  const [galleryImages, setGalleryImages] = useState<{ url: string; altText: string; isPrimary: boolean }[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Extended Pop DIY Details
  const [productType, setProductType] = useState('Standard Product');
  const [inTheBox, setInTheBox] = useState('');
  const [material, setMaterial] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const [craftingTime, setCraftingTime] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [weight, setWeight] = useState('');

  const [imageUrl, setImageUrl] = useState('');
  const [secondaryImageUrl, setSecondaryImageUrl] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('PUBLISHED');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isDealOfTheDay, setIsDealOfTheDay] = useState(false);
  const [sellerName, setSellerName] = useState('Almarto Direct');
  const [warrantyInfo, setWarrantyInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [successProductSlug, setSuccessProductSlug] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        if (data.categories?.length > 0 && !categoryId) {
          setCategoryId(data.categories[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set('q', search);
      if (selectedCategory) q.set('category', selectedCategory);
      q.set('limit', '50');

      const res = await fetch(`/api/products?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory]);

  const generateRandomSKU = () => {
    const code = Math.floor(1000 + Math.random() * 9000);
    setSku(`POP-DIY-${code}`);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setTitle('');
    generateRandomSKU();
    setIsCreatingNewCat(false);
    setNewCategoryName('');
    setCategoryId(categories[0]?.id || '');
    setMrp('');
    setPrice('');
    setStock('0');
    setGalleryImages([]);
    setNewImageUrl('');
    setProductType('Standard Product');
    setInTheBox('');
    setMaterial('');
    setSkillLevel('');
    setCraftingTime('');
    setDimensions('');
    setWeight('');
    setShortDescription('');
    setDescription('');
    setStatus('PUBLISHED');
    setIsFeatured(false);
    setIsTrending(false);
    setIsBestSeller(false);
    setIsDealOfTheDay(false);
    setSellerName('Almarto Direct');
    setWarrantyInfo('');
    setFeedback(null);
    setSuccessProductSlug(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: ProductAdminItem) => {
    setEditingProduct(p);
    setTitle(p.title);
    setSku(p.sku);
    setIsCreatingNewCat(false);
    setNewCategoryName('');
    setCategoryId(p.category?.id || categories[0]?.id || '');
    setMrp(String(p.mrp));
    setPrice(String(p.price));
    setStock(String(p.stock));
    if (p.images && p.images.length > 0) {
      setGalleryImages(p.images.map((img, i) => ({
        url: img.url,
        altText: img.altText || p.title,
        isPrimary: Boolean(img.isPrimary || i === 0),
      })));
    } else {
      setGalleryImages([]);
    }
    setNewImageUrl('');
    try {
      const specs = p.specifications ? JSON.parse(p.specifications) : {};
      setProductType(specs["Product Type"] || 'Paint-Your-Own Vinyl Pop');
      setInTheBox(specs["What's in the Box"] || specs["Included"] || '');
      setMaterial(specs["Material"] || 'BPA-Free Eco Vinyl & Non-Toxic Acrylics');
      setSkillLevel(specs["Skill Level"] || 'All Ages (Ages 6+)');
      setCraftingTime(specs["Estimated Crafting Time"] || '45 - 90 minutes');
      setDimensions(specs["Dimensions"] || '');
      setWeight(specs["Weight"] || '');
    } catch {
      setProductType('Paint-Your-Own Vinyl Pop');
    }
    setShortDescription(p.shortDescription || '');
    setDescription(p.description || '');
    setStatus(p.status);
    setIsFeatured(p.isFeatured);
    setIsTrending(p.isTrending);
    setIsBestSeller(p.isBestSeller);
    setIsDealOfTheDay(p.isDealOfTheDay);
    setFeedback(null);
    setSuccessProductSlug(null);
    setIsModalOpen(true);
  };

  const calculatedDiscount = Math.max(
    0,
    Math.round(((parseFloat(mrp || '0') - parseFloat(price || '0')) / (parseFloat(mrp || '1') || 1)) * 100)
  );

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    setSuccessProductSlug(null);

    let finalImagesList = [...galleryImages];
    if (newImageUrl.trim() && !finalImagesList.some((img) => img.url === newImageUrl.trim())) {
      finalImagesList.push({
        url: newImageUrl.trim(),
        altText: title,
        isPrimary: finalImagesList.length === 0,
      });
    }
    if (finalImagesList.length > 0 && !finalImagesList.some((img) => img.isPrimary)) {
      finalImagesList[0].isPrimary = true;
    }

    const specsObj: Record<string, string> = {
      'Product Type': productType,
      "What's in the Box": inTheBox,
      'Material': material,
      'Skill Level': skillLevel,
      'Estimated Crafting Time': craftingTime,
    };
    if (dimensions) specsObj['Dimensions'] = dimensions;
    if (weight) specsObj['Weight'] = weight;

    const payload: Record<string, unknown> = {
      title,
      sku,
      categoryId: isCreatingNewCat ? undefined : categoryId,
      newCategoryName: isCreatingNewCat ? newCategoryName.trim() : undefined,
      mrp: parseFloat(mrp),
      price: parseFloat(price),
      stock: parseInt(stock, 10) || 1,
      shortDescription: shortDescription || title,
      description: description || title,
      status,
      isFeatured,
      isTrending,
      isBestSeller,
      isDealOfTheDay,
      sellerName,
      warrantyInfo,
      images: finalImagesList,
      specifications: JSON.stringify(specsObj),
      highlights: JSON.stringify(inTheBox.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 6)),
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessProductSlug(data.product?.slug || null);
        await fetchProducts();
        await fetchCategories();
        setTimeout(() => {
          setIsModalOpen(false);
        }, 1200);
      } else {
        setFeedback(data.message || 'Failed to save product');
      }
    } catch {
      setFeedback('An unexpected error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? It will be removed from the storefront immediately.')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'SKU', 'Category', 'Price', 'MRP', 'Stock', 'Status'];
    const rows = products.map((p) => [
      p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      p.sku,
      p.category?.name || '',
      p.price,
      p.mrp,
      p.stock,
      p.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `almarto_products_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Bulk Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200/80 gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="bg-[#35109B] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
              LIVE STORE MANAGER
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#19152B] tracking-tight">Product Catalog &amp; Storefront Access</h1>
          <p className="text-xs text-gray-500">
            Add new Pop DIY toys, set prices, assign categories, and publish them directly to the customer website
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            href="/"
            target="_blank"
            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#35109B]" />
            <span>View Live Website</span>
          </Link>

          <button
            onClick={handleExportCSV}
            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="bg-[#FF7900] hover:bg-[#ea580c] text-white px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title, SKU, or category..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#35109B]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#35109B] font-medium"
          >
            <option value="">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('');
              fetchProducts();
            }}
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-gray-50/80 text-gray-400 border-b border-gray-100 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 font-semibold">Product</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">SKU</th>
                <th className="py-3.5 px-4 font-semibold">Pricing</th>
                <th className="py-3.5 px-4 font-semibold">Stock</th>
                <th className="py-3.5 px-4 font-semibold">Store Visibility</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Loading products...
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p) => {
                  const img = p.images?.[0]?.url || null;
                  return (
                    <tr key={p.id} className="hover:bg-purple-50/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-12 rounded-xl bg-gray-50 border overflow-hidden shrink-0 flex items-center justify-center">
                            {img ? (
                              <Image src={img} alt={p.title} fill unoptimized className="object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/products/${p.slug}`}
                              target="_blank"
                              className="font-bold text-gray-800 hover:text-[#35109B] line-clamp-1 block transition-colors"
                            >
                              {p.title}
                            </Link>
                            <div className="flex flex-wrap items-center gap-1 mt-1">
                              {p.isBestSeller && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.2 rounded">
                                  Bestseller
                                </span>
                              )}
                              {p.isDealOfTheDay && (
                                <span className="bg-orange-100 text-[#FF7900] text-[9px] font-black px-1.5 py-0.2 rounded flex items-center space-x-0.5">
                                  <Zap className="w-2.5 h-2.5 fill-[#FF7900]" />
                                  <span>Deal</span>
                                </span>
                              )}
                              {p.isTrending && (
                                <span className="bg-purple-100 text-[#35109B] text-[9px] font-black px-1.5 py-0.2 rounded">
                                  Trending
                                </span>
                              )}
                              {p.isFeatured && (
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.2 rounded">
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 font-bold">
                        {p.category?.name || 'Uncategorized'}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-500 font-bold">{p.sku}</td>
                      <td className="py-3 px-4">
                        <div className="font-black text-[#19152B] text-sm">
                          ₹{p.price.toLocaleString('en-IN')}
                        </div>
                        {p.mrp > p.price && (
                          <div className="text-[10px] text-gray-400 line-through">
                            MRP ₹{p.mrp.toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-black px-2.5 py-0.5 rounded-full text-[10px] ${
                            p.stock <= 5
                              ? 'bg-red-100 text-red-700'
                              : p.stock <= 15
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {p.stock} in stock
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-black text-[10px] px-2 py-0.5 rounded-full uppercase ${
                            p.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          className="inline-flex p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#35109B]"
                          title="View Live on Storefront"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-[#35109B]"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#35109B] flex items-center justify-center mx-auto">
                        <Package className="w-6 h-6 text-[#FF7900]" />
                      </div>
                      <h4 className="font-bold text-sm text-gray-800">Your Product Catalog is Empty</h4>
                      <p className="text-xs text-gray-500">
                        Click &ldquo;Add New Product&rdquo; above to publish your first Pop DIY Toy directly to the website!
                      </p>
                      <button
                        onClick={handleOpenAdd}
                        className="bg-[#35109B] hover:bg-[#270A77] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow"
                      >
                        + Add First Product Now
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl border border-gray-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#1A0553] to-[#35109B] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#FF7900] flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">
                    {editingProduct ? 'Edit Product Details' : 'Add New Product to Storefront'}
                  </h3>
                  <span className="text-[10px] text-purple-200">
                    Automatically formats into website product cards and catalog
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              {feedback && (
                <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{feedback}</span>
                </div>
              )}

              {successProductSlug && (
                <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-bold flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Product published successfully to the website!</span>
                  </div>
                  <Link
                    href={`/products/${successProductSlug}`}
                    target="_blank"
                    className="text-[#35109B] underline text-xs"
                  >
                    View Product →
                  </Link>
                </div>
              )}

              {/* 1. Basic Info */}
              <div className="space-y-3">
                <h4 className="font-black text-xs uppercase tracking-wider text-gray-500 border-b pb-1">
                  1. Product Identity &amp; Title
                </h4>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Product Title / Name *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Product Title"
                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#35109B] text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-gray-800">SKU Code *</label>
                      <button
                        type="button"
                        onClick={generateRandomSKU}
                        className="text-[10px] text-[#35109B] font-bold hover:underline"
                      >
                        Auto-generate
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#35109B]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Store Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#35109B] font-bold"
                    >
                      <option value="PUBLISHED">PUBLISHED (Live on Store)</option>
                      <option value="DRAFT">DRAFT (Hidden)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Category Selection or Creation */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="font-black text-xs uppercase tracking-wider text-gray-500">
                    2. Category Assignment
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNewCat(!isCreatingNewCat)}
                    className="text-[11px] font-bold text-[#FF7900] hover:underline"
                  >
                    {isCreatingNewCat ? '← Select Existing Category' : '+ Create Brand New Category'}
                  </button>
                </div>

                {isCreatingNewCat ? (
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">New Category Name *</label>
                    <input
                      type="text"
                      required
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Category Name"
                      className="w-full p-2.5 border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF7900] text-xs font-semibold bg-orange-50/30"
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">
                      This will automatically create a new category and showcase it in the store header and filters.
                    </span>
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Select Existing Category *</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#35109B] font-medium"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* 3. Pricing & Discount Calculation */}
              <div className="space-y-3 pt-2">
                <h4 className="font-black text-xs uppercase tracking-wider text-gray-500 border-b pb-1">
                  3. Pricing &amp; Stock
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-2.5 border border-gray-200 rounded-xl font-bold text-[#35109B] text-sm focus:outline-none focus:ring-2 focus:ring-[#35109B]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">MRP / List Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={mrp}
                      onChange={(e) => setMrp(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-gray-600 font-bold focus:outline-none focus:ring-2 focus:ring-[#35109B]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#35109B]"
                    />
                  </div>
                </div>

                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Customer Savings Display:</span>
                  <span className="font-black text-[#35109B]">
                    {calculatedDiscount}% OFF (Save ₹{Math.max(0, parseFloat(mrp || '0') - parseFloat(price || '0')).toLocaleString('en-IN')})
                  </span>
                </div>
              </div>

              {/* 4. Product Photo Gallery (Multiple Photos) */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b pb-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-black text-xs uppercase tracking-wider text-gray-700">
                      4. Product Photo Gallery ({galleryImages.length} Photos)
                    </h4>
                    <span className="text-[10px] bg-purple-100 text-[#35109B] font-bold px-2 py-0.5 rounded-full">
                      Multi-Photo Support
                    </span>
                  </div>
                  {galleryImages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setGalleryImages([])}
                      className="text-[10px] text-red-600 font-bold hover:underline"
                    >
                      Clear All Photos
                    </button>
                  )}
                </div>

                {/* Add Photo Inputs */}
                <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Image URL"
                      className="flex-1 p-2.5 border border-gray-200 rounded-xl bg-white font-mono text-xs focus:ring-2 focus:ring-[#35109B] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newImageUrl.trim()) {
                          setGalleryImages((prev) => [
                            ...prev,
                            { url: newImageUrl.trim(), altText: title || 'Product Photo', isPrimary: prev.length === 0 },
                          ]);
                          setNewImageUrl('');
                        }
                      }}
                      className="bg-[#35109B] hover:bg-[#270A77] text-white px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors"
                    >
                      + Add Photo URL
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Or select image file from your device:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setGalleryImages((prev) => [
                                ...prev,
                                { url: reader.result as string, altText: title || 'Product Photo', isPrimary: prev.length === 0 },
                              ]);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-[#FF7900] file:text-white hover:file:bg-[#ea580c] file:cursor-pointer"
                    />
                  </div>
                </div>

                {/* Gallery List */}
                {galleryImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {galleryImages.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-xl overflow-hidden border-2 bg-gray-50 p-1 group flex flex-col justify-between ${
                          img.isPrimary ? 'border-[#35109B] ring-2 ring-[#35109B]/20' : 'border-gray-200'
                        }`}
                      >
                        <div className="relative w-full h-24 rounded-lg overflow-hidden bg-white mb-2">
                          <Image src={img.url} alt="" fill unoptimized className="object-contain p-1" />
                          {img.isPrimary && (
                            <span className="absolute top-1 left-1 bg-[#35109B] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                              ★ Primary
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between px-1">
                          {!img.isPrimary ? (
                            <button
                              type="button"
                              onClick={() => {
                                setGalleryImages((prev) =>
                                  prev.map((p, i) => ({ ...p, isPrimary: i === idx }))
                                );
                              }}
                              className="text-[10px] font-bold text-[#35109B] hover:underline"
                            >
                              Make Primary
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400">Cover</span>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setGalleryImages((prev) => {
                                const next = prev.filter((_, i) => i !== idx);
                                if (next.length > 0 && !next.some((p) => p.isPrimary)) {
                                  next[0].isPrimary = true;
                                }
                                return next;
                              });
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 italic">No photos attached yet. Paste ImageKit URL or upload from device above.</p>
                )}
              </div>

              {/* 5. Extended Pop DIY Specifications & What's in the Box */}
              <div className="space-y-4 pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <h4 className="font-black text-xs uppercase tracking-wider text-gray-700">
                    5. Pop DIY Specifications &amp; Unboxing Inclusions
                  </h4>
                  <span className="text-[10px] bg-orange-100 text-[#FF7900] font-black px-2 py-0.5 rounded-full">
                    Customer Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Product Type *</label>
                    <select
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#35109B] text-xs font-semibold bg-white"
                    >
                      <option value="Paint-Your-Own Vinyl Pop">Paint-Your-Own Vinyl Pop</option>
                      <option value="DIY Mystery Blind Box">DIY Mystery Blind Box</option>
                      <option value="Miniature Pop Diorama & Book Nook">Miniature Pop Diorama & Book Nook</option>
                      <option value="Articulated Pop Brick Mech">Articulated Pop Brick Mech</option>
                      <option value="DIY Fluid Pouring Art Bear">DIY Fluid Pouring Art Bear</option>
                      <option value="Air-Dry Clay Craft Studio">Air-Dry Clay Craft Studio</option>
                      <option value="Glow-in-the-Dark Resin Kit">Glow-in-the-Dark Resin Kit</option>
                      <option value="Sensory Fidget Sculptures">Sensory Fidget Sculptures</option>
                      <option value="Artisan Pop Toy Accessory">Artisan Pop Toy Accessory</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Primary Material</label>
                    <input
                      type="text"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      placeholder="Primary Material"
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#35109B] text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    📦 What's Inside the Box (Package Contents — One Item Per Line) *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={inTheBox}
                    onChange={(e) => setInTheBox(e.target.value)}
                    placeholder="Package Contents (one item per line)"
                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#35109B] text-xs font-mono leading-relaxed"
                  />
                  <span className="text-[10px] text-gray-400">
                    Each line becomes a verified inclusion bullet card in the customer unboxing section.
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-gray-800 mb-1 text-[11px]">Skill Level &amp; Age</label>
                    <input
                      type="text"
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value)}
                      placeholder="Skill Level"
                      className="w-full p-2 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-800 mb-1 text-[11px]">Crafting Time</label>
                    <input
                      type="text"
                      value={craftingTime}
                      onChange={(e) => setCraftingTime(e.target.value)}
                      placeholder="Crafting Time"
                      className="w-full p-2 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-800 mb-1 text-[11px]">Dimensions</label>
                    <input
                      type="text"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      placeholder="Dimensions"
                      className="w-full p-2 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-800 mb-1 text-[11px]">Net Weight</label>
                    <input
                      type="text"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="Weight"
                      className="w-full p-2 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Descriptions */}
              <div className="space-y-3 pt-2">
                <h4 className="font-black text-xs uppercase tracking-wider text-gray-500 border-b pb-1">
                  5. Descriptions &amp; Highlights
                </h4>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Short Description (Cards &amp; Quick Views)</label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="e.g. Blank matte vinyl dragon figure with 12 rich acrylic paints & brushes"
                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#35109B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Full Product Story &amp; Details</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Full description of the DIY experience, accessories included, and finish..."
                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#35109B]"
                  />
                </div>
              </div>

              {/* 6. Storefront Merchandising Flags */}
              <div className="space-y-3 pt-2">
                <h4 className="font-black text-xs uppercase tracking-wider text-gray-500 border-b pb-1">
                  6. Storefront Sections &amp; Badges
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <label className="flex items-center space-x-2 p-2.5 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded text-[#35109B] focus:ring-[#35109B]"
                    />
                    <span className="font-bold text-[11px] text-gray-800">Featured</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2.5 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={isTrending}
                      onChange={(e) => setIsTrending(e.target.checked)}
                      className="rounded text-[#35109B] focus:ring-[#35109B]"
                    />
                    <span className="font-bold text-[11px] text-gray-800">Trending</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2.5 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={isBestSeller}
                      onChange={(e) => setIsBestSeller(e.target.checked)}
                      className="rounded text-[#35109B] focus:ring-[#35109B]"
                    />
                    <span className="font-bold text-[11px] text-gray-800">Best Seller</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2.5 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={isDealOfTheDay}
                      onChange={(e) => setIsDealOfTheDay(e.target.checked)}
                      className="rounded text-[#FF7900] focus:ring-[#FF7900]"
                    />
                    <span className="font-bold text-[11px] text-[#FF7900]">Flash Deal</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-end space-x-3 sticky bottom-0 bg-white py-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#FF7900] hover:bg-[#ea580c] disabled:opacity-50 text-white px-7 py-2.5 rounded-xl font-black text-xs transition-all shadow-md flex items-center space-x-1.5"
                >
                  {submitting ? (
                    <span>Publishing to Storefront...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingProduct ? 'Save Product Changes' : 'Publish Product to Website'}</span>
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
