import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import Card from '@/components/Card';
import { BulletCard, SummaryCard } from '@/components/BulletCard';
import {
  useReport, isInlineCorrection,
  findRubricCriteriaByKeyword, findRubricCriteriaWithErrors,
} from '@/context/ReportContext';
import type { InlineCorrection } from '@/types/api';
import { colors, fonts, radii, type } from '@/theme';

function formatSubType(raw: string): string {
  const spaced = raw.replace(/[-_]/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

function ErrorRow({ item, index, last }: { item: InlineCorrection; index: number; last: boolean }) {
  return (
    <View style={[s.errorRow, !last && s.errorDivider]}>
      <View style={s.numBadge}>
        <Text style={s.numText}>{index + 1}</Text>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
          <Text style={s.wrongText}>{item.wrongContent || item.wrongWord}</Text>
          <Text style={s.correctText}>{item.correctedContent || item.correctWord}</Text>
        </View>
        {!!item.subType && (
          <View style={s.subTypePill}>
            <Text style={s.subTypeText}>{formatSubType(item.subType)}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export function GrammarLanguageContent() {
  const { report } = useReport();
  if (!report) return null;

  const errorCriteria  = findRubricCriteriaWithErrors(report.result);
  const allErrors      = (errorCriteria?.issues ?? []).filter(isInlineCorrection);
  const grammarErrors  = allErrors.filter(e => e.type === 'grammar-error');
  const logicErrors    = allErrors.filter(e => e.type === 'logic-error');

  const summaryCriteria = findRubricCriteriaByKeyword(report.result, 'gramm')
    ?? findRubricCriteriaByKeyword(report.result, 'language');
  const achievements = (summaryCriteria?.achievements ?? []).filter((a): a is string => typeof a === 'string');
  const rawIssues    = summaryCriteria?.issues ?? [];
  const stringIssues = rawIssues.filter((i): i is string => !isInlineCorrection(i));
  const summary      = summaryCriteria?.observation ?? '';

  return (
    <>
      {grammarErrors.length > 0 && (
        <>
          <Text style={[type.label, { marginBottom: 6 }]}>
            {`FROM YOUR RESPONSE — GRAMMAR ERRORS (${grammarErrors.length})`}
          </Text>
          <Card padding={0}>
            {grammarErrors.map((e, i) => (
              <ErrorRow key={i} item={e} index={i} last={i === grammarErrors.length - 1} />
            ))}
          </Card>
        </>
      )}

      {logicErrors.length > 0 && (
        <>
          <Text style={[type.label, { marginTop: 16, marginBottom: 6 }]}>
            {`FROM YOUR RESPONSE — LOGIC ERRORS (${logicErrors.length})`}
          </Text>
          <Card padding={0}>
            {logicErrors.map((e, i) => (
              <ErrorRow key={i} item={e} index={i} last={i === logicErrors.length - 1} />
            ))}
          </Card>
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
  errorRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14 },
  errorDivider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },

  numBadge: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.bgApp, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0,
  },
  numText: { fontFamily: fonts.monoSb, fontSize: 12, color: colors.textSecondary },

  wrongText:   { fontFamily: fonts.sansSb, fontSize: 13.5, color: colors.danger, flexShrink: 1, textDecorationLine: 'line-through' },
  correctText: { fontFamily: fonts.sansSb, fontSize: 13.5, color: colors.brandGreenDeep, flexShrink: 1 },

  subTypePill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bgApp, borderRadius: radii.xs,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 8, paddingVertical: 3, marginTop: 2,
  },
  subTypeText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.4, color: colors.textTertiary },
});
