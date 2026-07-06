// AnalyticsPanel — Report ekranındaki "Analysis" segmenti.
// /student/get-self-analytics çağırır. Bölüm başlıkları ve içerik web
// dashboard'undaki analiz sayfasıyla aynı yapıyı izler.
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import Card from '@/components/Card';
import BottomSheet from '@/components/BottomSheet';
import { IconChevDown } from '@/components/Icons';
import { StatTile, LineTrend, DonutChart, RingMeter, BarRow, RadarChart } from '@/components/AnalyticsCharts';
import { fetchSelfAnalytics } from '@/api';
import { colors, fonts, radii, type, getCefrBand, levelColor, CEFR_BANDS } from '@/theme';
import { criterionToConfig } from '@/screens/ReportOverview';
import type { SelfAnalyticsWriting } from '@/types/api';

// Kategorik hata-tipi paleti — sabit sıra, validate_palette.js ile CVD-safe onaylı.
const ERROR_TYPE_COLORS: Record<string, string> = {
  'grammar-error': colors.rubricGrammar,
  'word-choice-error': colors.brandBlue,
  'word-form-error': colors.danger,
  'punctuation-error': colors.brandPink,
};
const ERROR_TYPE_FALLBACK = colors.textTertiary;
const CEFR_ORDER = CEFR_BANDS.map(b => b.level);

function titleCase(slug: string): string {
  return slug.replace(/::/g, ' · ').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// "grammar-error::missing-auxiliary-be" -> "Missing Auxiliary Be" (tip önekini at)
function subTypeLabel(subType: string): string {
  const detail = subType.includes('::') ? subType.split('::')[1] : subType;
  return titleCase(detail);
}

function shortCriterionLabel(criterion: string): string {
  return criterion.split(' & ')[0];
}

function formatCompact(n: number): string {
  if (n < 1000) return String(n);
  const k = n / 1000;
  return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
}

function SectionHeading({ label, right }: { label: string; right?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
      <Text style={type.label}>{label}</Text>
      {right ? <Text style={styles.sectionRight}>{right}</Text> : null}
    </View>
  );
}

export default function AnalyticsPanel({ userId }: { userId: string }) {
  const [writing, setWriting] = useState<SelfAnalyticsWriting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [essay,   setEssay]   = useState<string | null>(null);
  const [essayPickerOpen, setEssayPickerOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSelfAnalytics(userId, 'writing');
      setWriting(res.data.writing ?? null);
    } catch {
      setError('Could not load analysis.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const essays = useMemo(() => {
    const seen: string[] = [];
    writing?.outlineMastery.forEach(o => { if (!seen.includes(o.essay)) seen.push(o.essay); });
    return seen;
  }, [writing]);

  useEffect(() => {
    if (essays.length > 0 && !essay) setEssay(essays[0]);
  }, [essays, essay]);

  if (loading) {
    return (
      <View style={{ paddingVertical: 60, alignItems: 'center' }}>
        <ActivityIndicator color={colors.brandBlue}/>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{error}</Text>
        <Pressable onPress={load} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!writing || writing.kpis.submissions === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No analysis yet — complete a writing task first.</Text>
      </View>
    );
  }

  const { kpis } = writing;
  const band = getCefrBand(kpis.avgScore);
  const trend = [...writing.scoreTrend].sort((a, b) => a.date.localeCompare(b.date));
  const totalErrors = writing.errorBreakdown.reduce((sum, e) => sum + e.count, 0);
  const flagParts: string[] = [];
  if (kpis.aiFlagged > 0) flagParts.push(`${kpis.aiFlagged} AI`);
  if (kpis.plagiarismFlagged > 0) flagParts.push(`${kpis.plagiarismFlagged} copy`);

  const outlineForEssay = writing.outlineMastery.filter(o => o.essay === essay);
  const maxSubType = Math.max(1, ...writing.topErrorSubTypes.map(e => e.count));
  const meterColor = kpis.submissions > 0
    ? (writing.keywordPerformance.rate >= 80 ? colors.brandGreen
      : writing.keywordPerformance.rate >= 50 ? colors.warning : colors.danger)
    : colors.warning;
  const outlineColor = (avg: number) => avg >= 80 ? colors.brandGreen : avg >= 60 ? colors.warning : colors.danger;
  const cefrSorted = [...writing.cefrSnapshot].sort(
    (a, b) => CEFR_ORDER.indexOf(a.cefr) - CEFR_ORDER.indexOf(b.cefr)
  );

  return (
    <View>
      {/* KPI row */}
      <View style={styles.tileRow}>
        <StatTile label="SUBMISSIONS" value={String(kpis.submissions)} basis="31%"/>
        <StatTile label="AVG SCORE" value={kpis.avgScore.toFixed(0)} unit="/ 100" valueColor={band.color} basis="31%"/>
        <StatTile label="BEST SCORE" value={String(kpis.bestScore)} unit="/ 100" valueColor={colors.brandGreen} basis="31%"/>
      </View>
      <View style={[styles.tileRow, { marginTop: 10 }]}>
        <StatTile label="TOTAL WORDS" value={formatCompact(kpis.totalWords)} caption={`avg ${kpis.avgWordCount} / essay`} basis="48%"/>
        <StatTile
          label="ERRORS" value={String(kpis.totalErrors)} valueColor={colors.danger} basis="48%"
          caption={flagParts.length ? flagParts.join(' · ') : undefined}
        />
      </View>

      {/* Score trend */}
      {trend.length > 0 && (
        <>
          <View style={{ marginTop: 20 }}/>
          <SectionHeading label="WRITING SCORE TREND" right={`${trend.length} essay${trend.length > 1 ? 's' : ''}`}/>
          <Card padding={14}>
            <LineTrend points={trend.map((t, i) => ({ x: `E${i + 1}`, y: t.score }))}/>
          </Card>
        </>
      )}

      {/* Per-criterion average */}
      <View style={{ marginTop: 20 }}/>
      <SectionHeading label="PER-CRITERION AVERAGE" right="score / 100"/>
      <Card padding={16}>
        <RadarChart
          axes={writing.criteriaAverages.map(c => ({
            label: shortCriterionLabel(c.criterion),
            value: c.avg,
            dotColor: criterionToConfig(c.criterion).color,
          }))}
        />
      </Card>

      {/* Outline mastery */}
      {essays.length > 0 && (
        <>
          <View style={{ marginTop: 20 }}/>
          <SectionHeading label="OUTLINE MASTERY" right="avg per section"/>
          {essays.length > 1 && (
            <Pressable style={styles.essaySelect} onPress={() => setEssayPickerOpen(true)}>
              <Text style={styles.essaySelectText} numberOfLines={1}>{essay}</Text>
              <IconChevDown size={16} color={colors.textSecondary}/>
            </Pressable>
          )}
          <Card padding={14}>
            {outlineForEssay.map(o => (
              <BarRow key={o.section} label={o.section} value={o.avg} max={100} color={outlineColor(o.avg)}/>
            ))}
          </Card>

          <BottomSheet visible={essayPickerOpen} onClose={() => setEssayPickerOpen(false)} maxHeight={420}>
            <Text style={[type.label, { marginBottom: 12, paddingHorizontal: 4 }]}>SELECT ESSAY</Text>
            <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
              {essays.map((e, i) => (
                <Pressable
                  key={e}
                  onPress={() => { setEssay(e); setEssayPickerOpen(false); }}
                  style={[styles.essayOption, i < essays.length - 1 && styles.essayOptionDivider]}
                >
                  <Text style={[styles.essayOptionText, e === essay && styles.essayOptionTextActive]}>{e}</Text>
                </Pressable>
              ))}
              <View style={{ height: 8 }}/>
            </ScrollView>
          </BottomSheet>
        </>
      )}

      {/* Error type mix */}
      {writing.errorBreakdown.length > 0 && (
        <>
          <View style={{ marginTop: 20 }}/>
          <SectionHeading label="ERROR TYPE MIX" right={`${totalErrors} total`}/>
          <Card padding={16} style={{ alignItems: 'center' }}>
            <DonutChart
              centerValue={String(totalErrors)}
              centerLabel="ERRORS"
              segments={writing.errorBreakdown.map(e => ({
                label: titleCase(e.type), value: e.count,
                color: ERROR_TYPE_COLORS[e.type] ?? ERROR_TYPE_FALLBACK,
              }))}
            />
            <View style={styles.legendGrid}>
              {writing.errorBreakdown.map(e => (
                <View key={e.type} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: ERROR_TYPE_COLORS[e.type] ?? ERROR_TYPE_FALLBACK }]}/>
                  <Text style={styles.legendLabel} numberOfLines={1}>{titleCase(e.type)}</Text>
                  <Text style={styles.legendValue}>{e.count}</Text>
                  <Text style={styles.legendPct}>{Math.round((e.count / totalErrors) * 100)}%</Text>
                </View>
              ))}
            </View>
          </Card>
        </>
      )}

      {/* Top sub-types */}
      {writing.topErrorSubTypes.length > 0 && (
        <>
          <View style={{ marginTop: 20 }}/>
          <SectionHeading label="TOP SUB-TYPES" right={String(writing.topErrorSubTypes.length)}/>
          <Card padding={14}>
            {writing.topErrorSubTypes.map(e => (
              <BarRow key={e.subType} label={subTypeLabel(e.subType)} value={e.count} max={maxSubType} color={colors.rubricGrammar}/>
            ))}
          </Card>
        </>
      )}

      {/* Words to upgrade */}
      {writing.topUpgradesToLearn.length > 0 && (
        <>
          <View style={{ marginTop: 20 }}/>
          <SectionHeading label="WORDS TO UPGRADE" right={String(writing.topUpgradesToLearn.length)}/>
          <Card padding={0}>
            {writing.topUpgradesToLearn.map((u, i) => (
              <View key={i} style={[styles.upgradeRow, i < writing.topUpgradesToLearn.length - 1 && styles.upgradeRowDivider]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.upgradeFromChip}>
                    <Text style={styles.upgradeFromText} numberOfLines={1}>{u.from}</Text>
                  </View>
                  <View style={{ flex: 1 }}/>
                  <Text style={styles.upgradeCount}>×{u.count}</Text>
                </View>
                <Text style={styles.upgradeSuggestions} numberOfLines={2}>{u.suggestions.join(' · ')}</Text>
              </View>
            ))}
          </Card>
        </>
      )}

      {/* Keyword usage */}
      <View style={{ marginTop: 20 }}/>
      <SectionHeading label="KEYWORD USAGE"/>
      <Card padding={16} style={{ alignItems: 'center' }}>
        <RingMeter value={writing.keywordPerformance.rate} color={meterColor}/>
        <Text style={styles.keywordCaption}>
          {writing.keywordPerformance.used} / {writing.keywordPerformance.required} required keywords used
        </Text>
        {writing.keywordPerformance.mostMissed.length > 0 && (
          <>
            <Text style={styles.keywordSubheading}>MOST-MISSED KEYWORDS</Text>
            <View style={styles.chipRow}>
              {writing.keywordPerformance.mostMissed.map(m => (
                <View key={m.keyword} style={styles.missedChip}>
                  <Text style={styles.missedChipText}>{m.keyword} ×{m.missedCount}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </Card>

      {/* CEFR breakdown */}
      {writing.cefrSnapshot.length > 0 && (
        <>
          <View style={{ marginTop: 20 }}/>
          <SectionHeading label="CEFR BREAKDOWN" right={`${kpis.submissions} essays`}/>
          <Card padding={16}>
            <Text style={styles.cefrNote}>
              How many of your essays were scored at each CEFR band. This is a per-submission count, not your overall level — placement is coming soon.
            </Text>
            <View style={styles.cefrCountRow}>
              {cefrSorted.map(c => (
                <Text key={c.cefr} style={styles.cefrCount}>{c.count}</Text>
              ))}
            </View>
            <View style={styles.cefrBarRow}>
              {cefrSorted.map(c => {
                const maxCount = Math.max(...cefrSorted.map(x => x.count));
                const h = Math.max(6, (c.count / maxCount) * 90);
                const lc = levelColor(c.cefr);
                return (
                  <View key={c.cefr} style={styles.cefrBarCol}>
                    <View style={[styles.cefrBar, { height: h, backgroundColor: lc.fg }]}/>
                  </View>
                );
              })}
            </View>
            <View style={styles.cefrLabelRow}>
              {cefrSorted.map(c => (
                <Text key={c.cefr} style={styles.cefrLevel} numberOfLines={2}>{c.cefr}</Text>
              ))}
            </View>
          </Card>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionRight: { fontFamily: fonts.mono, fontSize: 11, color: colors.textTertiary, letterSpacing: 0.5 },

  tileRow: { flexDirection: 'row', gap: 10 },

  essaySelect: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 10, paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: radii.md, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  essaySelectText: { flex: 1, fontFamily: fonts.sansSb, fontSize: 14.5, color: colors.textPrimary, marginRight: 8 },
  essayOption: { paddingVertical: 14, paddingHorizontal: 4 },
  essayOptionDivider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  essayOptionText: { fontFamily: fonts.sans, fontSize: 15, color: colors.textPrimary },
  essayOptionTextActive: { fontFamily: fonts.sansEb, color: colors.brandBlue },

  legendGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 18, width: '100%', columnGap: 20 },
  legendItem: { flexBasis: '42%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendLabel: { flex: 1, fontFamily: fonts.sans, fontSize: 12, color: colors.textPrimary },
  legendValue: { fontFamily: fonts.sansEb, fontSize: 12.5, color: colors.textPrimary, minWidth: 14, textAlign: 'right' },
  legendPct: { fontFamily: fonts.mono, fontSize: 10.5, color: colors.textTertiary, minWidth: 30, textAlign: 'right' },

  upgradeRow: { padding: 14, gap: 6 },
  upgradeRowDivider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  upgradeFromChip: {
    alignSelf: 'flex-start', backgroundColor: colors.dangerSoft,
    borderRadius: radii.sm, paddingHorizontal: 8, paddingVertical: 3,
  },
  upgradeFromText: { fontFamily: fonts.sansSb, fontSize: 12.5, color: colors.danger },
  upgradeSuggestions: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.brandGreenDeep },
  upgradeCount: { alignSelf: 'flex-end', fontFamily: fonts.mono, fontSize: 11, color: colors.textTertiary },

  keywordCaption: { marginTop: 10, fontFamily: fonts.sansSb, fontSize: 13.5, color: colors.textPrimary },
  keywordSubheading: { marginTop: 18, marginBottom: 10, fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1, color: colors.textTertiary, alignSelf: 'flex-start' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  missedChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: radii.pill, backgroundColor: colors.dangerSoft,
  },
  missedChipText: { fontFamily: fonts.sansSb, fontSize: 12, color: colors.danger },

  cefrNote: { fontFamily: fonts.sans, fontSize: 12.5, lineHeight: 18, color: colors.textTertiary, marginBottom: 16 },
  cefrCountRow: { flexDirection: 'row', marginBottom: 6 },
  cefrCount: { flex: 1, textAlign: 'center', fontFamily: fonts.sansEb, fontSize: 13, color: colors.textPrimary },
  cefrBarRow: { flexDirection: 'row', alignItems: 'flex-end', height: 90 },
  cefrBarCol: { flex: 1, alignItems: 'center' },
  cefrBar: { width: '55%', maxWidth: 40, minWidth: 8, borderRadius: radii.xs },
  cefrLabelRow: { flexDirection: 'row', marginTop: 6 },
  cefrLevel: { flex: 1, fontFamily: fonts.mono, fontSize: 10, color: colors.textSecondary, textAlign: 'center' },

  retryBtn: { marginTop: 4, paddingHorizontal: 16, paddingVertical: 8, borderRadius: radii.pill, backgroundColor: colors.brandBlueSoft },
  retryText: { fontFamily: fonts.sansSb, fontSize: 13, color: colors.brandBlue },

  empty: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontFamily: fonts.sans, fontSize: 15, color: colors.textTertiary, textAlign: 'center', paddingHorizontal: 20 },
});
