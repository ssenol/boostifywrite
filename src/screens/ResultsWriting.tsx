import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import ResultsShell from './ResultsShell';
import FilterChip from '@/components/FilterChip';
import IconButton from '@/components/IconButton';
import { IconChevLeft, IconChevRight } from '@/components/Icons';
import { useReport, isInlineCorrection } from '@/context/ReportContext';
import { colors, fonts, radii } from '@/theme';
import type { InlineCorrection } from '@/types/api';
import type { HomeStackParamList } from '@/navigation/types';

type Route = RouteProp<HomeStackParamList, 'ResultsWriting'>;
type AnnKind = 'grammar' | 'cohesion' | 'vocab';

const KIND_COLOR: Record<AnnKind, string> = {
  grammar:  colors.rubricGrammar,
  cohesion: colors.rubricCohesion,
  vocab:    colors.rubricLexical,
};
const KIND_SOFT: Record<AnnKind, string> = {
  grammar:  colors.rubricGrammarSoft,
  cohesion: colors.rubricCohesionSoft,
  vocab:    colors.rubricLexicalSoft,
};
const KIND_LABEL: Record<AnnKind, string> = {
  grammar: 'GRAMMAR', cohesion: 'COHESION', vocab: 'LEXICAL RANGE',
};

// API kriter adından kind'a haritalama
function criterionToKind(name: string): AnnKind {
  const n = name.toLowerCase();
  if (n.includes('gramm')) return 'grammar';
  if (n.includes('coher')) return 'cohesion';
  return 'vocab';
}

type Ann = InlineCorrection & { kind: AnnKind };

export default function ResultsWriting() {
  const { solvedTaskId } = useRoute<Route>().params;
  const { report } = useReport();
  const [filter, setFilter]   = useState<'All' | 'Grammar' | 'Cohesion' | 'Vocab'>('All');
  const [pick,   setPick]     = useState(0);
  const [expanded, setExpanded] = useState(true);

  // Tüm InlineCorrection'ları topla
  const allAnns: Ann[] = [];
  if (report) {
    for (const entry of report.result) {
      const kind = criterionToKind(
        (entry.result as any)?.criterion ?? entry.name ?? ''
      );
      const issues: unknown[] = (entry.result as any)?.issues ?? [];
      for (const issue of issues) {
        if (isInlineCorrection(issue)) {
          allAnns.push({ ...issue, kind });
        }
      }
    }
  }

  const filtered = filter === 'All'
    ? allAnns
    : allAnns.filter(a => a.kind === filter.toLowerCase());

  // pick index'i sınırla
  const safeIdx = Math.min(pick, Math.max(0, filtered.length - 1));
  const ann     = filtered[safeIdx];

  useEffect(() => { setExpanded(true); }, [pick]);

  const counts = {
    grammar:  allAnns.filter(a => a.kind === 'grammar').length,
    cohesion: allAnns.filter(a => a.kind === 'cohesion').length,
    vocab:    allAnns.filter(a => a.kind === 'vocab').length,
  };

  const peekSheet = (
    <View style={[styles.peek, expanded ? styles.peekExpanded : styles.peekCollapsed]}>
      <Pressable onPress={() => setExpanded(e => !e)} style={styles.handle}/>

      {ann ? (
        <>
          <Pressable onPress={() => setExpanded(e => !e)} style={styles.peekHeader}>
            <View style={[styles.numberBadge, { backgroundColor: KIND_COLOR[ann.kind] }]}>
              <Text style={styles.numberText}>{safeIdx + 1}</Text>
            </View>
            <Text style={[styles.kindLabel, { color: KIND_COLOR[ann.kind] }]}>{KIND_LABEL[ann.kind]}</Text>
            <View style={{ flex: 1 }}/>
            <Text style={styles.counter}>{safeIdx + 1}/{filtered.length}</Text>
            <IconButton size={30} onPress={() => setPick(p => Math.max(0, p - 1))}>
              <IconChevLeft size={14} color={colors.textPrimary}/>
            </IconButton>
            <IconButton size={30} onPress={() => setPick(p => Math.min(filtered.length - 1, p + 1))}>
              <IconChevRight size={14} color={colors.textPrimary}/>
            </IconButton>
          </Pressable>

          <Text style={styles.suggestion} numberOfLines={expanded ? undefined : 1}>
            <Text style={styles.suggestionBad}>{ann.wrongWord || ann.wrongContent}</Text>
            <Text style={styles.suggestionArrow}> → </Text>
            <Text style={styles.suggestionGood}>{ann.correctWord || ann.correctedContent}</Text>
          </Text>

          {expanded && !!ann.detailFeedbackWithReason && (
            <Text style={styles.explain}>{ann.detailFeedbackWithReason}</Text>
          )}
          {expanded && !!ann.exampleOfUsage && (
            <Text style={styles.example}>{ann.exampleOfUsage}</Text>
          )}
        </>
      ) : (
        <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.textTertiary, padding: 8 }}>
          No corrections found.
        </Text>
      )}
    </View>
  );

  return (
    <ResultsShell active="Writing" solvedTaskId={solvedTaskId} bottomOverlay={peekSheet}>
      {/* Filter chips */}
      <View style={styles.filters}>
        <FilterChip label="All"      count={allAnns.length} active={filter === 'All'}      onPress={() => { setFilter('All');      setPick(0); }}/>
        <FilterChip label="Grammar"  count={counts.grammar}  color={colors.rubricGrammar}  active={filter === 'Grammar'}  onPress={() => { setFilter('Grammar');  setPick(0); }}/>
        <FilterChip label="Cohesion" count={counts.cohesion} color={colors.rubricCohesion} active={filter === 'Cohesion'} onPress={() => { setFilter('Cohesion'); setPick(0); }}/>
        <FilterChip label="Vocab"    count={counts.vocab}    color={colors.rubricLexical}  active={filter === 'Vocab'}    onPress={() => { setFilter('Vocab');    setPick(0); }}/>
      </View>

      {/* Correction list */}
      <View style={{ gap: 8 }}>
        {filtered.map((a, i) => (
          <Pressable key={i} onPress={() => { setPick(i); setExpanded(true); }}
            style={[styles.corrRow, i === safeIdx && { borderColor: KIND_COLOR[a.kind] }]}
          >
            <View style={[styles.corrBadge, { backgroundColor: KIND_COLOR[a.kind] }]}>
              <Text style={styles.corrBadgeText}>{i + 1}</Text>
            </View>
            <View style={[styles.corrPill, { backgroundColor: KIND_SOFT[a.kind] }]}>
              <Text style={[styles.corrWrong, { color: KIND_COLOR[a.kind] }]}>
                {a.wrongWord || a.wrongContent}
              </Text>
            </View>
            <Text style={styles.corrArrow}>→</Text>
            <Text style={styles.corrGood} numberOfLines={1}>
              {a.correctWord || a.correctedContent}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={{ height: 300 }}/>
    </ResultsShell>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', gap: 6, marginBottom: 14, flexWrap: 'wrap' },

  corrRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 10, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  corrBadge: {
    width: 22, height: 22, borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  corrBadgeText: { fontFamily: fonts.monoSb, fontSize: 11, color: '#fff' },
  corrPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.sm },
  corrWrong: { fontFamily: fonts.sansSb, fontSize: 13, textDecorationLine: 'line-through' },
  corrArrow: { fontFamily: fonts.sans, fontSize: 13, color: colors.textTertiary },
  corrGood:  { flex: 1, fontFamily: fonts.sansSb, fontSize: 13, color: colors.brandGreenDeep },

  peek: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 18,
    shadowColor: '#0E1116', shadowOpacity: 0.10, shadowRadius: 32,
    shadowOffset: { width: 0, height: -12 }, elevation: 12,
  },
  peekExpanded:  { maxHeight: 280 },
  peekCollapsed: { maxHeight: 100, overflow: 'hidden' },
  handle: {
    alignSelf: 'center', width: 44, height: 5, borderRadius: 99,
    backgroundColor: colors.borderStrong, marginVertical: 8,
  },

  peekHeader:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  numberBadge: { width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  numberText:  { fontFamily: fonts.monoSb, fontSize: 13, color: '#fff' },
  kindLabel:   { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 0.8 },
  counter:     { fontFamily: fonts.mono, fontSize: 12, color: colors.textTertiary },

  suggestion:      { marginTop: 10, fontFamily: fonts.sansSb, fontSize: 15 },
  suggestionBad:   { color: colors.textTertiary, textDecorationLine: 'line-through' },
  suggestionArrow: { color: colors.textPrimary },
  suggestionGood:  { color: colors.brandGreenDeep },

  explain: { marginTop: 10, fontFamily: fonts.sans, fontSize: 13.5, color: colors.textSecondary, lineHeight: 20 },
  example: { marginTop: 8, fontFamily: fonts.sans, fontSize: 13, color: colors.textTertiary, lineHeight: 19 },
});
