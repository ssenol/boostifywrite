// Logo — assets/icon.png (app icon ile birebir aynı mark) + Manrope wordmark.
import React from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '@/theme';

export function LogoMark({ size = 44 }: { size?: number }) {
  return (
    <Image
      source={require('@/../assets/icon.png')}
      style={{ width: size, height: size, borderRadius: size * 0.26 }}
    />
  );
}

export function LogoWordmark({ size = 24 }: { size?: number }) {
  return (
    <Text style={{ fontFamily: fonts.sansB, fontSize: size, letterSpacing: -0.4 }}>
      <Text style={{ color: colors.textPrimary }}>Boostify</Text>
      <Text style={{ color: colors.brandGreen }}>Write</Text>
    </Text>
  );
}

export function LogoLockup({ markSize = 46, textSize = 21 }: { markSize?: number; textSize?: number }) {
  return (
    <View style={styles.row}>
      <LogoMark size={markSize}/>
      <LogoWordmark size={textSize}/>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
