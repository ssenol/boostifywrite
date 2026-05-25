// 01 · Login
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenSurface } from '@/components/Screen';
import { LogoWordmark } from '@/components/Logo';
import Button from '@/components/Button';
import { IconArrow } from '@/components/Icons';
import { colors, fonts, radii } from '@/theme';
import type { RootStackParamList } from '@/navigation/types';

export default function Login() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <ScreenSurface style={{ backgroundColor: '#ECEDFB' }}>
      {/* Decorative blob */}
      <View style={styles.blob}/>

      <View style={styles.body}>
        <View style={{ marginTop: 8 }}>
          <LogoWordmark size={32}/>
        </View>

        <View style={{ marginTop: 48 }}>
          <Text style={styles.hero}>
            Every great essay{' '}
            <Text style={styles.heroEmph}>starts with one sentence.</Text>
          </Text>
          <Text style={styles.subtitle}>Sign in and write yours today.</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textTertiary}
            secureTextEntry
          />
        </View>

        <View style={{ marginTop: 18 }}>
          <Button kind="primary" onPress={() => nav.navigate('Main')}
            icon={<IconArrow size={18} color="#fff"/>}>
            Sign in
          </Button>
        </View>

        <View style={{ flex: 1 }}/>

        <Text style={styles.version}>v2.1 · CEFR A1–C1</Text>
      </View>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute', left: -50, top: 110,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: colors.brandCream, opacity: 0.9,
  },
  body: { flex: 1, padding: 24 },
  hero: {
    fontFamily: fonts.sansSb, fontSize: 32, lineHeight: 36, letterSpacing: -0.6,
    color: colors.textPrimary,
  },
  heroEmph: { fontFamily: fonts.sansEb, color: colors.brandBlue, letterSpacing: -0.6 },
  subtitle: {
    marginTop: 14, fontFamily: fonts.sans, fontSize: 15.5, color: colors.textSecondary,
  },
  form: { marginTop: 40, gap: 12 },
  input: {
    height: 52, paddingHorizontal: 18,
    backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radii.md,
    fontFamily: fonts.sans, fontSize: 15, color: colors.textPrimary,
  },
  version: {
    textAlign: 'center', marginBottom: 12,
    fontFamily: fonts.mono, fontSize: 12,
    color: colors.textTertiary, letterSpacing: 1,
  },
});
