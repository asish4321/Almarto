'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Layers, Plus, Trash2, Edit, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  _count?: { products: number };
  subcategories?: { id: string; name: string }[];
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories?all=true');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentId('');
    setName('');
    setSlug('');
    setImage('');
    setDescription('');
    setDisplayOrder('0');
    setIsActive(true);
    setIsFeatured(false);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryData) => {
    setIsEditing(true);
    setCurrentId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setImage(cat.image || '');
    setDescription(cat.description || '');
    setDisplayOrder(cat.displayOrder?.toString() || '0');
    setIsActive(cat.isActive ?? true);
    setIsFeatured(cat.isFeatured ?? false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setFeedback(null);

    const payload = {
      id: currentId,
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      image: image.trim() || null,
      description: description.trim() || null,
      displayOrder: parseInt(displayOrder, 10) || 0,
      isActive,
      isFeatured,
    };

    try {
      const res = await fetch('/api/categories', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({
          text: isEditing ? 'Category updated successfully!' : 'Category created successfully!',
        });
        setIsModalOpen(false);
        fetchCategories();
        setTimeout(() => setFeedback(null), 3500);
      } else {
        setFeedback({ text: data.message || 'Operation failed', isError: true });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ text: 'Network error saving category', isError: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat: CategoryData) => {
    const confirmMsg = cat._count?.products && cat._count.products > 0
      ? `Category "${cat.name}" has ${cat._count.products} products attached. Deleting it will delete this category and its products. Are you sure you want to proceed?`
      : `Are you sure you want to permanently delete category "${cat.name}"?`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/categories?id=${cat.id}`, { method: 'DELETE' });
      if (res.ok) {
        setFeedback({ text: `Category "${cat.name}" deleted.` });
        fetchCategories();
        setTimeout(() => setFeedback(null), 3000);
      } else {
        const data = await res.json();
        setFeedback({ text: data.message || 'Failed to delete category', isError: true });
      }
    } catch (err) {
      console.error('Delete error:', err);
      setFeedback({ text: 'Error connecting to server', isError: true });
    }
  };

  const toggleStatus = async (cat: CategoryData) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cat.id, isActive: !cat.isActive }),
      });
      if (res.ok) {
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200/80 gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#19152B] tracking-tight">Category Manager</h1>
          <p className="text-xs text-brand-muted">
            Add, update, and manage categories and navigation hierarchy
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchCategories}
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 transition-colors"
            title="Refresh Categories"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreateModal}
            className="bg-[#FF7900] hover:bg-[#ea580c] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center space-x-2 shadow-sm ${
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

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-gray-400">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border p-8 space-y-3">
            <Layers className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-bold text-gray-700">No categories found</p>
            <p className="text-xs text-gray-400">Click &ldquo;Add New Category&rdquo; to create your first category.</p>
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col justify-between hover:border-[#35109B]/40 transition-all ${
                !cat.isActive ? 'opacity-60 bg-gray-50/70' : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border">
                      {cat.image ? (
                        <Image src={cat.image} alt={cat.name} fill unoptimized className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#35109B] text-white flex items-center justify-center font-bold">
                          {cat.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#19152B]">{cat.name}</h3>
                      <span className="text-[10px] text-gray-400 font-mono block">/{cat.slug}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 text-gray-600 hover:text-[#35109B] hover:bg-purple-50 rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                  {cat.description || 'No description provided.'}
                </p>

                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {cat.subcategories.slice(0, 4).map((sub) => (
                      <span key={sub.id} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                        {sub.name}
                      </span>
                    ))}
                    {cat.subcategories.length > 4 && (
                      <span className="text-[10px] text-gray-400 font-medium">+{cat.subcategories.length - 4} more</span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="font-bold text-[#35109B]">
                  {cat._count?.products || 0} Products
                </span>

                <button
                  type="button"
                  onClick={() => toggleStatus(cat)}
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition-colors ${
                    cat.isActive
                      ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      : 'text-gray-500 bg-gray-200 hover:bg-gray-300'
                  }`}
                  title="Click to toggle active state"
                >
                  {cat.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Add or Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border">
            <div className="bg-[#35109B] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {isEditing ? 'Update Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!isEditing && !slug) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#35109B] outline-none"
                  placeholder="Category Name"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Slug URL *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full p-2.5 border rounded-xl font-mono focus:ring-2 focus:ring-[#35109B] outline-none"
                  placeholder="category-slug"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#35109B] outline-none"
                  placeholder="Image URL"
                />
                {image && (
                  <div className="mt-2 relative w-16 h-16 rounded-xl overflow-hidden border">
                    <Image src={image} alt="Preview" fill unoptimized className="object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#35109B] outline-none"
                  placeholder="Category description"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#35109B] outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActiveToggle"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#35109B] focus:ring-[#35109B]"
                  />
                  <label htmlFor="isActiveToggle" className="font-bold text-gray-700 cursor-pointer">
                    Active on Store
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#FF7900] hover:bg-[#ea580c] text-white font-bold px-5 py-2 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting
                    ? isEditing
                      ? 'Saving...'
                      : 'Creating...'
                    : isEditing
                    ? 'Save Changes'
                    : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
