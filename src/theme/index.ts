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
  success: '#16A34A',
  warning: '#C99016',
  danger:  '#DC2626',
  info:    '#1F94DC',
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

// CEFR seviyesi → renk haritalama. Tüm LevelBadge'lerin tek noktası.
export const levelColor = (level: string): { fg: string; bg: string } => {
  if (level.startsWith('A1')) return { fg: '#8B5CF6', bg: '#EFE7FF' };
  if (level.startsWith('A2')) return { fg: colors.rubricTask, bg: colors.rubricTaskSoft };
  if (level.startsWith('B1')) return { fg: colors.brandGreenDeep, bg: colors.brandGreenSoft };
  if (level.startsWith('B2')) return { fg: '#0E7490', bg: '#CFFAFE' };
  return { fg: '#C2410C', bg: '#FED7AA' };
};

// Tek satır export — `import t from '@/theme'`
const theme = { colors, spacing, radii, fonts, type, shadow, motion, levelColor };
export default theme;
