// Avatar — fotoğraf varsa gösterir, yoksa baş harfleri.
import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { colors, fonts } from '@/theme';

type Props = { initials?: string; avatarUrl?: string; size?: number; onPress?: () => void };

export default function Avatar({ initials = 'XY', avatarUrl, size = 52, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={{ borderRadius: size / 2 }}>
      <View style={[styles.box, { width: size, height: size, borderRadius: size / 2 }]}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={{ width: size, height: size, borderRadius: size / 2 }} />
        ) : (
          <Text style={[styles.text, { fontSize: Math.round(size * 0.33) }]}>{initials}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.brandBlueSoft,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    fontFamily: fonts.sansEb, color: colors.brandBlue, letterSpacing: 0.3,
  },
});
