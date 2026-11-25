import { prisma } from '@/lib/prisma';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { PincodeModal } from '@/components/common/PincodeModal';
import { BottomNav } from '@/components/common/BottomNav';
import { AuthGate } from '@/components/common/AuthGate';
import { getThemeById, generateCssVariables, ThemeStyles } from '@/lib/themes';
import { getLayoutCache, setLayoutCache, CACHE_TTL } from '@/lib/siteCache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const EMPTY_LAYOUT = {
  settingsMap: {} as Record<string, string>,
  categories: [] as { id: string; name: string; slug: string; icon?: string | null; image?: string | null }[],
};

const getLayoutData = async () => {
  const cached = getLayoutCache();
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
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
    setLayoutCache(settingsMap, dbCategories);
    return { settingsMap, categories: dbCategories };
  } catch {
    if (cached) return cached.data;
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
    ...(settingsMap['theme_primary_color'] ? { primaryColor: settingsMap['theme_primary_color'], primaryHover: settingsMap['theme_primary_color'] } : {}),
    ...(settingsMap['theme_accent_color'] ? { accentColor: settingsMap['theme_accent_color'], accentHover: settingsMap['theme_accent_color'] } : {}),
    ...(settingsMap['theme_bg_color'] ? { bgColor: settingsMap['theme_bg_color'] } : {}),
    ...(settingsMap['theme_header_bg'] ? { headerBg: settingsMap['theme_header_bg'] } : {}),
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
