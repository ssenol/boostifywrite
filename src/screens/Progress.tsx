// Progress — gerçek tamamlanan raporlar + statik CEFR chart
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenSurface, ScreenScroll } from '@/components/Screen';
import Card from '@/components/Card';
import SectionHeader from '@/components/SectionHeader';
import { IconChevRight } from '@/components/Icons';
import { useAuth } from '@/context/AuthContext';
import { fetchCompletedReports } from '@/api';
import { colors, fonts, radii, type } from '@/theme';
import type { CompletedExercise } from '@/types/api';
import type { ReportStackParamList } from '@/navigation/types';

function getScoreColor(score: number): string {
  if (score >= 81) return '#16A34A'; // yeşil
  if (score >= 61) return '#EA580C'; // turuncu
  if (score >= 31) return '#CA8A04'; // sarı
  return '#DC2626'; // kırmızı
}

export default function Progress() {
  const { user } = useAuth();
  const nav = useNavigation<NativeStackNavigationProp<ReportStackParamList>>();

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
        contentStyle={{ padding: 16, paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(true); }}
            tintColor={colors.brandBlue}
          />
        }
      >
        {/* Son yazılar */}
        <View>
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
              {exercises.map((e) => {
                const bestAttempt = e.attempts.reduce(
                  (best, a) => a.mainScore > best.mainScore ? a : best,
                  e.attempts[0],
                );
                if (!bestAttempt) return null;
                return (
                  <Pressable
                    key={e.assignedTaskId}
                    onPress={() => nav.navigate('Results', { solvedTaskId: bestAttempt.solvedTaskId })}
                  >
                    <Card accent={getScoreColor(bestAttempt.mainScore)} padding={14}>
                      <View style={[styles.recentRow, { marginLeft: 6 }]}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.recentTitle}>{e.taskName}</Text>
                          <Text style={styles.recentWhen}>
                            RETURNED {new Date(e.lastSolvedDate).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric',
                            }).toUpperCase()}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.recentWhen}>SCORE</Text>
                            <Text style={styles.recentScore}>{bestAttempt.mainScore}</Text>
                          </View>
                          <IconChevRight size={14} color={colors.textTertiary}/>
                        </View>
                      </View>
                    </Card>
                  </Pressable>
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
    paddingHorizontal: 16, paddingVertical: 16,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
  },
  title: { fontFamily: fonts.sansSb, fontSize: 26, letterSpacing: -0.5, color: colors.textPrimary },

  recentRow:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recentTitle:    { fontFamily: fonts.sansSb, fontSize: 16, color: colors.textPrimary, letterSpacing: -0.2, lineHeight: 20 },
  recentWhen:     { fontFamily: fonts.mono, fontSize: 11, color: colors.textTertiary, marginTop: 3 },
  recentScore:    { fontFamily: fonts.sansEb, fontSize: 18, color: colors.textPrimary },

  errorBox:  { backgroundColor: colors.dangerSoft, borderRadius: radii.md, padding: 14 },
  errorText: { fontFamily: fonts.sans, fontSize: 14, color: colors.danger },
  empty:     { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontFamily: fonts.sans, fontSize: 16, color: colors.textTertiary },
});
