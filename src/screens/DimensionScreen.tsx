import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import Card from '@/components/Card';
import BulletRow from '@/components/BulletRow';
import { IconCheckFilled } from '@/components/Icons';
import {
  useReport, getCriteriaEntry, isInlineCorrection, scoreToCefr, findScore,
  getMetricsWordCount, findRubricCriteriaByKeyword, findRubricCriteriaWithErrors,
  getTargetCefrLevel, getUserResponseCefrEvidence,
  getLexicalRange,
} from '@/context/ReportContext';
import type { AnnotatedQuote, VocabularyUpgrade } from '@/context/ReportContext';
import { colors, fonts, radii, type, CEFR_BANDS } from '@/theme';
import { CefrLevelCheck } from './ResultsOverview';

const TAB_CONFIG = {
  'Content & Fulfillment':    { kw: 'task',  color: colors.rubricTask     },
  'Organization & Cohesion':  { kw: 'coher', color: colors.rubricCohesion },
  'Vocabulary & Word Choice': { kw: 'lexic', color: colors.rubricLexical  },
  'Grammar & Language Use':   { kw: 'gramm', color: colors.rubricGrammar  },
};

// Achievements veya Issues için scroll'lu kart
function BulletCard({ items, kind }: { items: string[]; kind: 'good' | 'bad' }) {
  return (
    <Card padding={0}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/*nestedScrollEnabled style={{ maxHeight: 250 }}*/}
        {items.map((s, i) => (
          <BulletRow key={i} kind={kind} divider={i < items.length - 1}>{s}</BulletRow>
        ))}
      </ScrollView>
    </Card>
  );
}

// Summary için scroll'lu kart (mavi check + BulletRow ile aynı stil)
function SummaryCard({ text }: { text: string }) {
  return (
    <Card padding={0}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/*nestedScrollEnabled style={{ maxHeight: 180 }}*/}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          <View style={{ marginTop: 1 }}>
            <IconCheckFilled size={16} bg={colors.brandBlue} />
          </View>
          <Text style={shared.summaryText}>{text}</Text>
        </View>
      </ScrollView>
    </Card>
  );
}

const shared = StyleSheet.create({
  summaryText: {
    flex: 1, fontFamily: fonts.sans, fontSize: 14, lineHeight: 20,
    color: colors.textPrimary,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Content & Fulfillment — özel ekran
// ─────────────────────────────────────────────────────────────────────────────

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
          <Text style={cf.chipGroupLabel}>USED ({used.length})</Text>
          <View style={cf.chipRow}>
            {used.map(k => (
              <View key={k} style={[cf.chip, cf.chipUsed]}>
                <Text style={[cf.chipText, cf.chipUsedText]}>{k}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      {missing.length > 0 && (
        <View style={used.length > 0 ? { marginTop: 10 } : undefined}>
          <Text style={[cf.chipGroupLabel, { color: colors.danger }]}>MISSING ({missing.length})</Text>
          <View style={cf.chipRow}>
            {missing.map(k => (
              <View key={k} style={[cf.chip, cf.chipMissing]}>
                <Text style={[cf.chipText, cf.chipMissingText]}>{k}</Text>
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
  const target   = parseWCTarget(required);
  const ref      = target.max ?? target.min;
  const barPct   = ref > 0 ? Math.min(wordCount / ref, 1) : 0;
  const barColor = met ? colors.brandGreenDeep : colors.danger;
  const rangeLabel = target.max ? `${target.min}–${target.max}` : `${target.min}+`;

  return (
    <>
      <View style={cf.wcRow}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
          <Text style={cf.wcBig}>{wordCount}</Text>
          <Text style={cf.wcUnit}>words</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={cf.wcTargetLabel}>TARGET</Text>
          <Text style={cf.wcTargetRange}>{rangeLabel}</Text>
        </View>
      </View>
      <View style={cf.barTrack}>
        <View style={[cf.barFill, { width: `${barPct * 100}%` as any, backgroundColor: barColor }]} />
      </View>
      {!!comment && <Text style={cf.wcComment}>{comment}</Text>}
    </>
  );
}

export function ContentFulfillmentContent() {
  const { report } = useReport();
  if (!report) return null;

  const cfg = TAB_CONFIG['Content & Fulfillment'];

  // Score — önce rubricCriteriaFeedback'ten, yoksa criteriaScores'tan
  const taskCriteria = findRubricCriteriaByKeyword(report.result, 'task')
    ?? findRubricCriteriaByKeyword(report.result, 'content')
    ?? findRubricCriteriaByKeyword(report.result, 'fulfil');
  const score   = taskCriteria?.score ?? findScore(report.criteriaScores ?? {}, cfg.kw);
  const level   = scoreToCefr(score);
  const summary = taskCriteria?.observation
    ?? (getCriteriaEntry(report.result, cfg.kw) ?? {}).observation ?? '';
  const achievements = taskCriteria?.achievements ?? [];
  const rawIssues    = taskCriteria?.issues ?? [];
  const stringIssues = rawIssues.filter((i): i is string => !isInlineCorrection(i));

  // Keywords
  const usedKeywords     = report.keywordsUsed ?? [];
  const requiredKeywords = report.requiredKeywords ?? [];
  const missingKeywords  = requiredKeywords.filter(k => !usedKeywords.includes(k));
  const hasKeywords      = usedKeywords.length > 0 || requiredKeywords.length > 0;

  // Word count
  const wordCount = report.wordCount ?? 0;
  const metricsWC = getMetricsWordCount(report.result);

  // CEFR
  const targetLevel  = getTargetCefrLevel(report.result);
  const achievedLevel = report.cefrLevel;
  const evidence      = getUserResponseCefrEvidence(report.result);
  const targetIdx    = CEFR_BANDS.findIndex(b => b.level === targetLevel);
  const achievedIdx  = CEFR_BANDS.findIndex(b => b.level === achievedLevel);
  const bandDiff     = (targetIdx !== -1 && achievedIdx !== -1) ? achievedIdx - targetIdx : null;

  return (
    <>
      {/* ── Keywords ── */}
      {hasKeywords && (
        <>
          <View style={cf.outerLabelRow}>
            <Text style={type.label}>KEYWORDS</Text>
            <Text style={cf.metaText}>{usedKeywords.length}/{requiredKeywords.length} Used</Text>
          </View>
          <Card padding={14}>
            <KeywordsSection used={usedKeywords} missing={missingKeywords} />
          </Card>
        </>
      )}

      {/* ── Word Count ── */}
      {metricsWC && (
        <>
          <View style={[cf.outerLabelRow, { marginTop: 16 }]}>
            <Text style={type.label}>WORD COUNT</Text>
            <View style={[cf.metBadge, { backgroundColor: metricsWC.met ? '#EDF7EE' : '#FEF2F2', borderColor: metricsWC.met ? '#A5D6A7' : '#FCA5A5' }]}>
              <Text style={[cf.metBadgeText, { color: metricsWC.met ? colors.brandGreenDeep : colors.danger }]}>
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

      {/* ── CEFR Level Check ── */}
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
                <Text style={cf.evidenceText}>{evidence.evidence}</Text>
              </Card>
            </>
          )}
        </>
      )}

      {/* ── Achievements ── */}
      {achievements.length > 0 && (
        <>
          <Text style={[type.label, { marginTop: 16, marginBottom: 6 }]}>ACHIEVEMENTS</Text>
          <BulletCard items={achievements} kind="good" />
        </>
      )}

      {/* ── Issues ── */}
      {stringIssues.length > 0 && (
        <>
          <Text style={[type.label, { marginTop: 16, marginBottom: 6 }]}>ISSUES</Text>
          <BulletCard items={stringIssues} kind="bad" />
        </>
      )}

      {/* ── Summary (en alta) ── */}
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

const cf = StyleSheet.create({
  outerLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  metaText: { fontFamily: fonts.mono, fontSize: 12, color: colors.textTertiary },

  metBadge: {
    borderRadius: radii.pill, borderWidth: 1,
    paddingHorizontal: 9, paddingVertical: 3,
  },
  metBadgeText: { fontFamily: fonts.sansSb, fontSize: 11 },

  // Keyword chips
  chipGroupLabel: {
    fontFamily: fonts.sansSb, fontSize: 11, letterSpacing: 0.4,
    color: colors.brandGreenDeep, marginBottom: 6,
  },
  chipRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip:     { borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1 },
  chipUsed: { backgroundColor: '#EDF7EE', borderColor: '#A5D6A7' },
  chipMissing: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
  chipText:        { fontFamily: fonts.sans, fontSize: 13 },
  chipUsedText:    { color: colors.brandGreenDeep },
  chipMissingText: { color: colors.danger },

  // Word count
  wcRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10 },
  wcBig:        { fontFamily: fonts.sansEb, fontSize: 36, letterSpacing: -1, color: colors.textPrimary },
  wcUnit:       { fontFamily: fonts.sans, fontSize: 14, color: colors.textTertiary, marginBottom: 4 },
  wcTargetLabel:{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.textTertiary },
  wcTargetRange:{ fontFamily: fonts.monoSb, fontSize: 16, color: colors.textSecondary, marginTop: 2 },
  barTrack:     { height: 6, backgroundColor: colors.bgApp, borderRadius: 99, marginTop: 10, overflow: 'hidden' },
  barFill:      { height: 6, borderRadius: 99 },
  wcComment:    { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.textSecondary, marginTop: 10 },

  // Evidence & Summary
  evidenceText: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
  summaryText:  { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.textSecondary },
});

// ─────────────────────────────────────────────────────────────────────────────
// Organisation & Cohesion — özel ekran
// ─────────────────────────────────────────────────────────────────────────────

export function OrganisationCohesionContent() {
  const { report } = useReport();
  if (!report) return null;

  const criteria = findRubricCriteriaByKeyword(report.result, 'coher')
    ?? findRubricCriteriaByKeyword(report.result, 'organ');

  const achievements = criteria?.achievements ?? [];
  const rawIssues    = criteria?.issues ?? [];
  const stringIssues = rawIssues.filter((i): i is string => !isInlineCorrection(i));
  const summary      = criteria?.observation ?? '';

  return (
    <>
      {achievements.length > 0 && (
        <>
          <Text style={[type.label, { marginBottom: 6 }]}>ACHIEVEMENTS</Text>
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

// ─────────────────────────────────────────────────────────────────────────────
// Vocabulary & Word Choice — özel ekran
// ─────────────────────────────────────────────────────────────────────────────

function AnnotatedQuoteItem({ item }: { item: AnnotatedQuote }) {
  return (
    <Card padding={14} style={{ borderLeftWidth: 3, borderLeftColor: colors.rubricLexical }}>
      <Text style={voc.quoteText}>{`"${item.quote}"`}</Text>
      {!!item.note && (
        <>
          <Text style={voc.noteLabel}>Note</Text>
          <Text style={voc.noteText}>{item.note}</Text>
        </>
      )}
    </Card>
  );
}

function UpgradeRow({ item, last }: { item: VocabularyUpgrade; last: boolean }) {
  const targets = (item.to ?? item.suggestions ?? []).join(' · ');
  return (
    <View style={[voc.upgradeRow, !last && voc.upgradeDivider]}>
      <Text style={voc.upgradeFrom}>{item.from}</Text>
      <Text style={voc.upgradeArrow}>→</Text>
      <Text style={voc.upgradeTo}>{targets}</Text>
    </View>
  );
}

export function VocabularyWordChoiceContent() {
  const { report } = useReport();
  if (!report) return null;

  const lexical  = getLexicalRange(report.result);
  const quotes   = lexical?.annotatedQuotes    ?? [];
  const upgrades = lexical?.vocabularyUpgrades ?? [];

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

const voc = StyleSheet.create({
  // Annotated quotes — her biri ayrı Card (borderLeft dışarıda)
  quoteText:  { fontFamily: fonts.sansSb, fontSize: 14, lineHeight: 21, color: colors.textPrimary, marginBottom: 6 },
  noteLabel:  { fontFamily: fonts.sansSb, fontSize: 12, color: colors.rubricLexical, marginBottom: 3 },
  noteText:   { fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, color: colors.textSecondary },

  // Vocabulary upgrades
  upgradeRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, paddingHorizontal: 14 },
  upgradeDivider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  upgradeFrom:    { width: 110, fontFamily: fonts.sansSb, fontSize: 13, color: colors.danger, paddingTop: 1 },
  upgradeArrow:   { fontFamily: fonts.sans, fontSize: 13, color: colors.textTertiary, paddingTop: 1 },
  upgradeTo:      { flex: 1, fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.brandGreenDeep },
});

// ─────────────────────────────────────────────────────────────────────────────
// Grammar & Language Use — özel ekran
// ─────────────────────────────────────────────────────────────────────────────

import type { InlineCorrection } from '@/types/api';

function formatSubType(raw: string): string {
  const spaced = raw.replace(/[-_]/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

function ErrorRow({ item, index, last }: { item: InlineCorrection; index: number; last: boolean }) {
  return (
    <View style={[gr.errorRow, !last && gr.errorDivider]}>
      <View style={gr.numBadge}>
        <Text style={gr.numText}>{index + 1}</Text>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
          <Text style={gr.wrongText}>{item.wrongContent || item.wrongWord}</Text>
          <Text style={gr.correctText}>{item.correctedContent || item.correctWord}</Text>
        </View>
        {!!item.subType && (
          <View style={gr.subTypePill}>
            <Text style={gr.subTypeText}>{formatSubType(item.subType)}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export function GrammarLanguageContent() {
  const { report } = useReport();
  if (!report) return null;

  // InlineCorrection içeren criterion (grammar/logic errors)
  const errorCriteria  = findRubricCriteriaWithErrors(report.result);
  const allErrors      = (errorCriteria?.issues ?? []).filter(isInlineCorrection);
  const grammarErrors  = allErrors.filter(e => e.type === 'grammar-error');
  const logicErrors    = allErrors.filter(e => e.type === 'logic-error');

  // String achievements/issues/summary — gramm keyword'üyle
  const summaryCriteria = findRubricCriteriaByKeyword(report.result, 'gramm')
    ?? findRubricCriteriaByKeyword(report.result, 'language');
  const achievements = (summaryCriteria?.achievements ?? []).filter((a): a is string => typeof a === 'string');
  const rawIssues    = summaryCriteria?.issues ?? [];
  const stringIssues = rawIssues.filter((i): i is string => !isInlineCorrection(i));
  const summary      = summaryCriteria?.observation ?? '';

  return (
    <>
      {/* ── Grammar Errors ── */}
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

      {/* ── Logic Errors ── */}
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

      {/* ── Achievements ── */}
      {achievements.length > 0 && (
        <>
          <Text style={[type.label, { marginTop: 16, marginBottom: 6 }]}>ACHIEVEMENTS</Text>
          <BulletCard items={achievements} kind="good" />
        </>
      )}

      {/* ── Issues ── */}
      {stringIssues.length > 0 && (
        <>
          <Text style={[type.label, { marginTop: 16, marginBottom: 6 }]}>ISSUES</Text>
          <BulletCard items={stringIssues} kind="bad" />
        </>
      )}

      {/* ── Summary ── */}
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

const gr = StyleSheet.create({
  errorRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: 12, padding: 14,
  },
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
    backgroundColor: colors.bgApp,
    borderRadius: radii.xs,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 8, paddingVertical: 3, marginTop: 2,
  },
  subTypeText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.4, color: colors.textTertiary },
});
