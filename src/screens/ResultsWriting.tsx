// 07 · Results · Writing (annotated essay)
// Inline numbered annotations over the essay; tappable peek sheet
// anchored to the bottom of the screen, collapsible.
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import ResultsShell from './ResultsShell';
import FilterChip from '@/components/FilterChip';
import IconButton from '@/components/IconButton';
import { IconChevLeft, IconChevRight } from '@/components/Icons';
import { colors, fonts, radii, type } from '@/theme';

type AnnKind = 'grammar' | 'cohesion' | 'vocab';
type Ann = { kind: AnnKind; badText: string; goodText: string; text: string };

const ANNS: Record<number, Ann> = {
  1: { kind: 'grammar',  badText: 'the',         goodText: '∅ (drop the article)',
       text: '"the" is unnecessary here. Use the bare proper noun.' },
  2: { kind: 'cohesion', badText: 'Also',        goodText: 'In addition, / What is more,',
       text: '"Also" at sentence start is A2-level. Try a B1 linker.' },
  3: { kind: 'vocab',    badText: 'facilities',  goodText: 'amenities / public spaces',
       text: 'Good topic-word — but "amenities" is one step up the lexis ladder.' },
  4: { kind: 'vocab',    badText: 'very good',   goodText: 'invaluable, remarkably effective',
       text: '"Very + adjective" is A1-level. At A2/B1, use a single stronger adjective to lift your Lexical Range score.' },
  5: { kind: 'grammar',  badText: 'people scrolling', goodText: 'They scroll / are scrolling',
       text: 'Incomplete verb form. Pair the subject with a finite verb.' },
  6: { kind: 'grammar',  badText: 'Different country', goodText: 'people from different countries',
       text: 'Adjective + plural noun mismatch. "country" should be plural.' },
  7: { kind: 'cohesion', badText: 'it depends',  goodText: 'a clearer stance',
       text: 'Hedging weakens the conclusion. Commit to one side.' },
};

const annColor = (k: AnnKind) =>
  ({ grammar: colors.rubricGrammar, cohesion: colors.rubricCohesion, vocab: colors.rubricLexical }[k]);
const annSoft = (k: AnnKind) =>
  ({ grammar: colors.rubricGrammarSoft, cohesion: colors.rubricCohesionSoft, vocab: colors.rubricLexicalSoft }[k]);
const kindLabel = (k: AnnKind) =>
  ({ grammar: 'GRAMMAR', cohesion: 'COHESION', vocab: 'LEXICAL RANGE' }[k]);

export default function ResultsWriting() {
  const [filter, setFilter] = useState<'All' | 'Grammar' | 'Vocab' | 'Cohesion'>('All');
  const [pick,   setPick]   = useState(4);
  const [expanded, setExpanded] = useState(true);

  // Auto-expand whenever picked annotation changes.
  useEffect(() => { setExpanded(true); }, [pick]);

  const a = ANNS[pick];

  // ── Bottom peek sheet ──────────────────────────────────────
  const peekSheet = (
    <View style={[styles.peek, expanded ? styles.peekExpanded : styles.peekCollapsed]}>
      <Pressable onPress={() => setExpanded(e => !e)} style={styles.handle}/>

      {/* Header row */}
      <Pressable onPress={() => setExpanded(e => !e)} style={styles.peekHeader}>
        <View style={[styles.numberBadge, { backgroundColor: annColor(a.kind) }]}>
          <Text style={styles.numberText}>{pick}</Text>
        </View>
        <Text style={[styles.kindLabel, { color: annColor(a.kind) }]}>{kindLabel(a.kind)}</Text>
        <View style={{ flex: 1 }}/>
        <Text style={styles.counter}>{pick}/7</Text>
        <IconButton size={30} onPress={() => setPick(p => Math.max(1, p - 1))}>
          <IconChevLeft size={14} color={colors.textPrimary}/>
        </IconButton>
        <IconButton size={30} onPress={() => setPick(p => Math.min(7, p + 1))}>
          <IconChevRight size={14} color={colors.textPrimary}/>
        </IconButton>
      </Pressable>

      {/* Suggestion line */}
      <Text style={styles.suggestion} numberOfLines={expanded ? undefined : 1}>
        <Text style={styles.suggestionBad}>{a.badText}</Text>
        <Text style={styles.suggestionArrow}> → </Text>
        <Text style={styles.suggestionGood}>{a.goodText}</Text>
      </Text>

      {/* Explanation — only when expanded */}
      {expanded ? (
        <Text style={styles.explain}>{a.text}</Text>
      ) : null}
    </View>
  );

  // ── Inline annotated chunk ─────────────────────────────────
  const Mark = ({ n }: { n: number }) => {
    const data = ANNS[n];
    if (filter !== 'All' && filter.toLowerCase() !== data.kind) {
      return <Text>{data.badText}</Text>;
    }
    const c = annColor(data.kind);
    const isPick = pick === n;
    return (
      <Text>
        <Text onPress={() => setPick(n)} style={{
          backgroundColor: data.kind === 'grammar' ? 'transparent' : annSoft(data.kind),
          borderBottomWidth: data.kind === 'grammar' ? 2 : 0,
          borderBottomColor: c,
        }}>{data.badText}</Text>
        <Text onPress={() => setPick(n)} style={[
          styles.markBadge,
          { backgroundColor: c, transform: [{ scale: isPick ? 1.15 : 1 }] },
        ]}> {n} </Text>
      </Text>
    );
  };

  return (
    <ResultsShell active="Writing" bottomOverlay={peekSheet}>
      {/* Filter chips */}
      <View style={styles.filters}>
        <FilterChip label="All"      count={11} active={filter==='All'}      onPress={() => setFilter('All')}/>
        <FilterChip label="Grammar"  count={7}  color={colors.rubricGrammar}  active={filter==='Grammar'}  onPress={() => setFilter('Grammar')}/>
        <FilterChip label="Vocab"    count={3}  color={colors.rubricLexical}  active={filter==='Vocab'}    onPress={() => setFilter('Vocab')}/>
        <FilterChip label="Cohesion" count={1}  color={colors.rubricCohesion} active={filter==='Cohesion'} onPress={() => setFilter('Cohesion')}/>
      </View>

      <Text style={styles.essayTitle}>My Town & Neighbourhood</Text>

      <Text style={styles.para}>
        My town is called Bursa. It is a big city in <Mark n={1}/> north-west of Turkey.
        There are many good things about living here.
      </Text>
      <Text style={[type.labelSm, styles.paraLabel]}>¶2 — ADVANTAGES</Text>
      <Text style={styles.para}>
        <Mark n={2}/>, we have a lot of historic places and <Mark n={3}/> for young people.
        The food is <Mark n={4}/> and traditional. My neighbourhood is quiet and I can walk to school.
      </Text>
      <Text style={[type.labelSm, styles.paraLabel]}>¶3 — DISADVANTAGES</Text>
      <Text style={styles.para}>
        However, there are some problems. In summer, <Mark n={5}/> the streets all day because of tourism.{' '}
        <Mark n={6}/> people come here and it makes traffic jam.
      </Text>
      <Text style={[type.labelSm, styles.paraLabel]}>¶4 — CONCLUSION</Text>
      <Text style={styles.para}>
        In my opinion, <Mark n={7}/> on what you like, but I prefer my town because it is peaceful.
      </Text>

      {/* Spacer so last para isn't hidden behind peek */}
      <View style={{ height: 280 }}/>
    </ResultsShell>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', gap: 6, marginBottom: 14, flexWrap: 'wrap' },

  essayTitle: { fontFamily: fonts.sansSb, fontSize: 22, marginBottom: 12, letterSpacing: -0.3 },
  para: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 30 },
  paraLabel: { marginTop: 18, marginBottom: 8 },

  markBadge: {
    color: '#fff', fontFamily: fonts.monoSb, fontSize: 11,
    borderRadius: 4, paddingHorizontal: 3,
  },

  peek: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 18,
    shadowColor: '#0E1116', shadowOpacity: 0.10, shadowRadius: 32, shadowOffset: { width: 0, height: -12 }, elevation: 12,
  },
  peekExpanded:  { maxHeight: 280 },
  peekCollapsed: { maxHeight: 100, overflow: 'hidden' },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 99, backgroundColor: colors.borderStrong, marginVertical: 8 },

  peekHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  numberBadge: {
    width: 26, height: 26, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },
  numberText: { fontFamily: fonts.monoSb, fontSize: 13, color: '#fff' },
  kindLabel:  { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 0.8 },
  counter:    { fontFamily: fonts.mono, fontSize: 12, color: colors.textTertiary },

  suggestion: { marginTop: 10, fontFamily: fonts.sansSb, fontSize: 15 },
  suggestionBad:   { color: colors.textTertiary, textDecorationLine: 'line-through' },
  suggestionArrow: { color: colors.textPrimary },
  suggestionGood:  { color: colors.brandGreenDeep },

  explain: { marginTop: 10, fontFamily: fonts.sans, fontSize: 13.5, color: colors.textSecondary, lineHeight: 20 },
});
