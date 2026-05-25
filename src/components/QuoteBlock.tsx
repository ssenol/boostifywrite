// QuoteBlock — "From your writing" (gri) / "Try this" (yeşil) alıntı kartı.
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, fonts, radii } from '@/theme';

type Props = { kind?: 'from' | 'try'; children: string; style?: ViewStyle };

const STYLE = {
  from: { bg: colors.bgCardTint,    border: colors.border, accent: colors.rubricTask },
  try:  { bg: colors.brandGreenSoft, border: '#CFE8BB',     accent: colors.success },
} as const;

export default function QuoteBlock({ kind = 'from', children, style }: Props) {
  const s = STYLE[kind];
  return (
    <View style={[
      styles.box,
      { backgroundColor: s.bg, borderColor: s.border, borderLeftColor: s.accent },
      style,
    ]}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1, borderLeftWidth: 3,
    borderRadius: radii.md,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  text: {
    fontFamily: fonts.sansEb, fontSize: 15, lineHeight: 22,
    color: colors.textPrimary, letterSpacing: -0.3,
  },
});
