// 00b · Onboarding — Pick CEFR level
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenSurface } from '@/components/Screen';
import LevelBadge from '@/components/LevelBadge';
import Button from '@/components/Button';
import { IconArrow, IconCheckFilled } from '@/components/Icons';
import { colors, fonts, type, radii } from '@/theme';
import type { RootStackParamList } from '@/navigation/types';

const LEVELS = [
  { l: 'A1', desc: 'I know basic words and phrases.' },
  { l: 'A2', desc: 'I can write simple texts about familiar topics.' },
  { l: 'B1', desc: 'I can write connected text on familiar subjects.' },
  { l: 'B2', desc: 'I write clear, detailed text on a wide range.' },
  { l: 'C1', desc: 'I express ideas fluently and spontaneously.' },
];

export default function OnboardingLevel() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [pick, setPick] = useState('A2');
  return (
    <ScreenSurface>
      <View style={styles.body}>
        <Text style={type.label}>STEP 1 OF 2</Text>
        <Text style={styles.title}>
          What's your current <Text style={styles.emph}>CEFR level?</Text>
        </Text>
        <Text style={styles.subtitle}>
          You can change this later — we'll re-evaluate as you write.
        </Text>

        <View style={{ marginTop: 22, gap: 10 }}>
          {LEVELS.map(({ l, desc }) => {
            const active = pick === l;
            return (
              <Pressable key={l} onPress={() => setPick(l)} style={[
                styles.row,
                { borderColor: active ? colors.brandBlue : colors.border, borderWidth: active ? 2 : 1 },
              ]}>
                <LevelBadge level={l} size="md"/>
                <Text style={styles.rowDesc}>{desc}</Text>
                {active ? <IconCheckFilled size={20} bg={colors.brandBlue}/> : null}
              </Pressable>
            );
          })}
        </View>

        <View style={{ flex: 1 }}/>

        <Button kind="primary" onPress={() => nav.navigate('Login')}
          icon={<IconArrow size={18} color="#fff"/>}>
          Continue
        </Button>
      </View>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, padding: 24 },
  title: {
    fontFamily: fonts.sansSb, fontSize: 26, lineHeight: 31, letterSpacing: -0.5,
    color: colors.textPrimary, marginTop: 6,
  },
  emph:  { fontFamily: fonts.sansEb, color: colors.brandBlue },
  subtitle: {
    marginTop: 8, fontFamily: fonts.sans, fontSize: 14, color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 14, backgroundColor: colors.bgCard,
    borderRadius: radii.md,
  },
  rowDesc: { flex: 1, fontFamily: fonts.sans, fontSize: 13.5, color: colors.textSecondary, lineHeight: 18 },
});
