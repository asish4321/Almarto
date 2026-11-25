// In-memory cache for high-traffic customer pages with instant invalidation upon admin changes

interface HomeData {
  dealProducts: any[];
  trendingProducts: any[];
  bestSellerProducts: any[];
  latestProducts: any[];
  heroBanners: any[];
  heroBgValue: string | null;
}

interface LayoutData {
  settingsMap: Record<string, string>;
  categories: { id: string; name: string; slug: string; icon?: string | null; image?: string | null }[];
}

let _homeCache: { data: HomeData; ts: number } | null = null;
let _layoutCache: { data: LayoutData; ts: number } | null = null;
let _settingsCache: { data: Record<string, string>; ts: number } | null = null;

// Short TTL (30 seconds) ensures that even if DB is directly modified out-of-band, it auto-refreshes quickly
export const CACHE_TTL = 30 * 1000;

export function getHomeCache(): { data: HomeData; ts: number } | null {
  return _homeCache;
}

export function setHomeCache(data: HomeData) {
  _homeCache = { data, ts: Date.now() };
}

export function getLayoutCache(): { data: LayoutData; ts: number } | null {
  return _layoutCache;
}

export function setLayoutCache(settingsMap: Record<string, string>, categories: any[]) {
  _layoutCache = { data: { settingsMap, categories }, ts: Date.now() };
}

export function getSettingsCache(): { data: Record<string, string>; ts: number } | null {
  return _settingsCache;
}

export function setSettingsCache(data: Record<string, string>) {
  _settingsCache = { data, ts: Date.now() };
}

/**
 * Call this function whenever any admin mutation happens (products, categories, banners, settings, theme, etc.)
 * This instantly invalidates the server in-memory cache so subsequent visitor requests get fresh DB data.
 */
export function invalidateAllCaches() {
  _homeCache = null;
  _layoutCache = null;
  _settingsCache = null;
}
