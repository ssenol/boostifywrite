// 05 · Evaluating — animated loading state
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenSurface } from '@/components/Screen';
import Card from '@/components/Card';
import ProgressRing from '@/components/ProgressRing';
import { IconCheckFilled } from '@/components/Icons';
import { colors, fonts, type } from '@/theme';
import type { HomeStackParamList } from '@/navigation/types';

const ITEMS = [
  { label: 'Task Achievement',      threshold: 28 },
  { label: 'Coherence & Cohesion',  threshold: 52 },
  { label: 'Lexical Range',         threshold: 76 },
  { label: 'Grammatical Accuracy',  threshold: 99 },
];

export default function Evaluating() {
  const nav = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const t = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const next = Math.min(100, (elapsed / 14) * 100);
      setPct(Math.round(next));
      if (next >= 100) {
        clearInterval(t);
        // Auto-advance to results after 1.5s
        setTimeout(() => nav.replace('ResultsOverview', { id: 1 }), 1500);
      }
    }, 60);
    return () => clearInterval(t);
  }, [nav]);

  return (
    <ScreenSurface style={{ backgroundColor: '#ECEDFB' }}>
      {/* Cream blob */}
      <View style={styles.blob}/>

      <View style={styles.body}>
        {/* Submitted header */}
        <View>
          <View style={styles.subHeader}>
            <View style={styles.dot}/>
            <Text style={[type.labelSm, { color: colors.textSecondary }]}>SUBMITTED · 9:41</Text>
          </View>
          <Text style={styles.title}>My Town & Neighbourhood</Text>
          <Text style={styles.meta}>247 words · A2 essay</Text>
        </View>

        {/* Center hero */}
        <View style={styles.hero}>
          <View style={{ position: 'relative' }}>
            <ProgressRing value={pct} size={150} stroke={5} color={colors.brandBlue}/>
            <View style={styles.pctWrap}>
              <Text style={styles.pctText}>{pct}%</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Reading your essay…</Text>
          <Text style={styles.heroSubtitle}>
            Evaluating against 4 rubric dimensions.{'\n'}
            This usually takes about 30 seconds.
          </Text>
        </View>

        {/* Checklist */}
        <Card padding={16}>
          {ITEMS.map((it, i) => {
            const done = pct >= it.threshold;
            const reading = !done && pct >= (i === 0 ? 0 : ITEMS[i - 1].threshold);
            return (
              <View key={it.label} style={[
                styles.checkRow, i < ITEMS.length - 1 && styles.divider,
              ]}>
                {done ? (
                  <IconCheckFilled size={20} bg={colors.success}/>
                ) : (
                  <View style={[
                    styles.radio,
                    { borderColor: reading ? colors.brandBlue : colors.borderStrong },
                  ]}>
                    {reading && <View style={[styles.radioDot, { backgroundColor: colors.brandBlue }]}/>}
                  </View>
                )}
                <Text style={[
                  styles.itemLabel,
                  { fontFamily: reading ? fonts.sansB : fonts.sansSb,
                    color: done ? colors.textTertiary : colors.textPrimary,
                    textDecorationLine: done ? 'line-through' : 'none' },
                ]}>{it.label}</Text>
                <Text style={[
                  styles.itemStatus,
                  { color: done ? colors.success : colors.brandBlue },
                ]}>{done ? '✓' : reading ? 'reading…' : ''}</Text>
              </View>
            );
          })}
        </Card>
      </View>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute', left: -50, bottom: 80,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: colors.brandCream, opacity: 0.85,
  },
  body: { flex: 1, padding: 24 },

  subHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  dot: { width: 6, height: 6, borderRadius: 99, backgroundColor: colors.textTertiary },
  title: { fontFamily: fonts.sansSb, fontSize: 22, color: colors.textPrimary, letterSpacing: -0.3 },
  meta:  { fontFamily: fonts.mono, fontSize: 13, color: colors.textTertiary, marginTop: 4 },

  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -10 },
  pctWrap: { position: 'absolute', inset: 0 as any, alignItems: 'center', justifyContent: 'center' },
  pctText: { fontFamily: fonts.sansEb, fontSize: 22, color: colors.brandBlue },
  heroTitle: { marginTop: 20, fontFamily: fonts.sansSb, fontSize: 28, letterSpacing: -0.4 },
  heroSubtitle: { marginTop: 8, textAlign: 'center', fontFamily: fonts.sans, fontSize: 14, color: colors.textSecondary, lineHeight: 21 },

  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  divider:  { borderBottomWidth: 1, borderBottomColor: colors.hairline, borderStyle: 'dashed' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 8, height: 8, borderRadius: 4 },
  itemLabel: { flex: 1, fontSize: 14.5 },
  itemStatus: { fontFamily: fonts.mono, fontSize: 12 },
});
