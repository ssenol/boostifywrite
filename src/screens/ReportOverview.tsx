import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import Svg, { Circle as SvgCircle } from 'react-native-svg';

import BottomSheet from '@/components/BottomSheet';
import Card from '@/components/Card';
import IconButton from '@/components/IconButton';
import { IconArrow, IconArrowUp, IconArrowDown, IconInfo, IconAlertTriangle } from '@/components/Icons';
import {
  useReport,
  getRubricCriteriaFeedback,
  getTargetCefrLevel, getUserResponseCefrEvidence,
  getPlagiarismCheck,
  getAiDetectionCheck,
} from '@/context/ReportContext';
import { colors, fonts, radii, type, getCefrBand, CEFR_BANDS } from '@/theme';
import type { ResultsTab } from '@/navigation/types';

const RUBRIC_DESCRIPTIONS = [
  {
    title: 'Grammar & Language Use',
    body: 'Range of sentence structures and accuracy. Looks at how often grammar errors appear and how much they affect your meaning.',
  },
  {
    title: 'Vocabulary & Word Choice',
    body: 'Range and accuracy of the words you choose. Includes collocation (which words fit together) and register (formal vs informal).',
  },
  {
    title: 'Content & Task Fulfilment',
    body: 'How fully you addressed every part of the task and developed your ideas. Word count and required keywords also feed into this.',
  },
  {
    title: 'Organisation & Cohesion',
    body: 'How clearly your paragraphs are structured, whether you covered each outline section in the right order, and how well linking words connect your ideas.',
  },
  {
    title: 'Mechanics',
    body: "Your spelling and punctuation are mostly correct, which is great. However, you have several serious logic errors: 'the morning is darker and brighter for me' is contradictory (darker AND brighter?), and 'staying home to...",
  },
];

function aiSentenceDots(aiScore: number | undefined): Array<{ bg: string; border: string }> {
  const p = (aiScore ?? 0) * 100;
  if (p >= 60) return [
    { bg: colors.dangerSoft, border: colors.danger },
    { bg: colors.dangerSoft, border: colors.danger },
    { bg: colors.danger,     border: colors.danger },
  ];
  if (p >= 50) return [
    { bg: '#fff',            border: colors.border  },
    { bg: colors.dangerSoft, border: colors.danger  },
    { bg: colors.danger,     border: colors.danger  },
  ];
  return [
    { bg: '#fff',        border: colors.border  },
    { bg: '#fff',        border: colors.border  },
    { bg: colors.danger, border: colors.danger  },
  ];
}

function ConfidenceRing({ label, value, fillColor }: { label: string; value: number; fillColor: string }) {
  const SIZE = 88;
  const SW   = 9;
  const r    = (SIZE - SW) / 2;
  const cx   = SIZE / 2;
  const cy   = SIZE / 2;
  const circ = 2 * Math.PI * r;
  const pct    = Math.round(value * 100);
  const filled = circ * Math.min(1, Math.max(0, value));

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: SIZE, height: SIZE }}>
        <Svg width={SIZE} height={SIZE}>
          <SvgCircle cx={cx} cy={cy} r={r} fill="none" stroke={colors.border} strokeWidth={SW}/>
          {pct > 0 && (
            <SvgCircle
              cx={cx} cy={cy} r={r} fill="none"
              stroke={fillColor} strokeWidth={SW}
              strokeDasharray={[filled, circ - filled]}
              strokeLinecap="round"
              rotation={-90} originX={cx} originY={cy}
            />
          )}
        </Svg>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.textTertiary, letterSpacing: 0.5 }}>{label.toUpperCase()}</Text>
          <Text style={{ fontFamily: fonts.sansEb, fontSize: 16, color: fillColor, letterSpacing: -0.3 }}>{pct}%</Text>
        </View>
      </View>
    </View>
  );
}

type Props = { onTabChange: (tab: ResultsTab) => void };

function criterionToConfig(criterion: string): { color: string; tab: ResultsTab } {
  const c = criterion.toLowerCase();
  if (c.includes('task') || c.includes('content') || c.includes('fulfil'))
    return { color: colors.rubricTask, tab: 'Content & Fulfillment' };
  if (c.includes('coher') || c.includes('cohes') || c.includes('organ'))
    return { color: colors.rubricCohesion, tab: 'Organization & Cohesion' };
  if (c.includes('lexic') || c.includes('vocab') || c.includes('word'))
    return { color: colors.rubricLexical, tab: 'Vocabulary & Word Choice' };
  if (c.includes('gramm') || c.includes('language'))
    return { color: colors.rubricGrammar, tab: 'Grammar & Language Use' };
  return { color: colors.borderStrong, tab: 'Overview' };
}

export function OverviewContent({ onTabChange }: Props) {
  const { report } = useReport();
  const [rubricInfoOpen,      setRubricInfoOpen]      = useState(false);
  const [plagiarismSheetOpen, setPlagiarismSheetOpen] = useState(false);
  const [aiSheetOpen,         setAiSheetOpen]         = useState(false);
  if (!report) return null;

  const rubricFeedback = getRubricCriteriaFeedback(report.result);
  const mainBand       = getCefrBand(report.mainScore);

  const targetLevel   = getTargetCefrLevel(report.result);
  const achievedLevel = report.cefrLevel;
  const targetIdx     = CEFR_BANDS.findIndex(b => b.level === targetLevel);
  const achievedIdx   = CEFR_BANDS.findIndex(b => b.level === achievedLevel);
  const bandDiff      = (targetIdx !== -1 && achievedIdx !== -1) ? achievedIdx - targetIdx : null;

  const evidence    = getUserResponseCefrEvidence(report.result);
  const plagiarism  = getPlagiarismCheck(report.result);
  const aiDetection = getAiDetectionCheck(report.result);
  const aiDoc       = aiDetection?.document;
  const aiConf      = aiDoc?.confidence_scores_raw?.identity;
  const aiPct       = aiDoc
    ? Math.round((aiDoc.completely_generated_prob ?? aiDoc.average_generated_prob ?? 1) * 100)
    : 100;
  const match       = plagiarism?.highestMatch;
  const simScore    = match
    ? (match.overallScore > 1 ? match.overallScore : match.overallScore * 100)
    : 0;

  return (
    <>
      {/* ── Plagiarism banner ── */}
      {plagiarism?.hasPlagiarism && (
        <View style={styles.plagBanner}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
            <IconAlertTriangle size={20} color="#fff"/>
            <Text style={styles.plagBannerText}>
              This response shows similarity with previous submissions.
            </Text>
          </View>
          <Pressable style={styles.plagDetailBtn} onPress={() => setPlagiarismSheetOpen(true)}>
            <Text style={styles.plagDetailBtnText}>See Details</Text>
          </Pressable>
        </View>
      )}

      {/* ── AI Detection banner ── */}
      {aiDetection?.isAi && (
        <View style={[styles.plagBanner, { backgroundColor: colors.danger, marginTop: plagiarism?.hasPlagiarism ? 0 : 0 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
            <IconAlertTriangle size={20} color="#fff"/>
            <Text style={styles.plagBannerText}>This response appears to be AI-generated.</Text>
          </View>
          <Pressable style={styles.plagDetailBtn} onPress={() => setAiSheetOpen(true)}>
            <Text style={[styles.plagDetailBtnText, { color: colors.danger }]}>See Details</Text>
          </Pressable>
        </View>
      )}

      {/* ── AI Detection bottom sheet ── */}
      <BottomSheet visible={aiSheetOpen} onClose={() => setAiSheetOpen(false)}>
        <Text style={[type.label, { marginBottom: 16, paddingHorizontal: 4, fontSize: 16 }]}>
          AI Detection Result
        </Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Score banner */}
          <View style={[styles.plagSheetBanner, { backgroundColor: colors.danger }]}>
            <IconAlertTriangle size={18} color="#fff"/>
            <Text style={styles.plagSheetBannerText}>
              We detected{' '}
              <Text style={{ fontFamily: fonts.sansEb }}>{aiPct}%</Text>
              {' '}AI usage in your response.
            </Text>
          </View>

          {/* High confidence statement */}
          {aiDetection?.isAi && (
            <>
              <View style={styles.aiConfidenceRow}>
                <View style={styles.aiCircleBadge}>
                  <Text style={styles.aiCircleBadgeText}>AI</Text>
                </View>
                <Text style={styles.aiConfidenceText}>
                  We are highly confident this text was AI generated
                </Text>
              </View>
              <View style={styles.aiSheetDivider}/>
            </>
          )}

          {/* Confidence scores — donut rings */}
          {!!aiConf && (
            <>
              <Text style={styles.aiConfLabel}>Chance is entire text...</Text>
              <View style={styles.aiConfRings}>
                <ConfidenceRing label="AI"    value={aiConf.ai}    fillColor={colors.danger}     />
                <ConfidenceRing label="Human" value={aiConf.human} fillColor={colors.brandGreen} />
                <ConfidenceRing label="Mixed" value={aiConf.mixed} fillColor={colors.orange}     />
              </View>
              <View style={styles.aiSheetDivider}/>
            </>
          )}

          {/* Advanced Sentence Scanning */}
          {(aiDoc?.sentences?.length ?? 0) > 0 && (
            <>
              <Text style={styles.aiAdvTitle}>Advanced Sentence Scanning</Text>
              <Text style={styles.aiAdvSubtitle}>Sentences most impacting the probability score.</Text>
              <View style={styles.aiBarTrack}>
                <View style={[styles.aiBarFill, { width: `${aiPct}%` }]}/>
              </View>
              <View style={styles.aiBarLabels}>
                <Text style={styles.aiBarLabelText}>AI</Text>
                <Text style={styles.aiBarLabelText}>Human</Text>
              </View>
              <View style={styles.aiSheetDivider}/>

              <Text style={styles.aiSectionTitle}>Top Sentences Driving AI Probability</Text>

              {/* High Impact group header */}
              <View style={styles.aiImpactHeader}>
                <View style={styles.aiDotsRow}>
                  <View style={[styles.aiDotSm, { backgroundColor: '#fff',            borderColor: colors.border  }]}/>
                  <View style={[styles.aiDotSm, { backgroundColor: colors.dangerSoft, borderColor: colors.danger }]}/>
                  <View style={[styles.aiDotSm, { backgroundColor: colors.danger,     borderColor: colors.danger }]}/>
                </View>
                <Text style={styles.aiImpactLabel}>High Impact</Text>
              </View>

              {aiDoc!.sentences!.map((s, i) => {
                const dots = aiSentenceDots(s.ai);
                return (
                  <View key={i} style={[styles.aiSentenceRow, i < aiDoc!.sentences!.length - 1 && styles.aiSentenceDivider]}>
                    <View style={styles.aiDotsRow}>
                      {dots.map((d, j) => (
                        <View key={j} style={[styles.aiDotSm, { backgroundColor: d.bg, borderColor: d.border }]}/>
                      ))}
                    </View>
                    <Text style={styles.aiSentenceText}>{s.sentence}</Text>
                  </View>
                );
              })}
            </>
          )}
          <View style={{ height: 16 }}/>
        </ScrollView>
      </BottomSheet>

      {/* ── Plagiarism detail bottom sheet ── */}
      <BottomSheet visible={plagiarismSheetOpen} onClose={() => setPlagiarismSheetOpen(false)}>
        <Text style={[type.label, { marginBottom: 16, paddingHorizontal: 4, fontSize: 16 }]}>
          Similarity Report Detail
        </Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Score banner */}
          <View style={styles.plagSheetBanner}>
            <IconAlertTriangle size={18} color="#fff"/>
            <Text style={styles.plagSheetBannerText}>
              Your response shows a{' '}
              <Text style={{ fontFamily: fonts.sansEb }}>{simScore.toFixed(2)}%</Text>
              {' '}similarity compared to given answers!
            </Text>
          </View>

          {/* Two-column comparison */}
          <View style={styles.plagCols}>
            <View style={styles.plagCol}>
              <Text style={styles.plagColTitle}>Your Response</Text>
              <Text style={styles.plagColText}>{match?.responseOriginal ?? ''}</Text>
            </View>
            <View style={[styles.plagCol, styles.plagColRight]}>
              <Text style={[styles.plagColTitle, { color: colors.orange }]}>Most Similar Response</Text>
              <Text style={styles.plagColText}>
                {match?.matchedResponse ?? match?.responseOriginal ?? ''}
              </Text>
            </View>
          </View>
          <View style={{ height: 16 }}/>
        </ScrollView>
      </BottomSheet>

      {/* ── Hero ── */}
      <View style={styles.heroCard}>
        <View style={[styles.heroBlob, { backgroundColor: mainBand.color + '35' }]}/>
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={[type.label, { color: colors.textInverseSoft }]}>OVERALL SCORE</Text>
            <Text style={[type.labelSm, { color: colors.textInverseSoft }]}>
              {new Date(report.solvedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={[styles.heroBig, { color: mainBand.color }]}>{report.mainScore.toFixed(0)}</Text>
            <View style={{ gap: 6 }}>
              <View style={[styles.cefrBadge, { backgroundColor: mainBand.color + '28', borderColor: mainBand.color + '55', alignSelf: 'flex-start' }]}>
                <Text style={[styles.cefrText, { color: mainBand.color }]}>{report.cefrLevel}</Text>
              </View>
              {bandDiff !== null && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {bandDiff >= 0
                    ? <IconArrowUp   size={12} color={mainBand.color}/>
                    : <IconArrowDown size={12} color={colors.danger}/>
                  }
                  <Text style={[styles.insightText, { color: bandDiff >= 0 ? mainBand.color : colors.danger }]}>
                    {bandDiff === 0
                      ? `At target ${targetLevel}`
                      : `${Math.abs(bandDiff)} band${Math.abs(bandDiff) > 1 ? 's' : ''} ${bandDiff > 0 ? 'above' : 'below'} target ${targetLevel}`
                    }
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* ── HOW WE CALCULATED YOUR SCORE ── */}
      <Card padding={16} style={{ marginTop: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <Text style={type.label}>HOW WE CALCULATED YOUR SCORE?</Text>
          <View style={{ flex: 1 }}/>
          <IconButton size={24} onPress={() => setRubricInfoOpen(true)}>
            <IconInfo size={14} color={colors.textTertiary}/>
          </IconButton>
        </View>
        <Text style={styles.scoringNote}>
          Your final score is the weighted average of the rubric criteria below. Each criterion contributes by its weight (in %).
        </Text>
      </Card>

      {/* ── Rubric info bottom sheet ── */}
      <BottomSheet visible={rubricInfoOpen} onClose={() => setRubricInfoOpen(false)}>
        <Text style={[type.label, { marginBottom: 16, paddingHorizontal: 4 }]}>SCORING CRITERIA</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {RUBRIC_DESCRIPTIONS.map((item, i) => (
            <View
              key={i}
              style={[
                styles.rubricInfoItem,
                i < RUBRIC_DESCRIPTIONS.length - 1 && styles.rubricInfoDivider,
              ]}
            >
              <Text style={styles.rubricInfoTitle}>{item.title}</Text>
              <Text style={styles.rubricInfoBody}>{item.body}</Text>
            </View>
          ))}
          <View style={{ height: 8 }}/>
        </ScrollView>
      </BottomSheet>

      {/* ── Rubric criterion cards ── */}
      {rubricFeedback.length > 0 && (
        <View style={{ marginTop: 12, gap: 10 }}>
          {rubricFeedback.map((cf, i) => {
            const tab  = criterionToConfig(cf.criterion).tab;
            const band = getCefrBand(cf.score);
            const obs  = cf.observation ?? '';
            const preview = obs.length > 150 ? obs.slice(0, 150) + '...' : obs;
            return (
              <Card
                key={i}
                padding={16}
                onPress={() => onTabChange(tab)}
                style={{ borderLeftWidth: 3, borderLeftColor: band.color }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={styles.criterionName}>{cf.criterion}</Text>
                    {!!cf.weight && (
                      <Text style={styles.weightText}>{cf.weight}</Text>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Text style={[styles.dimScore, { color: band.color }]}>{cf.score.toFixed(0)}</Text>
                  </View>
                </View>
                {!!preview && (
                  <Text style={styles.observationText}>{preview}</Text>
                )}
              </Card>
            );
          })}
        </View>
      )}

      {/* ── CEFR Level Check graphic ── */}
      {targetLevel && achievedLevel && (
        <>
          <Text style={[type.label, { marginTop: 22, marginBottom: 6 }]}>CEFR LEVEL CHECK</Text>
          <Card padding={16}>
            <CefrLevelCheck
              targetLevel={targetLevel}
              achievedLevel={achievedLevel}
              bandDiff={bandDiff}
            />
          </Card>
        </>
      )}

      {/* ── Evidence ── */}
      {!!evidence?.evidence && (
        <Card padding={14} style={{ marginTop: 12 }}>
          <Text style={[type.label, { marginBottom: 10 }]}>EVIDENCE</Text>
          <Text style={styles.evidenceText}>{evidence.evidence}</Text>
        </Card>
      )}

    </>
  );
}

// ── CEFR Level Check bileşeni ────────────────────────────────────────────────
export function CefrLevelCheck({
  targetLevel, achievedLevel, bandDiff,
}: { targetLevel: string; achievedLevel: string; bandDiff: number | null }) {
  const targetBand   = CEFR_BANDS.find(b => b.level === targetLevel);
  const achievedBand = CEFR_BANDS.find(b => b.level === achievedLevel);
  const diffColor    = bandDiff === null ? colors.textSecondary
    : bandDiff > 0 ? (achievedBand?.color ?? colors.brandGreen)
    : bandDiff < 0 ? colors.danger
    : colors.brandGreenDeep;

  return (
    <View>
      {/* TARGET → DETECTED */}
      <View style={styles.levelCheckRow}>
        <View style={[styles.levelBox, {
          backgroundColor: targetBand?.bg ?? colors.bgCardTint,
          borderColor: (targetBand?.color ?? colors.border) + '55',
        }]}>
          <Text style={styles.levelBoxLabel}>TARGET</Text>
          <Text style={[styles.levelBoxValue, { color: targetBand?.color ?? colors.textSecondary }]}>
            {targetLevel}
          </Text>
        </View>

        <IconArrow size={20} color={colors.textTertiary}/>

        <View style={[styles.levelBox, {
          backgroundColor: achievedBand?.bg ?? colors.bgCardTint,
          borderColor: achievedBand?.color ?? colors.border,
          borderWidth: 1.5,
        }]}>
          <Text style={styles.levelBoxLabel}>DETECTED</Text>
          <Text style={[styles.levelBoxValue, { color: achievedBand?.color ?? colors.textSecondary }]}>
            {achievedLevel}
          </Text>
        </View>
      </View>

      {/* Özet satır */}
      {bandDiff !== null && (
        <View style={styles.levelSummary}>
          <Text style={[styles.levelSummaryText, { color: diffColor }]}>
            {bandDiff === 0
              ? `At target level ${targetLevel}.`
              : `${Math.abs(bandDiff)} band${Math.abs(bandDiff) > 1 ? 's' : ''} ${bandDiff > 0 ? 'above' : 'below'} target ${targetLevel}.`
            }
          </Text>
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  heroCard: {
    position: 'relative', overflow: 'hidden',
    backgroundColor: colors.bgInverse,
    borderRadius: radii.lg,
    padding: 16,
  },
  heroBlob: {
    position: 'absolute', right: -40, top: -30,
    width: 130, height: 130, borderRadius: 65,
  },
  heroBig:   { fontFamily: fonts.sansEb, fontSize: 64, letterSpacing: -2, lineHeight: 68 },
  cefrBadge: {
    borderRadius: radii.sm, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  cefrText:    { fontFamily: fonts.sansEb, fontSize: 14 },
  insightText: { fontFamily: fonts.sansSb, fontSize: 13 },

  scoringNote: {
    fontFamily: fonts.sans, fontSize: 13, lineHeight: 19,
    color: colors.textTertiary,
  },

  criterionName:   { fontFamily: fonts.sansSb, fontSize: 18, color: colors.textPrimary, letterSpacing: -0.2 },
  weightText:      { marginTop: 3, fontFamily: fonts.mono, fontSize: 11, color: colors.textTertiary, letterSpacing: 0.4 },
  dimScore:        { fontFamily: fonts.sansEb, fontSize: 24, lineHeight: 30  },
  observationText: { marginTop: 10, fontFamily: fonts.sans, fontSize: 13, lineHeight: 18, color: colors.textSecondary },

  // CEFR Level Check
  levelCheckHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  levelCheckRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  levelBox: {
    flex: 1, padding: 14, borderRadius: radii.md,
    borderWidth: 1,
  },
  levelBoxLabel: {
    fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.2,
    color: colors.textTertiary, marginBottom: 6,
  },
  levelBoxValue: { fontFamily: fonts.sansEb, fontSize: 28, letterSpacing: -0.5 },
  levelSummary: {
    backgroundColor: colors.bgCardTint,
    borderRadius: radii.sm,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  levelSummaryText: { fontFamily: fonts.sansSb, fontSize: 14, lineHeight: 20 },

  // Evidence
  evidenceText: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.textSecondary },

  feedbackText: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 22, color: colors.textSecondary },

  // Rubric info bottom sheet
  rubricInfoItem:    { paddingVertical: 16 },
  rubricInfoDivider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  rubricInfoTitle:   { fontFamily: fonts.sansSb, fontSize: 16, color: colors.brandBlue, marginBottom: 6 },
  rubricInfoBody:    { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.textSecondary },

  // Plagiarism banner
  plagBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.orange,
    borderRadius: radii.md, padding: 14, marginBottom: 12,
  },
  plagBannerText: {
    flex: 1, fontFamily: fonts.sansSb, fontSize: 13, lineHeight: 18, color: '#fff',
  },
  plagDetailBtn: {
    backgroundColor: '#fff', borderRadius: radii.pill,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  plagDetailBtnText: { fontFamily: fonts.sansSb, fontSize: 13, color: colors.orange },

  // Plagiarism bottom sheet
  plagSheetBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.orange, borderRadius: radii.md,
    padding: 14, marginBottom: 20,
  },
  plagSheetBannerText: {
    flex: 1, fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: '#fff',
  },
  plagCols: { flexDirection: 'row', gap: 12 },
  plagCol:  { flex: 1 },
  plagColRight: {
    backgroundColor: '#FEF2F2', borderRadius: radii.md,
    padding: 12,
  },
  plagColTitle: {
    fontFamily: fonts.sansSb, fontSize: 14, color: colors.textPrimary, marginBottom: 10,
  },
  plagColText: {
    fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, color: colors.textSecondary,
  },

  // AI Detection — high confidence statement
  aiConfidenceRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 4,
  },
  aiCircleBadge: {
    width: 52, height: 52, borderRadius: radii.pill,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1.5, borderColor: colors.danger,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  aiCircleBadgeText: {
    fontFamily: fonts.sansEb, fontSize: 17, color: colors.danger, lineHeight: 22
  },
  aiConfidenceText: {
    flex: 1, fontFamily: fonts.sansSb, fontSize: 15,
    color: colors.textPrimary, lineHeight: 22,
  },

  // AI Detection — confidence scores + bar
  aiConfLabel: {
    fontFamily: fonts.sans, fontSize: 13, color: colors.textTertiary, marginBottom: 16,
  },
  aiConfRings: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 8, marginBottom: 8,
  },
  aiSheetDivider: { height: 1, backgroundColor: colors.hairline, marginVertical: 16 },
  aiAdvTitle: {
    fontFamily: fonts.sansEb, fontSize: 16, color: colors.textPrimary, marginBottom: 4,
  },
  aiAdvSubtitle: {
    fontFamily: fonts.sans, fontSize: 13, color: colors.textSecondary, marginBottom: 12,
  },
  aiBarTrack: {
    height: 12, backgroundColor: colors.dangerSoft, borderRadius: radii.pill,
    overflow: 'hidden', marginBottom: 6,
  },
  aiBarFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    backgroundColor: colors.danger, borderRadius: radii.pill,
  },
  aiBarLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  aiBarLabelText: { fontFamily: fonts.sans, fontSize: 12, color: colors.textTertiary },

  // AI Detection sentence list
  aiSectionTitle: {
    fontFamily: fonts.sansEb, fontSize: 16, color: colors.textPrimary,
    marginBottom: 10, marginTop: 4,
  },
  aiImpactHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 8, marginBottom: 2,
  },
  aiImpactLabel: {
    fontFamily: fonts.sansSb, fontSize: 15, color: colors.textPrimary,
  },
  aiDotsRow: {
    flexDirection: 'row', gap: 3, alignItems: 'center', flexShrink: 0, marginTop: 5
  },
  aiDotSm: {
    width: 9, height: 9, borderRadius: 5, borderWidth: 1.5,
  },
  aiSentenceRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 12,
  },
  aiSentenceDivider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  aiSentenceText: {
    flex: 1, fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.textPrimary,
  },
});
