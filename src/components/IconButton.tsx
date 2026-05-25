// IconButton — küçük yuvarlak chrome buton (back, kebab, download vs.)
import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii } from '@/theme';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  size?: number;        // default 36 (lg), 28 small
  filled?: boolean;     // colored bg
  style?: ViewStyle;
};

export default function IconButton({ children, onPress, size = 36, filled, style }: Props) {
  return (
    <Pressable onPress={onPress} style={[
      styles.btn,
      {
        width: size, height: size,
        backgroundColor: filled ? colors.brandBlue : colors.bgCard,
        borderColor: filled ? colors.brandBlue : colors.border,
      },
      style,
    ]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radii.pill, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
});
