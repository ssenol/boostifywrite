// Avatar — yazar baş harfleri yuvarlak içinde.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '@/theme';

type Props = { initials?: string; size?: number };

export default function Avatar({ initials = 'EY', size = 40 }: Props) {
  return (
    <View style={[styles.box, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.text, { fontSize: Math.round(size * 0.33) }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.brandBlueSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  text: {
    fontFamily: fonts.sansEb, color: colors.brandBlue, letterSpacing: 0.3,
  },
});
