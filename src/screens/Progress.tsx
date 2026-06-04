// Progress — gerçek tamamlanan raporlar + statik CEFR chart
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenSurface, ScreenScroll } from '@/components/Screen';
import CompletedTaskCard from '@/components/CompletedTaskCard';
import SectionHeader from '@/components/SectionHeader';
import { useAuth } from '@/context/AuthContext';
import { fetchCompletedReports } from '@/api';
import { colors, fonts, radii, type } from '@/theme';
import type { CompletedExercise } from '@/types/api';
import type { ReportStackParamList } from '@/navigation/types';

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
        {/* Tamamlananlar */}
        <View>
          <SectionHeader label="COMPLETED"/>
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
                const bestAttempt = e.attempts[0];
                return (
                  <CompletedTaskCard
                    key={e.assignedTaskId}
                    exercise={e}
                    onPress={() => bestAttempt && nav.navigate('Results', { solvedTaskId: bestAttempt.solvedTaskId })}
                  />
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

  errorBox:  { backgroundColor: colors.dangerSoft, borderRadius: radii.md, padding: 14 },
  errorText: { fontFamily: fonts.sans, fontSize: 14, color: colors.danger },
  empty:     { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontFamily: fonts.sans, fontSize: 16, color: colors.textTertiary },
});
