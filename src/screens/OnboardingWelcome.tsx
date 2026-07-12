// 00a · Onboarding — Welcome
import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenSurface } from '@/components/Screen';
import AuthBackground from '@/components/AuthBackground';
import { LogoLockup } from '@/components/Logo';
import { IconArrow } from '@/components/Icons';
import { colors, fonts, type, radii, layout } from '@/theme';
import type { RootStackParamList } from '@/navigation/types';

const AUTO_NAV_MS = 2200;

export default function OnboardingWelcome() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const progress = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => nav.replace('Login'), AUTO_NAV_MS);
    Animated.timing(progress, { toValue: 1, duration: AUTO_NAV_MS, useNativeDriver: false }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1100, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => { clearTimeout(timer); loop.stop(); };
  }, [nav, progress, pulse]);

  const goToLogin = () => nav.replace('Login');

  return (
    <ScreenSurface style={{ backgroundColor: 'transparent' }}>
      <AuthBackground/>

      <View style={styles.body}>
        <View style={styles.centerGroup}>
          <LogoLockup/>

          <View style={styles.hero}>
            <View style={styles.kicker}>
              <View style={styles.kickerLine}/>
              <Text style={styles.kickerLabel}>WELCOME</Text>
            </View>
            <Text style={styles.title}>
              Write better <Text style={styles.emphBlue}>essays.</Text>{'\n'}
              Level up your <Text style={styles.emphGreen}>English.</Text>
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.track}>
            <Animated.View style={[styles.fill, {
              width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            }]}/>
          </View>
          <Pressable onPress={goToLogin} hitSlop={12}>
            <Animated.View style={[styles.tapRow, {
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
            }]}>
              <Text style={styles.tapLabel}>Tap to Login</Text>
              <Text style={styles.tapArrow}>→</Text>
            </Animated.View>
          </Pressable>
        </View>
      </View>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1, paddingHorizontal: 32, paddingTop: 40, paddingBottom: 40,
    width: '100%', maxWidth: layout.maxActionWidth, alignSelf: 'center',
  },
  centerGroup: { flex: 1, justifyContent: 'center' },
  hero: { marginTop: 32, gap: 20 },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  kickerLine: { width: 28, height: 2, borderRadius: 2, backgroundColor: colors.brandBlue },
  kickerLabel: { ...type.label, fontFamily: fonts.sansB, letterSpacing: 3, color: colors.textPrimary },
  title: {
    fontFamily: fonts.sansEb, fontSize: 32, lineHeight: 38, letterSpacing: -0.7,
    color: colors.textPrimary,
  },
  emphBlue:  { color: colors.brandBlue },
  emphGreen: { color: colors.brandGreen },
  footer: { alignItems: 'center', gap: 16, paddingHorizontal: 32 },
  track: { width: 120, height: 4, borderRadius: radii.pill, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radii.pill, backgroundColor: colors.brandBlue },
  tapRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tapLabel: {
    fontFamily: fonts.sansB, fontSize: 13, letterSpacing: 2.5, textTransform: 'uppercase',
    color: colors.brandBlue,
  },
  tapArrow: { fontSize: 15, color: colors.brandBlue },
});
