import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import Card from '@/components/Card';
import { BulletCard, SummaryCard } from '@/components/BulletCard';
import { useReport, isInlineCorrection, findRubricCriteriaByKeyword, getLexicalRange } from '@/context/ReportContext';
import type { AnnotatedQuote, VocabularyUpgrade } from '@/context/ReportContext';
import { colors, fonts, type } from '@/theme';

function AnnotatedQuoteItem({ item }: { item: AnnotatedQuote }) {
  return (
    <Card padding={14} style={{ borderLeftWidth: 3, borderLeftColor: colors.rubricLexical }}>
      <Text style={s.quoteText}>{`"${item.quote}"`}</Text>
      {!!item.note && (
        <>
          <Text style={s.noteLabel}>Note</Text>
          <Text style={s.noteText}>{item.note}</Text>
        </>
      )}
    </Card>
  );
}

function UpgradeRow({ item, last }: { item: VocabularyUpgrade; last: boolean }) {
  const targets = (item.to ?? item.suggestions ?? []).join(' · ');
  return (
    <View style={[s.upgradeRow, !last && s.upgradeDivider]}>
      <Text style={s.upgradeFrom}>{item.from}</Text>
      <Text style={s.upgradeArrow}>→</Text>
      <Text style={s.upgradeTo}>{targets}</Text>
    </View>
  );
}

export function VocabularyWordChoiceContent() {
  const { report } = useReport();
  if (!report) return null;

  const lexical      = getLexicalRange(report.result);
  const quotes       = lexical?.annotatedQuotes    ?? [];
  const upgrades     = lexical?.vocabularyUpgrades ?? [];

  const criteria     = findRubricCriteriaByKeyword(report.result, 'lexic')
    ?? findRubricCriteriaByKeyword(report.result, 'vocab');
  const achievements = criteria?.achievements ?? [];
  const rawIssues    = criteria?.issues ?? [];
  const stringIssues = rawIssues.filter((i): i is string => !isInlineCorrection(i));
  const summary      = criteria?.observation ?? '';

  return (
    <>
      {quotes.length > 0 && (
        <>
          <Text style={[type.label, { marginBottom: 6 }]}>FROM YOUR RESPONSE — ANNOTATED</Text>
          <View style={{ gap: 8 }}>
            {quotes.map((q, i) => (
              <AnnotatedQuoteItem key={i} item={q} />
            ))}
          </View>
        </>
      )}

      {upgrades.length > 0 && (
        <>
          <Text style={[type.label, { marginTop: 16, marginBottom: 6 }]}>STRETCH YOUR VOCABULARY</Text>
          <Card padding={0}>
            {upgrades.map((u, i) => (
              <UpgradeRow key={i} item={u} last={i === upgrades.length - 1} />
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
  quoteText:  { fontFamily: fonts.sansSb, fontSize: 14, lineHeight: 21, color: colors.textPrimary, marginBottom: 6 },
  noteLabel:  { fontFamily: fonts.sansSb, fontSize: 12, color: colors.rubricLexical, marginBottom: 3 },
  noteText:   { fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, color: colors.textSecondary },

  upgradeRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, paddingHorizontal: 14 },
  upgradeDivider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  upgradeFrom:    { width: 110, fontFamily: fonts.sansSb, fontSize: 13, color: colors.danger, paddingTop: 1 },
  upgradeArrow:   { fontFamily: fonts.sans, fontSize: 13, color: colors.textTertiary, paddingTop: 1 },
  upgradeTo:      { flex: 1, fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.brandGreenDeep },
});
