import React from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useTwoColWidths } from '@/hooks/useIsTablet';

type Props = {
  left: React.ReactNode;
  right: React.ReactNode;
  style?: ViewStyle;
  // Sütun genişlik oranı, ör. [0.7, 0.3]. Varsayılan eşit (50/50).
  ratio?: [number, number];
};

// Tablette iki bloğu yan yana, telefonda alt alta gösterir.
// Bloklardan biri boşsa (falsy) diğeri her zaman tam genişlik alır.
export default function ResponsiveTwoCol({ left, right, style, ratio = [0.5, 0.5] }: Props) {
  const widths = useTwoColWidths(ratio);
  const hasLeft  = !!left;
  const hasRight = !!right;

  if (!hasLeft && !hasRight) return null;

  if (widths !== undefined && hasLeft && hasRight) {
    return (
      <View style={[{ flexDirection: 'row', gap: 16 }, style]}>
        <View style={{ width: widths[0] }}>{left}</View>
        <View style={{ width: widths[1] }}>{right}</View>
      </View>
    );
  }

  return (
    <View style={[{ gap: 16 }, style]}>
      {left}
      {right}
    </View>
  );
}
