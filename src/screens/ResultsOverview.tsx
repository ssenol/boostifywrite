// 06 · Results · Overview
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ResultsShell from './ResultsShell';
import Card from '@/components/Card';
import RubricBar from '@/components/RubricBar';
import { IconArrowUp, IconChevRight } from '@/components/Icons';
import { colors, fonts, radii, type } from '@/theme';
import type { HomeStackParamList } from '@/navigation/types';

type Nav   = NativeStackNavigationProp<HomeStackParamList>;
type Route = RouteProp<HomeStackParamList, 'ResultsOverview'>;

export default function ResultsOverview() {
  const nav   = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { solvedTaskId } = route.params;
  return (
    <ResultsShell active="Overview" solvedTaskId={solvedTaskId}>
      {/* Overall CEFR — dark hero card */}
      <View style={styles.heroCard}>
        <View style={styles.heroBlob}/>
        <View>
          <Text style={[type.label, { color: colors.textInverseSoft, marginBottom: 6 }]}>OVERALL CEFR</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 12 }}>
            <Text style={styles.heroBig}>B1+</Text>
            <Text style={styles.heroScore}>5.8/9</Text>
          </View>
          <Text style={styles.heroSub}>
            Strong B1 — next level{' '}
            <Text style={{ fontFamily: fonts.sansEb }}>B2</Text>
          </Text>
          <View style={styles.insight}>
            <IconArrowUp size={13} color="#fff"/>
            <Text style={styles.insightText}>Grammar accuracy is your biggest lever</Text>
          </View>
        </View>
      </View>

      {/* By dimension */}
      <View style={{ marginTop: 22 }}>
        <Text style={[type.label, { marginBottom: 12 }]}>BY DIMENSION</Text>
        <View style={{ gap: 10 }}>
          <RubricBar label="Task Achievement"     score={6.5} level="B1+" color={colors.rubricTask}
            onPress={() => nav.navigate('ResultsTask', { solvedTaskId })}/>
          <RubricBar label="Coherence & Cohesion" score={6}   level="B1+" color={colors.rubricCohesion}
            onPress={() => nav.navigate('ResultsCohesion', { solvedTaskId })}/>
          <RubricBar label="Lexical Range"        score={5.5} level="B1"  color={colors.rubricLexical}
            onPress={() => nav.navigate('ResultsLexical', { solvedTaskId })}/>
          <RubricBar label="Grammatical Accuracy" score={5}   level="B1"  color={colors.rubricGrammar}
            onPress={() => nav.navigate('ResultsGrammar', { solvedTaskId })}/>
        </View>
      </View>

      {/* Top 3 actions */}
      <View style={{ marginTop: 22 }}>
        <Text style={[type.label, { marginBottom: 10 }]}>TOP 3 ACTIONS</Text>
        <View style={{ gap: 8 }}>
          <ActionRow n={1} color={colors.rubricGrammar}  text="Fix the 7 grammar errors"/>
          <ActionRow n={2} color={colors.rubricCohesion} text="Replace basic linkers"/>
          <ActionRow n={3} color={colors.rubricTask}     text="Strengthen opinion in conclusion"/>
        </View>
      </View>

      {/* Teacher note */}
      <View style={styles.teacherNote}>
        <Text style={[type.label, { marginBottom: 8 }]}>TEACHER NOTE</Text>
        <Text style={styles.teacherText}>
          "Nice progress on structure, Elif. Focus on linkers and a clearer stance this week and you'll see a B2."
        </Text>
      </View>
    </ResultsShell>
  );
}

function ActionRow({ n, color, text }: { n: number; color: string; text: string }) {
  return (
    <Card padding={14} style={{ borderLeftWidth: 3, borderLeftColor: color, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Text style={styles.actionNum}>{n}</Text>
      <Text style={styles.actionText}>{text}</Text>
      <IconChevRight size={14} color={colors.textTertiary}/>
    </Card>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    position: 'relative', overflow: 'hidden',
    backgroundColor: colors.bgInverse,
    borderRadius: radii.lg,
    padding: 22, paddingTop: 20, paddingBottom: 18,
  },
  heroBlob: {
    position: 'absolute', right: -40, top: -30,
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: '#1F2A6E',
  },
  heroBig:   { fontFamily: fonts.sansEb, fontSize: 52, color: '#fff', letterSpacing: -1, lineHeight: 52 },
  heroScore: { fontFamily: fonts.sansSb, fontSize: 16, color: colors.textInverseSoft },
  heroSub:   { fontFamily: fonts.sans, fontSize: 14, color: '#fff', marginTop: 12 },
  insight: {
    marginTop: 14, alignSelf: 'flex-start',
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.bgInverse2,
    borderRadius: radii.sm,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  insightText: { fontFamily: fonts.sansSb, fontSize: 13, color: '#fff' },

  actionNum: {
    width: 22, height: 22, borderRadius: radii.sm,
    fontFamily: fonts.sansEb, fontSize: 13, color: colors.textSecondary,
    textAlign: 'center', lineHeight: 22,
  },
  actionText: { flex: 1, fontFamily: fonts.sansSb, fontSize: 15, color: colors.textPrimary },

  teacherNote: {
    marginTop: 22, backgroundColor: colors.brandCream,
    borderRadius: radii.lg, padding: 16,
  },
  teacherText: { fontFamily: fonts.sansEb, fontSize: 15, lineHeight: 22, color: colors.textPrimary, letterSpacing: -0.3 },
});
