// 00a · Onboarding — Welcome
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenSurface } from '@/components/Screen';
import { LogoMark } from '@/components/Logo';
import Button from '@/components/Button';
import { IconArrow } from '@/components/Icons';
import { colors, fonts, type } from '@/theme';
import type { RootStackParamList } from '@/navigation/types';

export default function OnboardingWelcome() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <ScreenSurface style={{ backgroundColor: '#ECEDFB' }}>
      {/* Cream blob — decorative */}
      <View style={styles.blob}/>

      <View style={styles.body}>
        <LogoMark size={48}/>

        <View style={styles.hero}>
          <Text style={type.label}>WELCOME</Text>
          <Text style={styles.title}>
            Write better <Text style={styles.emphBlue}>essays</Text>.{'\n'}
            Level up your <Text style={styles.emphGreen}>English</Text>.
          </Text>
          <Text style={styles.subtitle}>
            Personalised feedback against the CEFR rubric — from A1 to C1.
          </Text>
        </View>

        <Button kind="primary" onPress={() => nav.navigate('OnboardingLevel')}
          icon={<IconArrow size={18} color="#fff"/>}>
          Get started
        </Button>
        <Text style={styles.signin}>
          Already have an account?{' '}
          <Text style={styles.signinLink} onPress={() => nav.navigate('Login')}>Sign in</Text>
        </Text>
      </View>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute', left: -80, top: 120,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: colors.brandCream, opacity: 0.9,
  },
  body: { flex: 1, padding: 28, paddingTop: 24, paddingBottom: 32 },
  hero: { flex: 1, justifyContent: 'center', marginTop: -40 },
  title: {
    marginTop: 12,
    fontFamily: fonts.sansSb, fontSize: 36, lineHeight: 40, letterSpacing: -0.7,
    color: colors.textPrimary,
  },
  emphBlue:  { fontFamily: fonts.sansEb, color: colors.brandBlue },
  emphGreen: { fontFamily: fonts.sansEb, color: colors.brandGreen },
  subtitle: {
    marginTop: 16, fontFamily: fonts.sans, fontSize: 16, lineHeight: 24,
    color: colors.textSecondary,
  },
  signin: {
    marginTop: 18, textAlign: 'center',
    fontFamily: fonts.sans, fontSize: 14, color: colors.textSecondary,
  },
  signinLink: { fontFamily: fonts.sansSb, color: colors.brandBlue },
});
