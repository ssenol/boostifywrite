// Progress — gerçek tamamlanan raporlar + statik CEFR chart
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import Svg, { Path, Line, Circle } from 'react-native-svg';

import { ScreenSurface, ScreenScroll } from '@/components/Screen';
import Card from '@/components/Card';
import SectionHeader from '@/components/SectionHeader';
import { IconArrowUp } from '@/components/Icons';
import { useAuth } from '@/context/AuthContext';
import { fetchCompletedReports } from '@/api';
import { colors, fonts, radii, type } from '@/theme';
import type { CompletedExercise } from '@/types/api';

// Statik grafik noktaları — gerçek CEFR zaman serisi API'den gelmiyor
const POINTS = [
  { m: 'NOV', s: 4.2 },
  { m: 'DEC', s: 4.6 },
  { m: 'JAN', s: 5.0 },
  { m: 'FEB', s: 5.3 },
  { m: 'MAR', s: 5.6 },
  { m: 'APR', s: 5.8 },
];

const xy = (i: number, s: number, w: number) => ({
  x: (i / (POINTS.length - 1)) * w,
  y: 95 - ((s - 3) / 5) * 80,
});
const linePath = (w: number) =>
  POINTS.map((p, i) => `${i === 0 ? 'M' : 'L'}${xy(i, p.s, w).x},${xy(i, p.s, w).y}`).join(' ');
const areaPath = (w: number) => `${linePath(w)} L${w},110 L0,110 Z`;

const ACCENT_COLORS = [
  colors.rubricTask, colors.rubricCohesion, colors.rubricLexical, colors.rubricGrammar,
];

export default function Progress() {
  const { user } = useAuth();

  const [exercises,  setExercises]  = useState<CompletedExercise[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!user) return;
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const res = await fetchCompletedReports({ userId: user.userId, perPageCount: 20 });
      setExercises(res.data.exercises);
    } catch {
      setError('Could not load reports.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <ScreenSurface>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.brandBlue}/>
        </View>
      </ScreenSurface>
    );
  }

  return (
    <ScreenSurface>
      <View style={styles.header}>
        <Text style={[type.label, { marginBottom: 4 }]}>YOUR JOURNEY</Text>
        <Text style={styles.title}>Progress</Text>
      </View>

      <ScreenScroll
        contentStyle={{ padding: 20, paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(true); }}
            tintColor={colors.brandBlue}
          />
        }
      >
        {/* Hero level chart */}
        <Card padding={18}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={[type.label, { marginBottom: 4 }]}>CURRENT LEVEL</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
                <Text style={styles.levelBig}>B1+</Text>
                <Text style={styles.levelScore}>5.8/9</Text>
              </View>
            </View>
            <View style={styles.deltaPill}>
              <IconArrowUp size={11} color={colors.brandGreenDeep}/>
              <Text style={styles.deltaText}>+0.6 in 30d</Text>
            </View>
          </View>

          <View style={{ marginTop: 22, height: 110 }}>
            <Svg width="100%" height={110} viewBox="0 0 320 110">
              {[0, 1, 2, 3].map(i => (
                <Line key={i} x1={0} x2={320} y1={i * 30 + 5} y2={i * 30 + 5}
                  stroke={colors.hairline} strokeWidth={1} strokeDasharray="2 4"/>
              ))}
              <Path d={areaPath(320)} fill={colors.brandBlueSoft} opacity={0.7}/>
              <Path d={linePath(320)} stroke={colors.brandBlue} strokeWidth={2.2} fill="none"
                strokeLinejoin="round" strokeLinecap="round"/>
              {POINTS.map((p, i) => {
                const { x, y } = xy(i, p.s, 320);
                const last = i === POINTS.length - 1;
                return (
                  <Circle key={i} cx={x} cy={y} r={last ? 5 : 3}
                    fill={last ? colors.brandBlue : '#fff'}
                    stroke={colors.brandBlue} strokeWidth={2}/>
                );
              })}
            </Svg>
          </View>
          <View style={styles.xLabels}>
            {POINTS.map(p => (
              <Text key={p.m} style={styles.xLabel}>{p.m}</Text>
            ))}
          </View>
        </Card>

        {/* CEFR merdiveni */}
        <View style={{ marginTop: 14 }}>
          <SectionHeader label="CEFR LADDER"/>
          <View style={styles.ladder}>
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => {
              const isCurrent = l === 'B1';
              const isPast    = ['A1', 'A2'].includes(l);
              return (
                <View key={l} style={[
                  styles.ladderCell,
                  isCurrent && { backgroundColor: colors.brandBlue },
                  isPast    && { backgroundColor: colors.brandBlueSoft },
                ]}>
                  <Text style={[
                    styles.ladderText,
                    isCurrent && { color: '#fff' },
                    isPast    && { color: colors.brandBlue },
                  ]}>{l}</Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.next}>NEXT: B2 — STRENGTHEN GRAMMAR & LEXIS</Text>
        </View>

        {/* Son yazılar */}
        <View style={{ marginTop: 22 }}>
          <SectionHeader label={`RECENT ESSAYS · ${exercises.length}`}/>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : exercises.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No completed essays yet.</Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {exercises.map((e, i) => {
                const best = e.attempts.reduce<number>((max, a) => Math.max(max, a.mainScore), 0);
                return (
                  <Card key={e.assignedTaskId} accent={ACCENT_COLORS[i % ACCENT_COLORS.length]} padding={14}>
                    <View style={[styles.recentRow, { marginLeft: 6 }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.recentTitle}>{e.taskName}</Text>
                        <Text style={styles.recentWhen}>
                          RETURNED {new Date(e.lastSolvedDate).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric',
                          }).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.recentScore}>{best}/100</Text>
                        <Text style={styles.recentAttempts}>
                          {e.totalAttempts} attempt{e.totalAttempts !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </View>
      </ScreenScroll>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 18,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
  },
  title: { fontFamily: fonts.sansSb, fontSize: 26, letterSpacing: -0.5, color: colors.textPrimary },

  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  levelBig:    { fontFamily: fonts.sansEb, fontSize: 36, color: colors.brandBlue },
  levelScore:  { fontFamily: fonts.mono, fontSize: 14, color: colors.textTertiary },

  deltaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: colors.brandGreenSoft, borderRadius: radii.pill,
  },
  deltaText: { fontFamily: fonts.sansSb, fontSize: 12, color: colors.brandGreenDeep },

  xLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  xLabel:  { fontFamily: fonts.mono, fontSize: 11, color: colors.textTertiary },

  ladder: {
    flexDirection: 'row', gap: 4,
    backgroundColor: colors.bgCard, padding: 12,
    borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border,
  },
  ladderCell: {
    flex: 1, height: 56, borderRadius: radii.sm,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.bgCardTint,
  },
  ladderText: { fontFamily: fonts.sansEb, fontSize: 15, color: colors.textTertiary },
  next: { fontFamily: fonts.mono, fontSize: 11, color: colors.textTertiary, marginTop: 8, letterSpacing: 0.6 },

  recentRow:      { flexDirection: 'row', alignItems: 'center' },
  recentTitle:    { fontFamily: fonts.sansSb, fontSize: 16, color: colors.textPrimary, letterSpacing: -0.2, lineHeight: 20 },
  recentWhen:     { fontFamily: fonts.mono, fontSize: 11, color: colors.textTertiary, marginTop: 3 },
  recentScore:    { fontFamily: fonts.sansEb, fontSize: 16, color: colors.textPrimary },
  recentAttempts: { fontFamily: fonts.mono, fontSize: 11, color: colors.textTertiary },

  errorBox:  { backgroundColor: colors.dangerSoft, borderRadius: radii.md, padding: 14 },
  errorText: { fontFamily: fonts.sans, fontSize: 14, color: colors.danger },
  empty:     { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontFamily: fonts.sans, fontSize: 16, color: colors.textTertiary },
});
