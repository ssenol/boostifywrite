import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import ResultsShell, { ResultsTab } from './ResultsShell';
import Card from '@/components/Card';
import BulletRow from '@/components/BulletRow';
import QuoteBlock from '@/components/QuoteBlock';
import { IconCheck } from '@/components/Icons';
import { useReport, getCriteriaEntry, isInlineCorrection, scoreToCefr, findScore } from '@/context/ReportContext';
import { colors, fonts, radii, type } from '@/theme';

const TAB_CONFIG: Record<string, { kw: string; label: string; color: string }> = {
  Task:     { kw: 'task',  label: 'Task Achievement',     color: colors.rubricTask     },
  Cohesion: { kw: 'coher', label: 'Coherence & Cohesion', color: colors.rubricCohesion },
  Vocab:    { kw: 'lexic', label: 'Lexical Range',         color: colors.rubricLexical  },
  Grammar:  { kw: 'gramm', label: 'Grammatical Accuracy',  color: colors.rubricGrammar  },
};

type Props = { tab: ResultsTab; solvedTaskId: string };

export default function DimensionScreen({ tab, solvedTaskId }: Props) {
  const { report } = useReport();
  const cfg = TAB_CONFIG[tab];

  if (!report || !cfg) {
    return <ResultsShell active={tab} solvedTaskId={solvedTaskId}>{null}</ResultsShell>;
  }

  const cr        = getCriteriaEntry(report.result, cfg.kw) ?? {};
  const score     = cr.score ?? findScore(report.criteriaScores, cfg.kw);
  const level     = scoreToCefr(score);
  const summary   = cr.observation ?? '';
  const strengths = cr.achievements ?? [];
  const issues    = cr.issues ?? [];

  const stringIssues = issues.filter((i): i is string => !isInlineCorrection(i));
  const corrections  = issues.filter(isInlineCorrection);
  const firstCorr    = corrections[0];

  const practiceItems: string[] = [
    ...stringIssues.slice(0, 3),
    ...corrections.slice(0, 2).map(c => `Fix: "${c.wrongWord}" → "${c.correctWord}"`),
  ].slice(0, 4);

  return (
    <ResultsShell active={tab} solvedTaskId={solvedTaskId}>
      {/* Summary card */}
      <Card padding={18} style={{ borderLeftWidth: 3, borderLeftColor: cfg.color }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginLeft: 6 }}>
          <View>
            <Text style={[type.label, { marginBottom: 4 }]}>THIS DIMENSION</Text>
            <Text style={styles.dimName}>{cfg.label}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.dimLevel, { color: cfg.color }]}>{level}</Text>
            <Text style={styles.dimScore}>{score.toFixed(1)}/9</Text>
          </View>
        </View>
        {!!summary && <Text style={styles.dimSummary}>{summary}</Text>}
      </Card>

      {/* Strengths */}
      {strengths.length > 0 && (
        <Card padding={14} style={{ marginTop: 12 }}>
          <SectionLabel color={cfg.color}>STRENGTHS</SectionLabel>
          {strengths.map((s, i) => (
            <BulletRow key={i} kind="good" divider={i < strengths.length - 1}>{s}</BulletRow>
          ))}
        </Card>
      )}

      {/* Work on */}
      {stringIssues.length > 0 && (
        <Card padding={14} style={{ marginTop: 12 }}>
          <SectionLabel color={colors.rubricTask}>WORK ON</SectionLabel>
          {stringIssues.map((w, i) => (
            <BulletRow key={i} kind="bad" divider={i < stringIssues.length - 1}>{w}</BulletRow>
          ))}
        </Card>
      )}

      {/* From → Try */}
      {firstCorr && (
        <Card padding={14} style={{ marginTop: 12 }}>
          <SectionLabel color={cfg.color}>FROM YOUR WRITING</SectionLabel>
          <QuoteBlock kind="from" style={{ marginTop: 4, borderLeftColor: cfg.color }}>
            {`"${firstCorr.wrongContent || firstCorr.wrongWord}"`}
          </QuoteBlock>
          <Text style={[type.labelSm, { marginTop: 12, marginBottom: 6, color: colors.brandGreenDeep }]}>TRY THIS ↓</Text>
          <QuoteBlock kind="try">
            {`"${firstCorr.correctedContent || firstCorr.correctWord}"`}
          </QuoteBlock>
          {!!firstCorr.detailFeedbackWithReason && (
            <Text style={styles.corrExplain}>{firstCorr.detailFeedbackWithReason}</Text>
          )}
        </Card>
      )}

      {/* Practice */}
      {practiceItems.length > 0 && (
        <Card padding={14} style={{ marginTop: 12 }}>
          <SectionLabel color={colors.textPrimary}>PRACTICE THIS WEEK</SectionLabel>
          {practiceItems.map((p, i) => (
            <PracticeRow key={i} text={p} last={i === practiceItems.length - 1}/>
          ))}
        </Card>
      )}

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
      <View style={[styles.checkbox, done && { backgroundColor: colors.brandGreen, borderWidth: 0 }]}>
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
  corrExplain: { marginTop: 10, fontFamily: fonts.sans, fontSize: 13.5, lineHeight: 20, color: colors.textSecondary },

  practiceRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  practiceDivider: { borderBottomWidth: 1, borderBottomColor: colors.hairline, borderStyle: 'dashed' },
  checkbox: {
    width: 20, height: 20, borderRadius: 5,
    borderWidth: 1.5, borderColor: colors.borderStrong,
    alignItems: 'center', justifyContent: 'center',
  },
  practiceText: { fontFamily: fonts.sans, fontSize: 14.5, color: colors.textPrimary },
});
