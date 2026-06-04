import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import Card from '@/components/Card';
import RubricBar from '@/components/RubricBar';
import HtmlText from '@/components/HtmlText';
import { IconArrowUp, IconChevRight } from '@/components/Icons';
import {
  useReport, findScore, scoreToCefr, getCriteriaEntry, isInlineCorrection,
  getGlobalFeedback, feedbackMarkdownToHtml,
} from '@/context/ReportContext';
import { colors, fonts, radii, type } from '@/theme';
import type { ResultsTab } from '@/navigation/types';

const DIM_CONFIG = [
  { label: 'Task Achievement',     kw: 'task',  color: colors.rubricTask,     tab: 'Task'     as ResultsTab },
  { label: 'Coherence & Cohesion', kw: 'coher', color: colors.rubricCohesion, tab: 'Cohesion' as ResultsTab },
  { label: 'Lexical Range',        kw: 'lexic', color: colors.rubricLexical,  tab: 'Vocab'    as ResultsTab },
  { label: 'Grammatical Accuracy', kw: 'gramm', color: colors.rubricGrammar,  tab: 'Grammar'  as ResultsTab },
] as const;

type Props = { onTabChange: (tab: ResultsTab) => void };

// Provider içinde render edilir — useReport() burada doğru context'i bulur
export function OverviewContent({ onTabChange }: Props) {
  const { report } = useReport();
  if (!report) return null;

  const scores = report.criteriaScores ?? {};

  const lever = DIM_CONFIG
    .map(d => ({ ...d, score: findScore(scores, d.kw) }))
    .sort((a, b) => a.score - b.score)[0];

  type Action = { color: string; text: string; tab: ResultsTab };
  const actions: Action[] = [];
  for (const d of [...DIM_CONFIG].sort((a, b) => findScore(scores, a.kw) - findScore(scores, b.kw))) {
    if (actions.length >= 3) break;
    const cr = getCriteriaEntry(report.result, d.kw);
    const firstIssue = (cr?.issues ?? [])[0];
    if (!firstIssue) continue;
    const text = isInlineCorrection(firstIssue)
      ? firstIssue.detailFeedbackWithReason || `${firstIssue.wrongWord} → ${firstIssue.correctWord}`
      : firstIssue;
    actions.push({ color: d.color, text, tab: d.tab });
  }

  return (
    <>
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
                onPress={() => onTabChange(d.tab)}
              />
            );
          })}
        </View>
      </View>

      {actions.length > 0 && (
        <View style={{ marginTop: 22 }}>
          <Text style={[type.label, { marginBottom: 10 }]}>TOP 3 ACTIONS</Text>
          <View style={{ gap: 8 }}>
            {actions.map((a, i) => (
              <ActionRow key={i} n={i + 1} color={a.color} text={a.text} onPress={() => onTabChange(a.tab)}/>
            ))}
          </View>
        </View>
      )}

      <FeedbackSection result={report.result}/>
    </>
  );
}

function FeedbackSection({ result }: { result: import('@/types/api').ReportResultEntry[] }) {
  const html = feedbackMarkdownToHtml(getGlobalFeedback(result));
  if (!html) return null;
  return (
    <View style={{ marginTop: 22 }}>
      <Text style={[type.label, { marginBottom: 10 }]}>FEEDBACK</Text>
      <Card padding={18}>
        <HtmlText html={html} style={styles.feedbackText}/>
      </Card>
    </View>
  );
}

function ActionRow({ n, color, text, onPress }: { n: number; color: string; text: string; onPress: () => void }) {
  return (
    <Card padding={14} onPress={onPress} style={{ borderLeftWidth: 3, borderLeftColor: color, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
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
    padding: 16, paddingTop: 16, paddingBottom: 16,
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
  actionText:   { flex: 1, fontFamily: fonts.sansSb, fontSize: 15, color: colors.textPrimary },
  feedbackText: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 22, color: colors.textSecondary },
});
