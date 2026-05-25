// StatTile — küçük kare etiketli sayı kutusu (LENGTH / TIME / RUBRIC vs.)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radii } from '@/theme';

type Props = { label: string; value: string };

export default function StatTile({ label, value }: Props) {
  return (
    <View style={styles.box}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 10, paddingHorizontal: 12,
  },
  label: {
    fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.4,
    textTransform: 'uppercase', color: colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontFamily: fonts.monoSb, fontSize: 15, color: colors.textPrimary,
  },
});
