// Generic dimension detail layout — used by Task / Cohesion / Lexical / Grammar.
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import ResultsShell, { ResultsTab } from './ResultsShell';
import Card from '@/components/Card';
import BulletRow from '@/components/BulletRow';
import QuoteBlock from '@/components/QuoteBlock';
import { IconCheck } from '@/components/Icons';
import { colors, fonts, radii, type } from '@/theme';
import type { DimensionData } from './dimensionData';

export default function DimensionScreen({
  tab, dimension,
}: { tab: ResultsTab; dimension: DimensionData }) {
  const d = dimension;
  return (
    <ResultsShell active={tab}>
      {/* Big summary card */}
      <Card padding={18} style={{ borderLeftWidth: 3, borderLeftColor: d.color }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginLeft: 6 }}>
          <View>
            <Text style={[type.label, { marginBottom: 4 }]}>THIS DIMENSION</Text>
            <Text style={styles.dimName}>{d.name}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.dimLevel, { color: d.color }]}>{d.level}</Text>
            <Text style={styles.dimScore}>{d.score}/9</Text>
          </View>
        </View>
        <Text style={styles.dimSummary}>{d.summary}</Text>
      </Card>

      {/* Strengths */}
      <Card padding={14} style={{ marginTop: 12 }}>
        <SectionLabel color={d.color}>STRENGTHS</SectionLabel>
        {d.strengths.map((s, i) => (
          <BulletRow key={i} kind="good" divider={i < d.strengths.length - 1}>{s}</BulletRow>
        ))}
      </Card>

      {/* Work on */}
      <Card padding={14} style={{ marginTop: 12 }}>
        <SectionLabel color={colors.rubricTask}>WORK ON</SectionLabel>
        {d.workOn.map((w, i) => (
          <BulletRow key={i} kind="bad" divider={i < d.workOn.length - 1}>{w}</BulletRow>
        ))}
      </Card>

      {/* From → Try */}
      <Card padding={14} style={{ marginTop: 12 }}>
        <SectionLabel color={d.color}>FROM YOUR WRITING</SectionLabel>
        <QuoteBlock kind="from" style={{ marginTop: 4, borderLeftColor: d.color }}>{`"${d.quoteBad}"`}</QuoteBlock>
        <Text style={[type.labelSm, { marginTop: 12, marginBottom: 6, color: colors.brandGreenDeep }]}>TRY THIS ↓</Text>
        <QuoteBlock kind="try">{`"${d.quoteTry}"`}</QuoteBlock>
      </Card>

      {/* Practice */}
      <Card padding={14} style={{ marginTop: 12 }}>
        <SectionLabel color={colors.textPrimary}>PRACTICE THIS WEEK</SectionLabel>
        {d.practice.map((p, i) => (
          <PracticeRow key={i} text={p} last={i === d.practice.length - 1}/>
        ))}
      </Card>

      <View style={{ height: 16 }}/>
    </ResultsShell>
  );
}

function SectionLabel({ color, children }: { color: string; children: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <View style={{ width: 3, height: 14, backgroundColor: color, borderRadius: 2 }}/>
      <Text style={type.label}>{children}</Text>
    </View>
  );
}

function PracticeRow({ text, last }: { text: string; last: boolean }) {
  const [done, setDone] = useState(false);
  return (
    <Pressable onPress={() => setDone(d => !d)} style={[
      styles.practiceRow, !last && styles.practiceDivider,
    ]}>
      <View style={[
        styles.checkbox,
        done && { backgroundColor: colors.brandGreen, borderWidth: 0 },
      ]}>
        {done && <IconCheck size={12} color="#fff"/>}
      </View>
      <Text style={[
        styles.practiceText,
        done && { color: colors.textSecondary, textDecorationLine: 'line-through' },
      ]}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dimName:    { fontFamily: fonts.sansSb, fontSize: 22, letterSpacing: -0.3, color: colors.textPrimary },
  dimLevel:   { fontFamily: fonts.sansEb, fontSize: 28 },
  dimScore:   { fontFamily: fonts.mono, fontSize: 13, color: colors.textTertiary, marginTop: 2 },
  dimSummary: { marginLeft: 6, marginTop: 12, fontFamily: fonts.sans, fontSize: 14.5, lineHeight: 21, color: colors.textSecondary },

  practiceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  practiceDivider: { borderBottomWidth: 1, borderBottomColor: colors.hairline, borderStyle: 'dashed' },
  checkbox: {
    width: 20, height: 20, borderRadius: 5,
    borderWidth: 1.5, borderColor: colors.borderStrong,
    alignItems: 'center', justifyContent: 'center',
  },
  practiceText: { fontFamily: fonts.sans, fontSize: 14.5, color: colors.textPrimary },
});
