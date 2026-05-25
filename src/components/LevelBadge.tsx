// LevelBadge — CEFR seviye chip'i (A1, A2, B1, B1+ vs)
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { fonts, levelColor, radii } from '@/theme';

type Props = { level: string; size?: 'xs' | 'sm' | 'md' | 'lg'; style?: ViewStyle };

const SIZES = {
  xs: { fs: 11, py: 1, px: 6  },
  sm: { fs: 12, py: 2, px: 8  },
  md: { fs: 14, py: 4, px: 10 },
  lg: { fs: 18, py: 4, px: 12 },
};

export default function LevelBadge({ level, size = 'sm', style }: Props) {
  const c = levelColor(level);
  const s = SIZES[size];
  return (
    <View style={[
      styles.badge,
      { backgroundColor: c.bg, paddingVertical: s.py, paddingHorizontal: s.px },
      style,
    ]}>
      <Text style={[styles.text, { color: c.fg, fontSize: s.fs }]}>{level}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radii.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: fonts.monoSb,
    letterSpacing: 0.4,
  },
});
