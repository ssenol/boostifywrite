// 02 · Home — aktif görevler + son tamamlananlar
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenSurface, ScreenScroll } from '@/components/Screen';
import Card from '@/components/Card';
import AssignmentCard from '@/components/AssignmentCard';
import SectionHeader from '@/components/SectionHeader';
import Avatar from '@/components/Avatar';
import { useAuth } from '@/context/AuthContext';
import { fetchAssignedTasks, fetchCompletedReports } from '@/api';
import { colors, fonts, radii, type } from '@/theme';
import type { HomeStackParamList } from '@/navigation/types';
import type { AssignedExercise, CompletedExercise } from '@/types/api';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

export default function Home() {
  const nav    = useNavigation<Nav>();
  const { user } = useAuth();

  const [tasks,     setTasks]     = useState<AssignedExercise[]>([]);
  const [completed, setCompleted] = useState<CompletedExercise[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!user) return;
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const [tasksRes, reportsRes] = await Promise.all([
        fetchAssignedTasks({
          userId: user.userId,
          institutionId: user.schoolId,
          institutionSubSchoolId: user.campusId,
          perPageCount: 20,
        }),
        fetchCompletedReports({ userId: user.userId, perPageCount: 20 }),
      ]);
      setTasks(tasksRes.data.exercises.slice(0, 5));
      setCompleted(reportsRes.data.exercises.slice(0, 5));
    } catch {
      setError('Could not load tasks. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const initials = user ? `${user.name[0]}${user.lastName[0]}`.toUpperCase() : '?';
  const firstName = user?.name ?? '';

  // Son tamamlanan rapordaki CEFR seviyesini al
  const latestLevel = completed[0]?.attempts?.[0]
    ? null  // score'u kullanmak için report detail lazım — şimdilik gösterme
    : null;

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
        <View>
          <Text style={[type.label, { marginBottom: 4 }]}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}
          </Text>
          <Text style={styles.greeting}>Hi, {firstName}.</Text>
        </View>
        <Avatar initials={initials} onPress={() => (nav.getParent() as any)?.navigate('ProfileStack')}/>
      </View>

      <ScreenScroll
        contentStyle={{ padding: 16, paddingBottom: 110 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={colors.brandBlue}/>
        }
      >
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Aktif görevler */}
        {tasks.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <SectionHeader label={`ACTIVE · ${tasks.length}`}/>
            <View style={{ gap: 8 }}>
              {tasks.map(ex => (
                <AssignmentCard key={ex.id} exercise={ex} onPress={() => nav.navigate('AssignmentDetail', { exercise: ex })}/>
              ))}
            </View>
          </View>
        )}

        {/* Tamamlananlar */}
        {completed.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <SectionHeader label="COMPLETED"/>
            <View style={{ gap: 8 }}>
              {completed.map(c => {
                const latest = c.attempts[0];
                return (
                  <Card key={c.assignedTaskId} padding={16}>
                    <View style={styles.completedRow}>
                      <View style={[styles.dot, { backgroundColor: colors.brandGreen }]}/>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.completedTitle}>{c.taskName}</Text>
                        <Text style={styles.completedWhen}>
                          {new Date(c.lastSolvedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                      </View>
                      {latest && (
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.completedScore}>{latest.mainScore}/100</Text>
                          <Text style={styles.completedAttempts}>Attempt {latest.attemptNumber}</Text>
                        </View>
                      )}
                    </View>
                  </Card>
                );
              })}
            </View>
          </View>
        )}

        {tasks.length === 0 && completed.length === 0 && !error && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No assignments yet.</Text>
          </View>
        )}
      </ScreenScroll>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
  },
  greeting: { fontFamily: fonts.sansSb, fontSize: 26, letterSpacing: -0.5, color: colors.textPrimary },

  completedRow:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot:            { width: 8, height: 8, borderRadius: 99 },
  completedTitle: { fontFamily: fonts.sansSb, fontSize: 16, color: colors.textPrimary, letterSpacing: -0.2 },
  completedWhen:  { fontFamily: fonts.mono, fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  completedScore: { fontFamily: fonts.monoSb, fontSize: 14, color: colors.textPrimary },
  completedAttempts: { fontFamily: fonts.mono, fontSize: 11, color: colors.textTertiary },

  errorBox:  { backgroundColor: colors.dangerSoft, borderRadius: radii.md, padding: 14, marginBottom: 16 },
  errorText: { fontFamily: fonts.sans, fontSize: 14, color: colors.danger },

  empty:     { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontFamily: fonts.sans, fontSize: 16, color: colors.textTertiary },
});
