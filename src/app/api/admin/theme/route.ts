import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { THEMES, getThemeById, ThemeStyles } from '@/lib/themes';
import { invalidateAllCaches } from '@/lib/siteCache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await requireAdmin();
  } catch (err: any) {
    return NextResponse.json({ message: 'Unauthorized. Admin privileges required.' }, { status: err?.statusCode || 403 });
  }

  try {
    const settings = await prisma.websiteSetting.findMany({
      where: {
        key: {
          in: [
            'active_theme_id',
            'theme_primary_color',
            'theme_accent_color',
            'theme_bg_color',
            'theme_header_bg',
          ],
        },
      },
    });

    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    const activeThemeId = settingsMap['active_theme_id'] || 'toy_kingdom';
    const baseTheme = getThemeById(activeThemeId);

    const activeThemeStyles: ThemeStyles = {
      ...baseTheme.styles,
      bgColor: '#FFFFFF',
      ...(settingsMap['theme_primary_color'] ? { primaryColor: settingsMap['theme_primary_color'], primaryHover: settingsMap['theme_primary_color'] } : {}),
      ...(settingsMap['theme_accent_color'] ? { accentColor: settingsMap['theme_accent_color'], accentHover: settingsMap['theme_accent_color'] } : {}),
      ...(settingsMap['theme_bg_color'] ? { bgColor: settingsMap['theme_bg_color'] } : {}),
      ...(settingsMap['theme_header_bg'] ? { headerBg: settingsMap['theme_header_bg'] } : {}),
    };

    return NextResponse.json({
      activeThemeId,
      activeTheme: {
        ...baseTheme,
        styles: activeThemeStyles,
      },
      themes: THEMES,
    });
  } catch (error) {
    console.error('Fetch theme error:', error);
    return NextResponse.json({
      activeThemeId: 'toy_kingdom',
      activeTheme: THEMES[0],
      themes: THEMES,
    });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return NextResponse.json({ message: 'Unauthorized. Admin privileges required.' }, { status: err?.statusCode || 403 });
  }

  try {
    const body = await request.json();
    const { themeId, customStyles } = body;

    if (!themeId) {
      return NextResponse.json({ message: 'Theme ID is required' }, { status: 400 });
    }

    const updates: { key: string; value: string }[] = [
      { key: 'active_theme_id', value: themeId },
    ];

    if (customStyles) {
      if (customStyles.primaryColor) updates.push({ key: 'theme_primary_color', value: customStyles.primaryColor });
      if (customStyles.accentColor) updates.push({ key: 'theme_accent_color', value: customStyles.accentColor });
      if (customStyles.bgColor) updates.push({ key: 'theme_bg_color', value: customStyles.bgColor });
      if (customStyles.headerBg) updates.push({ key: 'theme_header_bg', value: customStyles.headerBg });
    } else {
      // If a preset theme is selected without custom overrides, clear custom overrides so preset works 100%
      const selected = getThemeById(themeId);
      updates.push({ key: 'theme_primary_color', value: selected.styles.primaryColor });
      updates.push({ key: 'theme_accent_color', value: selected.styles.accentColor });
      updates.push({ key: 'theme_bg_color', value: selected.styles.bgColor });
      updates.push({ key: 'theme_header_bg', value: selected.styles.headerBg });
    }

    for (const item of updates) {
      await prisma.websiteSetting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      });
    }

    invalidateAllCaches();
    revalidatePath('/', 'layout');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: 'Store theme updated successfully! Changes are live across the website.',
      themeId,
    });
  } catch (error) {
    console.error('Update theme error:', error);
    return NextResponse.json({ message: 'Failed to update theme' }, { status: 500 });
  }
}
