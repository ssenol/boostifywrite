// boostifywrite — Design Tokens
// Bu dosya tokens.css ile birebir aynı değerleri taşır. Tek doğruluk
// kaynağıdır — bir renk/spacing değişikliği TEK BURADAN yapılır.
// ─────────────────────────────────────────────────────────────────

import type { ViewStyle, TextStyle } from 'react-native';

export const colors = {
  // ── Brand ──
  brandBlue:       '#3D44F0',
  brandBlueDeep:   '#2A30C8',
  brandBlueSoft:   '#E4E6FF',
  brandBlueTint:   '#EFF0FA', // app background

  brandGreen:      '#6BB845',
  brandGreenSoft:  '#E8F4DD',
  brandGreenDeep:  '#2F7A1E',

  brandPink:       '#E63284',
  brandOrange:     '#F26D2A',
  brandCream:      '#F2EBD8',

  // ── Rubric (CEFR dimensions) ──
  rubricTask:           '#4F46E5',
  rubricTaskSoft:       '#E0DEFB',
  rubricCohesion:       '#1F94DC',
  rubricCohesionSoft:   '#DCEEFA',
  rubricLexical:        '#16A34A',
  rubricLexicalSoft:    '#DCF1E2',
  rubricGrammar:        '#C99016',
  rubricGrammarSoft:    '#F4E9C9',

  // ── Neutral surfaces ──
  bgApp:           '#EFF0FA',
  bgCard:          '#FFFFFF',
  bgCardTint:      '#F7F8FE',
  bgInverse:       '#0E1116',
  bgInverse2:      '#181C26',

  // ── Text ──
  textPrimary:        '#0E1116',
  textSecondary:      '#5A5F73',
  textTertiary:       '#9097AC',
  textDisabled:       '#C2C7D6',
  textInverse:        '#FFFFFF',
  textInverseSoft:    'rgba(255,255,255,0.62)',

  // ── Borders ──
  border:        '#E4E6F0',
  borderStrong:  '#D2D5E2',
  hairline:      '#EAECF4',

  // ── State ──
  success:    '#16A34A',
  warning:    '#C99016',
  orange:     '#F97316',
  danger:     '#DC2626',
  dangerSoft: '#ffd4d4',
  info:       '#1F94DC',

  // ── Auth ekranları (Welcome / Login) — gradient zemin ──
  authBgStart: '#F3F7FE',
  authBgMid:   '#FBFCFE',
  authBgEnd:   '#F6FAF0',
} as const;

// ── Spacing (4-pt grid) ──
export const spacing = {
  s1: 4, s2: 8, s3: 12, s4: 16, s5: 20,
  s6: 24, s7: 28, s8: 32, s10: 40, s12: 48,
} as const;

// ── Radii ──
export const radii = {
  xs: 6, sm: 8, md: 12, lg: 16, xl: 20, pill: 9999,
} as const;

// ── Typography ──
// font families: Manrope (sans, primary) + JetBrainsMono (mono, labels).
// Both loaded via expo-font in App.tsx.
export const fonts = {
  sans:   'Manrope_500Medium',
  sansSb: 'Manrope_600SemiBold',
  sansB:  'Manrope_700Bold',
  sansEb: 'Manrope_800ExtraBold',
  mono:   'JetBrainsMono_500Medium',
  monoSb: 'JetBrainsMono_600SemiBold',
} as const;

export const type = {
  displayXL: { fontFamily: fonts.sansSb, fontSize: 34, lineHeight: 38, letterSpacing: -0.7 } as TextStyle,
  displayLG: { fontFamily: fonts.sansSb, fontSize: 28, lineHeight: 32, letterSpacing: -0.5 } as TextStyle,
  displayMD: { fontFamily: fonts.sansSb, fontSize: 22, lineHeight: 27, letterSpacing: -0.3 } as TextStyle,
  displaySM: { fontFamily: fonts.sansSb, fontSize: 19, lineHeight: 24 } as TextStyle,
  bodyLG:    { fontFamily: fonts.sans,   fontSize: 17, lineHeight: 25 } as TextStyle,
  body:      { fontFamily: fonts.sans,   fontSize: 15, lineHeight: 22 } as TextStyle,
  bodySm:    { fontFamily: fonts.sans,   fontSize: 14, lineHeight: 20 } as TextStyle,
  caption:   { fontFamily: fonts.sans,   fontSize: 13, lineHeight: 18 } as TextStyle,
  label:     {
    fontFamily: fonts.mono, fontSize: 12, lineHeight: 16,
    letterSpacing: 1.4, color: colors.textSecondary,
  } as TextStyle,
  labelSm:   {
    fontFamily: fonts.mono, fontSize: 11, lineHeight: 14,
    letterSpacing: 1.5, color: colors.textTertiary,
  } as TextStyle,
  emphasis:  { fontFamily: fonts.sansEb, color: colors.brandBlue } as TextStyle,
} as const;

// ── Elevation (iOS shadow* + Android elevation) ──
export const shadow = {
  xs: {
    shadowColor: '#0E1116', shadowOpacity: 0.04, shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 }, elevation: 1,
  } as ViewStyle,
  sm: {
    shadowColor: '#0E1116', shadowOpacity: 0.06, shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 }, elevation: 2,
  } as ViewStyle,
  md: {
    shadowColor: '#0E1116', shadowOpacity: 0.08, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  } as ViewStyle,
  lg: {
    shadowColor: '#0E1116', shadowOpacity: 0.12, shadowRadius: 28,
    shadowOffset: { width: 0, height: 8 }, elevation: 8,
  } as ViewStyle,
} as const;

export const motion = {
  fast: 140,
  base: 220,
  slow: 400,
} as const;

// ── CEFR Band tablosu (0–100 puan skalası) ────────────────────────────
export type CefrBand = {
  min: number; max: number;
  level: string; label: string;
  color: string; bg: string;
};

export const CEFR_BANDS: CefrBand[] = [
  { min: 0,  max: 29,  level: 'Pre-A1', label: 'Below A1',                 color: '#B7B7B7', bg: '#F5F5F5' },
  { min: 30, max: 39,  level: 'A1',     label: 'Beginner',                 color: '#FE1900', bg: '#FFECEA' },
  { min: 40, max: 49,  level: 'A1+',    label: 'High Beginner',            color: '#FF6B00', bg: '#FFEEDD' },
  { min: 50, max: 59,  level: 'A2',     label: 'Elementary',               color: '#FF8800', bg: '#FFEFDB' },
  { min: 60, max: 69,  level: 'A2+',    label: 'High Elementary',          color: '#FFB300', bg: '#FFF4D6' },
  { min: 70, max: 79,  level: 'B1',     label: 'Intermediate',             color: '#FFC107', bg: '#FFF8DD' },
  { min: 80, max: 84,  level: 'B1+',    label: 'High Intermediate',        color: '#9BCB3E', bg: '#F1F8E1' },
  { min: 85, max: 89,  level: 'B2',     label: 'Upper Intermediate',       color: '#4CAF50', bg: '#E5F4E6' },
  { min: 90, max: 93,  level: 'B2+',    label: 'High Upper Intermediate',  color: '#00BCD4', bg: '#DAF5F9' },
  { min: 94, max: 96,  level: 'C1',     label: 'Advanced',                 color: '#3E4EF0', bg: '#E7E9FF' },
  { min: 97, max: 98,  level: 'C1+',    label: 'High Advanced',            color: '#6366F1', bg: '#E5E7FF' },
  { min: 99, max: 100, level: 'C2',     label: 'Mastery',                  color: '#8B5CF6', bg: '#EFE9FF' },
];

export const CEFR_FALLBACK: CefrBand = {
  min: 0, max: 0, level: '-', label: 'Not evaluated', color: '#B7B7B7', bg: '#F5F5F5',
};

export function getCefrBand(score: number): CefrBand {
  return CEFR_BANDS.find(b => score >= b.min && score <= b.max) ?? CEFR_FALLBACK;
}

// CEFR level string → renk. LevelBadge ve diğer string-tabanlı kullanımlar için.
export const levelColor = (level: string): { fg: string; bg: string } => {
  const band = CEFR_BANDS.find(b => b.level === level);
  if (band) return { fg: band.color, bg: band.bg };
  // Partial match fallback
  if (level.startsWith('C'))  return { fg: '#3E4EF0', bg: '#E7E9FF' };
  if (level.startsWith('B2')) return { fg: '#00BCD4', bg: '#DAF5F9' };
  if (level.startsWith('B1')) return { fg: '#9BCB3E', bg: '#F1F8E1' };
  if (level.startsWith('B'))  return { fg: '#FFC107', bg: '#FFF8DD' };
  if (level.startsWith('A2')) return { fg: '#FF8800', bg: '#FFEFDB' };
  if (level.startsWith('A1')) return { fg: '#FE1900', bg: '#FFECEA' };
  return { fg: CEFR_FALLBACK.color, bg: CEFR_FALLBACK.bg };
};

// Tek satır export — `import t from '@/theme'`
const theme = { colors, spacing, radii, fonts, type, shadow, motion, levelColor, getCefrBand, CEFR_BANDS };
export default theme;
