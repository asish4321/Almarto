'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Check, Sparkles, X, ChevronRight, Sliders } from 'lucide-react';
import { THEMES, ThemeDefinition, generateCssVariables } from '@/lib/themes';
import Link from 'next/link';

interface ThemeToggleProps {
  initialThemeId?: string;
}

export function ThemeToggle({ initialThemeId = 'pale_sage_ivory' }: ThemeToggleProps) {
  const [activeThemeId, setActiveThemeId] = useState(initialThemeId);
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Apply theme to DOM dynamically
  const applyThemeToDOM = (theme: ThemeDefinition) => {
    const styles = {
      ...theme.styles,
      bgColor: theme.styles.bgColor || '#FAF7F2',
    };
    const cssVars = generateCssVariables(styles);

    let styleEl = document.getElementById('almarto-dynamic-theme') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'almarto-dynamic-theme';
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = cssVars;
  };

  const selectTheme = async (themeId: string) => {
    setActiveThemeId(themeId);
    const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];
    applyThemeToDOM(theme);

    // Save to backend database so it persists
    setSaving(true);
    try {
      await fetch('/api/admin/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId }),
      });
    } catch (err) {
      console.warn('Theme toggle save notice:', err);
    } finally {
      setSaving(false);
    }
  };

  const cycleNextTheme = () => {
    const currentIndex = THEMES.findIndex((t) => t.id === activeThemeId);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    selectTheme(THEMES[nextIndex].id);
  };

  const currentTheme = THEMES.find((t) => t.id === activeThemeId) || THEMES[0];

  return (
    <>
      {/* Floating Theme Switcher Pill (Bottom-Right) */}
      <div className="fixed bottom-5 right-5 z-50 print:hidden flex flex-col items-end">
        {/* Expanded Theme Switcher Panel */}
        {isOpen && (
          <div className="mb-3 w-80 sm:w-96 bg-[#FAF6F0] rounded-3xl shadow-2xl border border-[#DED6C7] p-4 animate-in fade-in slide-in-from-bottom-5 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: 'var(--primary-color, #4F46E5)' }}
                >
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-gray-900 leading-tight">Theme Switcher</h4>
                  <p className="text-[11px] text-gray-500">Pick vibrant colors for the store</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors"
                aria-label="Close theme picker"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Next Cycle Button */}
            <div className="py-2.5 flex items-center justify-between gap-2">
              <button
                onClick={cycleNextTheme}
                className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95 transition-opacity"
                style={{ backgroundColor: 'var(--primary-color, #4F46E5)' }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Quick Next Theme</span>
              </button>
              <Link
                href="/admin/theme"
                className="py-1.5 px-3 rounded-xl text-xs font-bold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center space-x-1"
                title="Open full admin theme customizer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Customizer</span>
              </Link>
            </div>

            {/* Theme Presets List */}
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {THEMES.map((theme) => {
                const isSelected = theme.id === activeThemeId;
                return (
                  <button
                    key={theme.id}
                    onClick={() => selectTheme(theme.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all text-left ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-500/20'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {/* 3-color palette dots */}
                      <div className="flex items-center -space-x-1.5 shrink-0">
                        {theme.previewColors.slice(0, 3).map((col, idx) => (
                          <div
                            key={idx}
                            className="w-5 h-5 rounded-full border-2 border-white shadow-sm shrink-0"
                            style={{ backgroundColor: col }}
                          />
                        ))}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-gray-900 truncate flex items-center space-x-1.5">
                          <span>{theme.name.split('(')[0].trim()}</span>
                          {theme.badge && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700">
                              Pop
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">{theme.category}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: 'var(--primary-color, #4F46E5)' }}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer Notice */}
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span className="flex items-center space-x-1 text-emerald-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>Theme: Pale Sage &amp; Ivory</span>
              </span>
              <span>{saving ? 'Saving...' : 'Saves in Database'}</span>
            </div>
          </div>
        )}

        {/* Floating Toggle Launcher Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center space-x-2 py-2 px-3.5 rounded-full shadow-xl text-white font-black text-xs transition-all duration-200 hover:scale-105 active:scale-95 border-2 border-white"
          style={{ backgroundColor: 'var(--accent-color, #FF7900)' }}
          title="Toggle store theme & colors"
          aria-expanded={isOpen}
        >
          <Palette className="w-4 h-4 text-white group-hover:rotate-45 transition-transform" />
          <span className="hidden sm:inline">Theme:</span>
          <span className="font-extrabold max-w-[120px] truncate">
            {currentTheme.name.split('(')[0].trim()}
          </span>
          <div className="flex items-center -space-x-1 pl-1">
            {currentTheme.previewColors.slice(0, 2).map((col, i) => (
              <span
                key={i}
                className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                style={{ backgroundColor: col }}
              />
            ))}
          </div>
        </button>
      </div>
    </>
  );
}
