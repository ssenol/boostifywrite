// ProgressBar — ince yatay progress (Card altları, word count vs.)
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/theme';

type Props = { value: number; color?: string; height?: number; style?: ViewStyle };

export default function ProgressBar({ value, color = colors.rubricCohesion, height = 4, style }: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={[styles.track, { height }, style]}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color, height }]}/>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%', backgroundColor: colors.border,
    borderRadius: 99, overflow: 'hidden',
  },
  fill: { borderRadius: 99 },
});
