export interface ThemeStyles {
  primaryColor: string;
  primaryHover: string;
  primaryLight: string;
  accentColor: string;
  accentHover: string;
  accentLight: string;
  headerBg: string;
  headerText: string;
  bgColor: string;
  cardBg: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  badge?: string;
  previewColors: string[];
  styles: ThemeStyles;
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'pale_sage_ivory',
    name: 'Pale Sage, Warm Biscuit & Muted Forest Sage',
    description: 'Earthy botanical warmth. Muted forest sage headers and typography paired with pale sage accents on a rich, comforting warm biscuit canvas.',
    category: 'Botanical & Biscuit Earthy',
    badge: 'Active Store Theme',
    previewColors: ['#2E4A3E', '#527863', '#EFE9DF', '#1B2721'],
    styles: {
      primaryColor: '#2E4A3E',
      primaryHover: '#22382F',
      primaryLight: '#DFE8DD',
      accentColor: '#527863',
      accentHover: '#3E5C4B',
      accentLight: '#E8EFE6',
      headerBg: 'linear-gradient(135deg, #1E332B 0%, #2E4A3E 50%, #3B5A4D 100%)',
      headerText: '#FAF6F0',
      bgColor: '#EFE9DF',
      cardBg: '#FAF6F0',
      textColor: '#1B2721',
      mutedColor: '#5F6E66',
      borderColor: '#DED6C7',
    },
  },
  {
    id: 'toy_kingdom',
    name: 'Joyful Toy Kingdom (Child Attractive)',
    description: 'Bright, cheerful, and creative. Vibrant royal electric violet paired with warm sunshine tangerine. Energetic and child-friendly.',
    category: 'Vibrant & Playful',
    badge: 'Default / Recommended',
    previewColors: ['#4F46E5', '#FF7900', '#06B6D4', '#FFFFFF'],
    styles: {
      primaryColor: '#4F46E5',
      primaryHover: '#4338CA',
      primaryLight: '#EEF2FF',
      accentColor: '#FF7900',
      accentHover: '#E05A00',
      accentLight: '#FFF7ED',
      headerBg: 'linear-gradient(135deg, #4338CA 0%, #4F46E5 50%, #6366F1 100%)',
      headerText: '#FFFFFF',
      bgColor: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#0F172A',
      mutedColor: '#64748B',
      borderColor: '#E2E8F0',
    },
  },
  {
    id: 'candy_pop',
    name: 'Candy Pop & Sweet Kawaii',
    description: 'Sweet strawberry pop pink paired with sunshine mango yellow. Playful, vibrant, and loved by kids, girls, and DIY craft creators.',
    category: 'Cute & Playful',
    badge: 'Popular for DIY',
    previewColors: ['#FF2D78', '#FFAA00', '#A855F7', '#FFFFFF'],
    styles: {
      primaryColor: '#FF2D78',
      primaryHover: '#E01E65',
      primaryLight: '#FFF0F5',
      accentColor: '#FFAA00',
      accentHover: '#E69900',
      accentLight: '#FFFBEB',
      headerBg: 'linear-gradient(135deg, #E11D48 0%, #FF2D78 50%, #FF5A92 100%)',
      headerText: '#FFFFFF',
      bgColor: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#1E1B2E',
      mutedColor: '#78716C',
      borderColor: '#FCE7F3',
    },
  },
  {
    id: 'ocean_adventure',
    name: 'Ocean Safari & Aqua Play',
    description: 'Energetic ocean blue and bright citrus lime. Fresh, adventurous, reminiscent of Lego building mechs and outdoor creative fun.',
    category: 'Fresh & Adventurous',
    previewColors: ['#0284C7', '#10B981', '#F59E0B', '#FFFFFF'],
    styles: {
      primaryColor: '#0284C7',
      primaryHover: '#0369A1',
      primaryLight: '#E0F2FE',
      accentColor: '#10B981',
      accentHover: '#059669',
      accentLight: '#ECFDF5',
      headerBg: 'linear-gradient(135deg, #0369A1 0%, #0284C7 60%, #38BDF8 100%)',
      headerText: '#FFFFFF',
      bgColor: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#0C4A6E',
      mutedColor: '#64748B',
      borderColor: '#BAE6FD',
    },
  },
  {
    id: 'sunset_carnival',
    name: 'Sunset Carnival & Festival',
    description: 'Warm coral red and golden sunshine glow. Cheerful, welcoming, and festive holiday toy store feeling.',
    category: 'Warm & Cheerful',
    previewColors: ['#E11D48', '#F59E0B', '#8B5CF6', '#FFFFFF'],
    styles: {
      primaryColor: '#E11D48',
      primaryHover: '#BE123C',
      primaryLight: '#FFE4E6',
      accentColor: '#F59E0B',
      accentHover: '#D97706',
      accentLight: '#FEF3C7',
      headerBg: 'linear-gradient(135deg, #BE123C 0%, #E11D48 60%, #FB7185 100%)',
      headerText: '#FFFFFF',
      bgColor: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#1C1917',
      mutedColor: '#78716C',
      borderColor: '#FED7AA',
    },
  },
  {
    id: 'cyber_neon',
    name: 'Cyber Neon & Arcade',
    description: 'Electric neon purple and cyan arcade glow. Loved by young creators, anime fans, and mech builders.',
    category: 'Modern Gamer',
    previewColors: ['#7C3AED', '#06B6D4', '#F43F5E', '#FFFFFF'],
    styles: {
      primaryColor: '#7C3AED',
      primaryHover: '#6D28D9',
      primaryLight: '#F5F3FF',
      accentColor: '#06B6D4',
      accentHover: '#0891B2',
      accentLight: '#ECFEFF',
      headerBg: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 60%, #9333EA 100%)',
      headerText: '#FFFFFF',
      bgColor: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#0F172A',
      mutedColor: '#64748B',
      borderColor: '#E2E8F0',
    },
  },
  {
    id: 'royal_classic',
    name: 'Royal Purple (Original Classic)',
    description: 'The original dark purple and orange colorway.',
    category: 'Original Classic',
    previewColors: ['#35109B', '#FF7900', '#1A0553', '#FFFFFF'],
    styles: {
      primaryColor: '#35109B',
      primaryHover: '#270A77',
      primaryLight: '#F2EFFF',
      accentColor: '#FF7900',
      accentHover: '#EA580C',
      accentLight: '#FFF6ED',
      headerBg: '#35109B',
      headerText: '#FFFFFF',
      bgColor: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#19152B',
      mutedColor: '#777487',
      borderColor: '#E7E5F0',
    },
  },
];

export function getThemeById(id?: string | null): ThemeDefinition {
  if (!id) return THEMES[0];
  const found = THEMES.find((t) => t.id === id);
  return found || THEMES[0];
}

export function generateCssVariables(styles: ThemeStyles): string {
  return `
    :root {
      --primary-color: ${styles.primaryColor};
      --primary-hover: ${styles.primaryHover};
      --primary-light: ${styles.primaryLight};
      --accent-color: ${styles.accentColor};
      --accent-hover: ${styles.accentHover};
      --accent-light: ${styles.accentLight};
      --theme-bg: ${styles.bgColor};
      --theme-card-bg: ${styles.cardBg};
      --theme-text: ${styles.textColor};
      --theme-muted: ${styles.mutedColor};
      --theme-border: ${styles.borderColor};
      --theme-header-bg: ${styles.headerBg};
      --theme-header-text: ${styles.headerText};

      /* Backwards-compatibility aliases */
      --brand-purple: ${styles.primaryColor};
      --brand-orange: ${styles.accentColor};
      --brand-bg: ${styles.bgColor};
      --brand-text: ${styles.textColor};
      --brand-border: ${styles.borderColor};
    }
  `.trim();
}
