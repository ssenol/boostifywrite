// Button — primary / dark / ghost. Tam yuvarlak (pill).
import React from 'react';
import { Pressable, Text, View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, fonts } from '@/theme';

type Props = {
  children: string;
  kind?: 'primary' | 'dark' | 'ghost';
  onPress?: () => void;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
};

const KINDS = {
  primary: { bg: colors.brandBlue,  fg: '#fff' },
  dark:    { bg: colors.bgInverse,  fg: '#fff' },
  ghost:   { bg: 'transparent',     fg: colors.textPrimary },
} as const;

export default function Button({ children, kind = 'primary', onPress, fullWidth = true, icon, style }: Props) {
  const k = KINDS[kind];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: k.bg, width: fullWidth ? '100%' : 'auto', transform: [{ scale: pressed ? 0.98 : 1 }] },
        kind === 'ghost' && { borderWidth: 1, borderColor: colors.border },
        style,
      ]}
    >
      <Text style={[styles.label, { color: k.fg }]}>{children}</Text>
      {icon ? <View style={{ marginLeft: 8 }}>{icon}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52, borderRadius: radii.pill,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 22,
  },
  label: {
    fontFamily: fonts.sansSb, fontSize: 15, letterSpacing: 0.15,
  },
});
