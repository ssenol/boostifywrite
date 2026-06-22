import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import Card from '@/components/Card';
import { BulletCard, SummaryCard } from '@/components/BulletCard';
import {
  useReport, getCriteriaEntry, isInlineCorrection, scoreToCefr, findScore,
  getMetricsWordCount, findRubricCriteriaByKeyword,
  getTargetCefrLevel, getUserResponseCefrEvidence,
} from '@/context/ReportContext';
import { colors, fonts, radii, type, CEFR_BANDS } from '@/theme';
import { CefrLevelCheck } from './ReportOverview';

const KW = 'task';

function parseWCTarget(required: string): { min: number; max: number | null } {
  const range = required.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (range) return { min: +range[1], max: +range[2] };
  const plus = required.match(/(\d+)\+/);
  if (plus) return { min: +plus[1], max: null };
  const n = parseInt(required, 10);
  return isNaN(n) ? { min: 0, max: null } : { min: n, max: n };
}

function KeywordsSection({ used, missing }: { used: string[]; missing: string[] }) {
  return (
    <>
      {used.length > 0 && (
        <View>
          <Text style={s.chipGroupLabel}>USED ({used.length})</Text>
          <View style={s.chipRow}>
            {used.map(k => (
              <View key={k} style={[s.chip, s.chipUsed]}>
                <Text style={[s.chipText, s.chipUsedText]}>{k}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      {missing.length > 0 && (
        <View style={used.length > 0 ? { marginTop: 10 } : undefined}>
          <Text style={[s.chipGroupLabel, { color: colors.danger }]}>MISSING ({missing.length})</Text>
          <View style={s.chipRow}>
            {missing.map(k => (
              <View key={k} style={[s.chip, s.chipMissing]}>
                <Text style={[s.chipText, s.chipMissingText]}>{k}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </>
  );
}

function WordCountSection({
  wordCount, required, met, comment,
}: { wordCount: number; required: string; met: boolean; comment: string }) {
  const target     = parseWCTarget(required);
  const ref        = target.max ?? target.min;
  const barPct     = ref > 0 ? Math.min(wordCount / ref, 1) : 0;
  const barColor   = met ? colors.brandGreenDeep : colors.danger;
  const rangeLabel = target.max ? `${target.min}–${target.max}` : `${target.min}+`;

  return (
    <>
      <View style={s.wcRow}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
          <Text style={s.wcBig}>{wordCount}</Text>
          <Text style={s.wcUnit}>words</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={s.wcTargetLabel}>TARGET</Text>
          <Text style={s.wcTargetRange}>{rangeLabel}</Text>
        </View>
      </View>
      <View style={s.barTrack}>
        <View style={[s.barFill, { width: `${barPct * 100}%` as any, backgroundColor: barColor }]} />
      </View>
      {!!comment && <Text style={s.wcComment}>{comment}</Text>}
    </>
  );
}

export function ContentFulfillmentContent() {
  const { report } = useReport();
  if (!report) return null;

  const taskCriteria = findRubricCriteriaByKeyword(report.result, 'task')
    ?? findRubricCriteriaByKeyword(report.result, 'content')
    ?? findRubricCriteriaByKeyword(report.result, 'fulfil');
  const score        = taskCriteria?.score ?? findScore(report.criteriaScores ?? {}, KW);
  const _level       = scoreToCefr(score); // ilerisi için
  const summary      = taskCriteria?.observation
    ?? (getCriteriaEntry(report.result, KW) ?? {}).observation ?? '';
  const achievements = taskCriteria?.achievements ?? [];
  const rawIssues    = taskCriteria?.issues ?? [];
  const stringIssues = rawIssues.filter((i): i is string => !isInlineCorrection(i));

  const usedKeywords     = report.keywordsUsed ?? [];
  const requiredKeywords = report.requiredKeywords ?? [];
  const missingKeywords  = requiredKeywords.filter(k => !usedKeywords.includes(k));
  const hasKeywords      = usedKeywords.length > 0 || requiredKeywords.length > 0;

  const wordCount  = report.wordCount ?? 0;
  const metricsWC  = getMetricsWordCount(report.result);

  const targetLevel   = getTargetCefrLevel(report.result);
  const achievedLevel = report.cefrLevel;
  const evidence      = getUserResponseCefrEvidence(report.result);
  const targetIdx     = CEFR_BANDS.findIndex(b => b.level === targetLevel);
  const achievedIdx   = CEFR_BANDS.findIndex(b => b.level === achievedLevel);
  const bandDiff      = (targetIdx !== -1 && achievedIdx !== -1) ? achievedIdx - targetIdx : null;

  return (
    <>
      {hasKeywords && (
        <>
          <View style={s.outerLabelRow}>
            <Text style={type.label}>KEYWORDS</Text>
            <Text style={s.metaText}>{usedKeywords.length}/{requiredKeywords.length} Used</Text>
          </View>
          <Card padding={14}>
            <KeywordsSection used={usedKeywords} missing={missingKeywords} />
          </Card>
        </>
      )}

      {metricsWC && (
        <>
          <View style={[s.outerLabelRow, { marginTop: 16 }]}>
            <Text style={type.label}>WORD COUNT</Text>
            <View style={[s.metBadge, { backgroundColor: metricsWC.met ? '#EDF7EE' : '#FEF2F2', borderColor: metricsWC.met ? '#A5D6A7' : '#FCA5A5' }]}>
              <Text style={[s.metBadgeText, { color: metricsWC.met ? colors.brandGreenDeep : colors.danger }]}>
                {metricsWC.met ? 'On target' : 'Target not met'}
              </Text>
            </View>
          </View>
          <Card padding={14}>
            <WordCountSection
              wordCount={wordCount}
              required={metricsWC.required}
              met={metricsWC.met}
              comment={metricsWC.comment}
            />
          </Card>
        </>
      )}

      {targetLevel && achievedLevel && (
        <>
          <Text style={[type.label, { marginTop: 16, marginBottom: 6 }]}>CEFR LEVEL CHECK</Text>
          <Card padding={16}>
            <CefrLevelCheck
              targetLevel={targetLevel}
              achievedLevel={achievedLevel}
              bandDiff={bandDiff}
            />
          </Card>
          {!!evidence?.evidence && (
            <>
              <Text style={[type.label, { marginTop: 16, marginBottom: 6 }]}>EVIDENCE</Text>
              <Card padding={14}>
                <Text style={s.evidenceText}>{evidence.evidence}</Text>
              </Card>
            </>
          )}
        </>
      )}

      {achievements.length > 0 && (
        <>
          <Text style={[type.label, { marginTop: 16, marginBottom: 6 }]}>ACHIEVEMENTS</Text>
          <BulletCard items={achievements} kind="good" />
        </>
      )}

      {stringIssues.length > 0 && (
        <>
          <Text style={[type.label, { marginTop: 16, marginBottom: 6 }]}>ISSUES</Text>
          <BulletCard items={stringIssues} kind="bad" />
        </>
      )}

      {!!summary && (
        <>
          <Text style={[type.label, { marginTop: 16, marginBottom: 6 }]}>SUMMARY</Text>
          <SummaryCard text={summary} />
        </>
      )}

      <View style={{ height: 16 }} />
    </>
  );
}

const s = StyleSheet.create({
  outerLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  metaText:      { fontFamily: fonts.mono, fontSize: 12, color: colors.textTertiary },

  metBadge:     { borderRadius: radii.pill, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 3 },
  metBadgeText: { fontFamily: fonts.sansSb, fontSize: 11 },

  chipGroupLabel:  { fontFamily: fonts.sansSb, fontSize: 11, letterSpacing: 0.4, color: colors.brandGreenDeep, marginBottom: 6 },
  chipRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip:            { borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1 },
  chipUsed:        { backgroundColor: '#EDF7EE', borderColor: '#A5D6A7' },
  chipMissing:     { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
  chipText:        { fontFamily: fonts.sans, fontSize: 13 },
  chipUsedText:    { color: colors.brandGreenDeep },
  chipMissingText: { color: colors.danger },

  wcRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10 },
  wcBig:        { fontFamily: fonts.sansEb, fontSize: 36, letterSpacing: -1, color: colors.textPrimary },
  wcUnit:       { fontFamily: fonts.sans, fontSize: 14, color: colors.textTertiary, marginBottom: 4 },
  wcTargetLabel:{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.textTertiary },
  wcTargetRange:{ fontFamily: fonts.monoSb, fontSize: 16, color: colors.textSecondary, marginTop: 2 },
  barTrack:     { height: 6, backgroundColor: colors.bgApp, borderRadius: 99, marginTop: 10, overflow: 'hidden' },
  barFill:      { height: 6, borderRadius: 99 },
  wcComment:    { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.textSecondary, marginTop: 10 },

  evidenceText: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
});
