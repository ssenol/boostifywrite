// FilterChip — küçük filtre chip'i (label + count + opsiyonel renkli nokta)
import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors, fonts, radii } from '@/theme';

type Props = {
  label: string;
  count?: number;
  color?: string;        // optional left dot color
  active?: boolean;
  onPress?: () => void;
};

export default function FilterChip({ label, count, color, active, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={[
      styles.chip,
      active
        ? { backgroundColor: colors.bgInverse, borderColor: colors.bgInverse }
        : { backgroundColor: colors.bgCard,    borderColor: colors.border },
    ]}>
      {color ? <View style={[styles.dot, { backgroundColor: color }]}/> : null}
      <Text style={[styles.label, { color: active ? '#fff' : colors.textPrimary }]}>{label}</Text>
      {count != null ? (
        <Text style={[styles.count, { color: active ? 'rgba(255,255,255,0.7)' : colors.textTertiary }]}>
          {count}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 7, paddingHorizontal: 12,
    borderRadius: radii.pill, borderWidth: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 99 },
  label: { fontFamily: fonts.sansSb, fontSize: 13 },
  count: { fontFamily: fonts.mono,   fontSize: 12 },
});
