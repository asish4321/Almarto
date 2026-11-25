import { prisma } from '@/lib/prisma';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { PincodeModal } from '@/components/common/PincodeModal';
import { BottomNav } from '@/components/common/BottomNav';
import { AuthGate } from '@/components/common/AuthGate';
import { getThemeById, generateCssVariables, ThemeStyles } from '@/lib/themes';

// In-memory fallback that survives across requests in the same process
// Works in both dev and production, unlike unstable_cache which dev bypasses
let _layoutCache: {
  settingsMap: Record<string, string>;
  categories: { id: string; name: string; slug: string; icon?: string | null; image?: string | null }[];
  ts: number;
} | null = null;
const LAYOUT_TTL = 5 * 60 * 1000; // 5 minutes

const EMPTY_LAYOUT = {
  settingsMap: {} as Record<string, string>,
  categories: [] as { id: string; name: string; slug: string; icon?: string | null; image?: string | null }[],
};

const getLayoutData = async () => {
  if (_layoutCache && Date.now() - _layoutCache.ts < LAYOUT_TTL) {
    return { settingsMap: _layoutCache.settingsMap, categories: _layoutCache.categories };
  }
  try {
    const result = await Promise.race([
      Promise.all([
        prisma.websiteSetting.findMany({
          where: { key: { not: 'hero_bg_image' } },
          select: { key: true, value: true },
        }),
        prisma.category.findMany({
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          select: { id: true, name: true, slug: true, icon: true, image: true },
        }),
      ]),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('layout timeout')), 10000)
      ),
    ]);
    const [settings, dbCategories] = result;
    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);
    if (dbCategories.length > 0 || settings.length > 0) {
      _layoutCache = { settingsMap, categories: dbCategories, ts: Date.now() };
    }
    return { settingsMap, categories: dbCategories };
  } catch {
    if (_layoutCache) return { settingsMap: _layoutCache.settingsMap, categories: _layoutCache.categories };
    return EMPTY_LAYOUT;
  }
};

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settingsMap, categories } = await getLayoutData();

  const activeThemeId = settingsMap['active_theme_id'] || 'pale_sage_ivory';
  const baseTheme = getThemeById(activeThemeId);
  const themeStyles: ThemeStyles = {
    ...baseTheme.styles,
    bgColor: activeThemeId === 'pale_sage_ivory' ? '#EFE9DF' : (settingsMap['theme_bg_color'] || '#EFE9DF'),
    cardBg: '#FAF6F0',
    headerBg: activeThemeId === 'pale_sage_ivory' ? 'linear-gradient(135deg, #1E332B 0%, #2E4A3E 50%, #3B5A4D 100%)' : (settingsMap['theme_header_bg'] || baseTheme.styles.headerBg),
    primaryColor: activeThemeId === 'pale_sage_ivory' ? '#2E4A3E' : (settingsMap['theme_primary_color'] || baseTheme.styles.primaryColor),
    primaryHover: activeThemeId === 'pale_sage_ivory' ? '#22382F' : (settingsMap['theme_primary_color'] || baseTheme.styles.primaryHover),
    accentColor: activeThemeId === 'pale_sage_ivory' ? '#527863' : (settingsMap['theme_accent_color'] || baseTheme.styles.accentColor),
    accentHover: activeThemeId === 'pale_sage_ivory' ? '#3E5C4B' : (settingsMap['theme_accent_color'] || baseTheme.styles.accentHover),
    borderColor: '#DED6C7',
    headerText: '#FAF6F0',
  };
  const dynamicCss = generateCssVariables(themeStyles);

  return (
    <div className="flex flex-col min-h-screen text-[#1B2721]" style={{ backgroundColor: 'var(--theme-bg, #EFE9DF)' }}>
      <style id="almarto-dynamic-theme" dangerouslySetInnerHTML={{ __html: dynamicCss }} />
      <Header initialSettings={settingsMap} categories={categories} />
      <main className="flex-1 w-full pb-16 md:pb-0" style={{ backgroundColor: 'var(--theme-bg, #EFE9DF)' }}>{children}</main>
      <div className="hidden md:block"><Footer initialSettings={settingsMap} /></div>
      <BottomNav />
      <PincodeModal />
      <AuthGate />
    </div>
  );
}
