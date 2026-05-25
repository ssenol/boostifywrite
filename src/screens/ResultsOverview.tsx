import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ResultsShell from './ResultsShell';
import Card from '@/components/Card';
import RubricBar from '@/components/RubricBar';
import { IconArrowUp, IconChevRight } from '@/components/Icons';
import { useReport, findScore, scoreToCefr, getCriteriaEntry, isInlineCorrection } from '@/context/ReportContext';
import { colors, fonts, radii, type } from '@/theme';
import type { HomeStackParamList } from '@/navigation/types';

type Nav   = NativeStackNavigationProp<HomeStackParamList>;
type Route = RouteProp<HomeStackParamList, 'ResultsOverview'>;

const DIM_CONFIG = [
  { label: 'Task Achievement',     kw: 'task',  color: colors.rubricTask,     route: 'ResultsTask'     },
  { label: 'Coherence & Cohesion', kw: 'coher', color: colors.rubricCohesion, route: 'ResultsCohesion' },
  { label: 'Lexical Range',        kw: 'lexic', color: colors.rubricLexical,  route: 'ResultsLexical'  },
  { label: 'Grammatical Accuracy', kw: 'gramm', color: colors.rubricGrammar,  route: 'ResultsGrammar'  },
] as const;

export default function ResultsOverview() {
  const nav   = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { solvedTaskId } = route.params;
  const { report } = useReport();

  if (!report) return (
    <ResultsShell active="Overview" solvedTaskId={solvedTaskId}>
      {null}
    </ResultsShell>
  );

  const scores = report.criteriaScores ?? {};

  // En düşük skorlu boyut → "biggest lever"
  const lever = DIM_CONFIG
    .map(d => ({ ...d, score: findScore(scores, d.kw) }))
    .sort((a, b) => a.score - b.score)[0];

  // TOP 3 ACTIONS: her boyutun ilk issue'su, en düşük skordan başla
  type Action = { color: string; text: string };
  const actions: Action[] = [];
  for (const d of [...DIM_CONFIG].sort((a, b) => findScore(scores, a.kw) - findScore(scores, b.kw))) {
    if (actions.length >= 3) break;
    const cr = getCriteriaEntry(report.result, d.kw);
    const firstIssue = (cr?.issues ?? [])[0];
    if (!firstIssue) continue;
    const text = isInlineCorrection(firstIssue)
      ? firstIssue.detailFeedbackWithReason || `${firstIssue.wrongWord} → ${firstIssue.correctWord}`
      : firstIssue;
    actions.push({ color: d.color, text });
  }

  return (
    <ResultsShell active="Overview" solvedTaskId={solvedTaskId}>
      {/* Overall CEFR */}
      <View style={styles.heroCard}>
        <View style={styles.heroBlob}/>
        <View>
          <Text style={[type.label, { color: colors.textInverseSoft, marginBottom: 6 }]}>OVERALL CEFR</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 12 }}>
            <Text style={styles.heroBig}>{report.cefrLevel}</Text>
            <Text style={styles.heroScore}>{report.mainScore.toFixed(1)}/9</Text>
          </View>
          {lever && (
            <View style={styles.insight}>
              <IconArrowUp size={13} color="#fff"/>
              <Text style={styles.insightText}>{lever.label} is your biggest lever</Text>
            </View>
          )}
        </View>
      </View>

      {/* By dimension */}
      <View style={{ marginTop: 22 }}>
        <Text style={[type.label, { marginBottom: 12 }]}>BY DIMENSION</Text>
        <View style={{ gap: 10 }}>
          {DIM_CONFIG.map(d => {
            const score = findScore(scores, d.kw);
            return (
              <RubricBar
                key={d.kw}
                label={d.label}
                score={score}
                level={scoreToCefr(score)}
                color={d.color}
                onPress={() => (nav.navigate as any)(d.route, { solvedTaskId })}
              />
            );
          })}
        </View>
      </View>

      {/* Top 3 actions */}
      {actions.length > 0 && (
        <View style={{ marginTop: 22 }}>
          <Text style={[type.label, { marginBottom: 10 }]}>TOP 3 ACTIONS</Text>
          <View style={{ gap: 8 }}>
            {actions.map((a, i) => (
              <ActionRow key={i} n={i + 1} color={a.color} text={a.text}/>
            ))}
          </View>
        </View>
      )}
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
});
