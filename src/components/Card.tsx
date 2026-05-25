// Card — beyaz yüzey, opsiyonel sol accent şerit.
import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii } from '@/theme';

type Props = {
  children: React.ReactNode;
  accent?: string;       // left stripe color (e.g. rubric color)
  padding?: number;
  style?: ViewStyle;
  onPress?: () => void;
};

export default function Card({ children, accent, padding = 16, style, onPress }: Props) {
  const Wrap: any = onPress ? Pressable : View;
  return (
    <Wrap onPress={onPress} style={[styles.card, { padding }, style]}>
      {accent ? <View style={[styles.accent, { backgroundColor: accent }]}/> : null}
      {children}
    </Wrap>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  accent: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
  },
});
