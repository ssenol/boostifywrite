// StatusPill — durum chip'i (Due today, Evaluated, In progress, vs.)
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, fonts, radii } from '@/theme';

type Kind = 'due' | 'evaluated' | 'submitted' | 'progress' | 'warning';
type Props = { kind?: Kind; children: string; style?: ViewStyle };

const MAP: Record<Kind, { color: string; bg: string; dot?: string }> = {
  due:        { color: colors.brandBlue,       bg: colors.brandBlueSoft },
  evaluated:  { color: colors.brandGreenDeep,  bg: 'transparent', dot: colors.brandGreen },
  submitted:  { color: colors.textSecondary,   bg: 'transparent', dot: colors.textTertiary },
  progress:   { color: colors.rubricCohesion,  bg: colors.rubricCohesionSoft },
  warning:    { color: colors.rubricGrammar,   bg: colors.rubricGrammarSoft },
};

export default function StatusPill({ kind = 'due', children, style }: Props) {
  const m = MAP[kind];
  const padded = m.bg !== 'transparent';
  return (
    <View style={[
      styles.pill,
      { backgroundColor: m.bg, paddingHorizontal: padded ? 8 : 0, paddingVertical: padded ? 3 : 0 },
      style,
    ]}>
      {m.dot ? <View style={[styles.dot, { backgroundColor: m.dot }]}/> : null}
      <Text style={[styles.text, { color: m.color }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: fonts.mono, fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase',
  },
  dot: { width: 6, height: 6, borderRadius: 99 },
});
