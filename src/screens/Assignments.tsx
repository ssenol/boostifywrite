// 02 · Home — aktif görevler + son tamamlananlar
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenSurface, ScreenScroll } from '@/components/Screen';
import Card from '@/components/Card';
import LevelBadge from '@/components/LevelBadge';
import ProgressBar from '@/components/ProgressBar';
import SectionHeader from '@/components/SectionHeader';
import Avatar from '@/components/Avatar';
import { useAuth } from '@/context/AuthContext';
import { fetchAssignedTasks, fetchCompletedReports } from '@/api';
import { colors, fonts, radii, type } from '@/theme';
import type { HomeStackParamList } from '@/navigation/types';
import type { AssignedExercise, CompletedExercise } from '@/types/api';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

function formatDue(dueDate: string): { label: string; isToday: boolean; isOverdue: boolean } {
  const due = new Date(dueDate);
  const now = new Date();
  const diffMs  = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0)  return { label: `Overdue · ${Math.abs(diffDays)}d`, isToday: false, isOverdue: true };
  if (diffDays === 0) return { label: 'Due today', isToday: true, isOverdue: false };
  if (diffDays === 1) return { label: 'Due tomorrow', isToday: false, isOverdue: false };
  return { label: `Due in ${diffDays}d`, isToday: false, isOverdue: false };
}

export default function Assignments() {
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
          perPageCount: 10,
        }),
        fetchCompletedReports({ userId: user.userId, perPageCount: 3 }),
      ]);
      setTasks(tasksRes.data.exercises.slice(0, 5));
      setCompleted(reportsRes.data.exercises.slice(0, 2));
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
        <Avatar initials={initials}/>
      </View>

      <ScreenScroll
        contentStyle={{ padding: 20, paddingBottom: 110 }}
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
            <View style={{ gap: 10 }}>
              {tasks.map(ex => (
                <AssignmentCard
                  key={ex.id}
                  exercise={ex}
                  onPress={() => nav.navigate('AssignmentDetail', { exercise: ex })}
                />
              ))}
            </View>
          </View>
        )}

        {/* Tamamlananlar */}
        {completed.length > 0 && (
          <View style={{ marginTop: 22 }}>
            <SectionHeader label="COMPLETED"/>
            <View style={{ gap: 8 }}>
              {completed.map(c => {
                const latest = c.attempts[0];
                return (
                  <Card key={c.assignedTaskId} padding={14}>
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

function AssignmentCard({ exercise: ex, onPress }: { exercise: AssignedExercise; onPress: () => void }) {
  const due = formatDue(ex.dueDate);
  const meta = ex.assignmentMetaData.details;
  const progress = 0; // Gerçek ilerleme ileriki sürümde eklenecek

  return (
    <Card accent={colors.rubricTask} padding={14} onPress={onPress}>
      <View style={{ marginLeft: 6 }}>
        <View style={styles.chipsRow}>
          <LevelBadge level={meta.cefrLevel} size="sm"/>
          <Text style={styles.chipType}>{meta.writingGenre ?? 'Writing'}</Text>
          {meta.minWordCount && meta.maxWordCount && (
            <>
              <Text style={styles.chipDot}>·</Text>
              <Text style={styles.chipLen}>{meta.minWordCount}–{meta.maxWordCount}w</Text>
            </>
          )}
          <View style={{ flex: 1 }}/>
          <View style={[
            styles.duePill,
            due.isToday && { backgroundColor: colors.brandBlueSoft, paddingHorizontal: 10, paddingVertical: 3 },
            due.isOverdue && { backgroundColor: colors.dangerSoft, paddingHorizontal: 10, paddingVertical: 3 },
          ]}>
            <Text style={[
              styles.dueText,
              { color: due.isToday ? colors.brandBlue : due.isOverdue ? colors.danger : colors.textPrimary },
            ]}>{due.label}</Text>
          </View>
        </View>

        <Text style={styles.title}>{ex.name}</Text>

        <View style={styles.bottomRow}>
          <Text style={[styles.subText, { color: colors.textTertiary }]}>
            {ex.remainingAttemptCount} attempt{ex.remainingAttemptCount !== 1 ? 's' : ''} left
          </Text>
        </View>
      </View>
    </Card>
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

  chipsRow: { flexDirection: 'row', alignItems: 'center', columnGap: 10, rowGap: 8, flexWrap: 'wrap' },
  chipType: { fontFamily: fonts.sans, fontSize: 14, color: colors.textSecondary },
  chipDot:  { color: colors.textTertiary },
  chipLen:  { fontFamily: fonts.mono, fontSize: 13, color: colors.textSecondary },
  duePill:  { borderRadius: 9999 },
  dueText:  { fontFamily: fonts.monoSb, fontSize: 12, letterSpacing: 0.4 },

  title: {
    marginTop: 12, fontFamily: fonts.sansSb, fontSize: 18,
    letterSpacing: -0.3, lineHeight: 23, color: colors.textPrimary,
  },
  bottomRow: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 14 },
  subText:   { fontFamily: fonts.monoSb, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' },

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
