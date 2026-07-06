// Progress — gerçek tamamlanan raporlar + statik CEFR chart
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { ScreenSurface, ScreenScroll } from '@/components/Screen';
import CompletedTaskCard from '@/components/CompletedTaskCard';
import SectionHeader from '@/components/SectionHeader';
import SwipeableRow from '@/components/SwipeableRow';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import { useAuth } from '@/context/AuthContext';
import { fetchCompletedReports, deleteReport, fetchReportDetail } from '@/api';
import { colors, fonts, radii, spacing, type } from '@/theme';
import type { CompletedExercise } from '@/types/api';
import type { ReportStackParamList } from '@/navigation/types';

const POLL_INTERVAL = 20_000;

type Segment = 'completed' | 'analysis';

export default function Progress() {
  const { user } = useAuth();
  const nav   = useNavigation<NativeStackNavigationProp<ReportStackParamList>>();
  const route = useRoute<RouteProp<ReportStackParamList, 'Report'>>();

  const [segment, setSegment] = useState<Segment>('completed');
  const [exercises,  setExercises]  = useState<CompletedExercise[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const lastLoadTime = useRef<number>(0);
  const CACHE_DURATION = 60 * 60 * 1000;

  // Bekleyen değerlendirme
  const [pendingId,   setPendingId]   = useState<string | null>(null);
  const [pendingName, setPendingName] = useState<string>('');
  const [pendingDots, setPendingDots] = useState('');
  const pendingIdRef = useRef<string | null>(null);

  const load = useCallback(async (isRefresh = false, force = false) => {
    if (!user) return;
    
    // Cache kontrolü
    const now = Date.now();
    if (!force && !isRefresh && lastLoadTime.current > 0 && (now - lastLoadTime.current) < CACHE_DURATION) {
      setLoading(false);
      return;
    }
    
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const res = await fetchCompletedReports({ userId: user.userId, perPageCount: 20 });
      setExercises(res.data.exercises);
      lastLoadTime.current = Date.now();
    } catch {
      setError('Could not load reports.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, CACHE_DURATION]);

  // İlk yüklemede spinner göster
  useEffect(() => { load(); }, [load]);

  // Route params'tan pending task al (Evaluating'den yönlendirme)
  useEffect(() => {
    const params = route.params;
    if (!params?.pendingSolvedTaskId) return;
    setPendingId(params.pendingSolvedTaskId);
    setPendingName(params.pendingTaskName ?? '');
    pendingIdRef.current = params.pendingSolvedTaskId;
  }, [route.params]);

  // Pending varken 20sn'de bir sonuç kontrol et
  useEffect(() => {
    if (!pendingId) return;
    const poll = async () => {
      try {
        const res = await fetchReportDetail(pendingId);
        if (res.data.mainScore > 0) {
          setPendingId(null);
          pendingIdRef.current = null;
          load(true);
        }
      } catch {}
    };
    poll();
    const timer = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [pendingId]);

  // Pending varken nokta animasyonu
  useEffect(() => {
    if (!pendingId) return;
    const t = setInterval(() => setPendingDots(d => d.length >= 3 ? '' : d + '.'), 600);
    return () => clearInterval(t);
  }, [pendingId]);

  // Sonraki odaklanmalarda sessiz yenileme (ör. yeni rapor submit edildi, geri döndü)
  const hasMounted = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!hasMounted.current) { hasMounted.current = true; return; }
      load(true);
    }, [load])
  );

  const handleDelete = (exercise: CompletedExercise) => {
    const bestAttempt = exercise.attempts[0];
    if (!bestAttempt) return;

    Alert.alert(
      'Delete report',
      `"${exercise.taskName}" will be permanently deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            setExercises(prev => prev.filter(ex => ex.assignedTaskId !== exercise.assignedTaskId));
            try {
              await deleteReport(bestAttempt.solvedTaskId, user!.userId);
            } catch (err) {
              setExercises(prev => [...prev, exercise]);
              const msg = err instanceof Error ? err.message : 'Could not delete the report.';
              Alert.alert('Delete failed', msg);
            }
          },
        },
      ]
    );
  };

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

        <View style={styles.segmentRow}>
          {(['completed', 'analysis'] as Segment[]).map(s => {
            const isActive = s === segment;
            return (
              <Pressable
                key={s}
                onPress={() => setSegment(s)}
                style={[styles.segmentPill, isActive && styles.segmentPillActive]}
              >
                <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                  {s === 'completed' ? 'Completed' : 'Analysis'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {segment === 'analysis' ? (
        <ScreenScroll contentStyle={{ padding: 16, paddingBottom: 110 }}>
          <AnalyticsPanel userId={user!.userId}/>
        </ScreenScroll>
      ) : (
        <ScreenScroll
          contentStyle={{ padding: 16, paddingBottom: 110 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(true, true); }}
              tintColor={colors.brandBlue}
            />
          }
        >
          {/* Değerlendirme bekleyen */}
          {pendingId && (
            <View style={{ marginBottom: 16 }}>
              <SectionHeader label="EVALUATING"/>
              <View style={styles.pendingCard}>
                <View style={styles.pendingSpinner}>
                  <ActivityIndicator size="small" color={colors.brandBlue}/>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pendingStatus}>Analysing your essay{pendingDots}</Text>
                  <Text style={styles.pendingName} numberOfLines={2}>{pendingName}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Tamamlananlar */}
          <View>
            <SectionHeader label="COMPLETED"/>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : exercises.filter(e => e.attempts[0]?.solvedTaskId !== pendingId).length === 0 ? (
              !pendingId && (
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>No completed essays yet.</Text>
                </View>
              )
            ) : (
              <View style={{ gap: 8 }}>
                {exercises.filter(e => e.attempts[0]?.solvedTaskId !== pendingId).map((e) => {
                  const bestAttempt = e.attempts[0];
                  const card = (
                    <CompletedTaskCard
                      key={e.assignedTaskId}
                      exercise={e}
                      onPress={() => bestAttempt && nav.navigate('Results', { solvedTaskId: bestAttempt.solvedTaskId })}
                    />
                  );
                  if (!__DEV__) return card;
                  return (
                    <SwipeableRow key={e.assignedTaskId} onDelete={() => handleDelete(e)}>
                      {card}
                    </SwipeableRow>
                  );
                })}
              </View>
            )}
          </View>
        </ScreenScroll>
      )}
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

  segmentRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  segmentPill: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border,
  },
  segmentPillActive: { backgroundColor: colors.bgInverse, borderColor: colors.bgInverse },
  segmentText: { fontFamily: fonts.sansSb, fontSize: 13, color: colors.textPrimary },
  segmentTextActive: { color: '#fff' },

  errorBox:  { backgroundColor: colors.dangerSoft, borderRadius: radii.md, padding: 14 },
  errorText: { fontFamily: fonts.sans, fontSize: 14, color: colors.danger },
  empty:     { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontFamily: fonts.sans, fontSize: 16, color: colors.textTertiary },

  pendingCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.s3,
    backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.brandBlueSoft,
    borderRadius: radii.md,
    padding: spacing.s4,
  },
  pendingSpinner: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.brandBlueSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  pendingStatus: {
    fontFamily: fonts.mono, fontSize: 11, color: colors.brandBlue,
    marginBottom: 3, letterSpacing: 0.3,
  },
  pendingName: {
    fontFamily: fonts.sansSb, fontSize: 14, color: colors.textPrimary,
  },
});
