// 02 · Home — aktif görevler + son tamamlananlar
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenSurface, ScreenScroll } from '@/components/Screen';
import AssignmentCard from '@/components/AssignmentCard';
import CompletedTaskCard from '@/components/CompletedTaskCard';
import SectionHeader from '@/components/SectionHeader';
import AlertDialog from '@/components/AlertDialog';
import Avatar from '@/components/Avatar';
import { useAuth } from '@/context/AuthContext';
import { fetchAssignedTasks, fetchCompletedReports } from '@/api';
import { colors, fonts, radii, type } from '@/theme';
import type { HomeStackParamList } from '@/navigation/types';
import type { AssignedExercise, CompletedExercise } from '@/types/api';
import * as Biometric from '@/utils/biometric';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

export default function Home() {
  const nav    = useNavigation<Nav>();
  const { user } = useAuth();

  const [tasks,     setTasks]     = useState<AssignedExercise[]>([]);
  const [completed, setCompleted] = useState<CompletedExercise[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState<Biometric.BiometricType[]>([]);
  const lastLoadTime = useRef<number>(0);
  const CACHE_DURATION = 60 * 60 * 1000; // 1 saat

  const load = useCallback(async (isRefresh = false, force = false) => {
    if (!user) return;
    
    // Cache kontrolü - force veya refresh değilse ve cache geçerliyse yükleme
    const now = Date.now();
    if (!force && !isRefresh && lastLoadTime.current > 0 && (now - lastLoadTime.current) < CACHE_DURATION) {
      setLoading(false);
      return;
    }
    
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
      lastLoadTime.current = Date.now();
    } catch {
      setError('Could not load tasks. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, CACHE_DURATION]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    checkBiometricPrompt();
  }, []);

  const checkBiometricPrompt = async () => {
    const shouldShow = await Biometric.shouldShowBiometricPrompt();
    if (shouldShow) {
      const types = await Biometric.getSupportedBiometricTypes();
      setBiometricTypes(types);
      setShowBiometricPrompt(true);
    }
  };

  const handleEnableBiometric = async () => {
    await Biometric.setBiometricEnabled(true);
    await Biometric.setShouldShowBiometricPrompt(false);
    setShowBiometricPrompt(false);
  };

  const handleDismissBiometric = async () => {
    await Biometric.setShouldShowBiometricPrompt(false);
    setShowBiometricPrompt(false);
  };

  const getBiometricPromptTitle = () => {
    if (biometricTypes.includes('facial')) return 'Enable Face ID?';
    if (biometricTypes.includes('fingerprint')) return 'Enable Touch ID?';
    return 'Enable biometric authentication?';
  };

  const getBiometricPromptMessage = () => {
    const name = biometricTypes.includes('facial') ? 'Face ID' : 
                 biometricTypes.includes('fingerprint') ? 'Touch ID' : 
                 'biometric authentication';
    return `Sign in faster next time using ${name}. Your credentials will be stored securely on this device.`;
  };

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
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true, true); }} tintColor={colors.brandBlue}/>
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
            <SectionHeader 
              label="ACTIVE"
              onViewAll={() => (nav.getParent() as any)?.navigate('AssignmentsStack', { screen: 'AllTasks' })}
            />
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
            <SectionHeader 
              label="COMPLETED"
              onViewAll={() => (nav.getParent() as any)?.navigate('ReportStack', { screen: 'Progress' })}
            />
            <View style={{ gap: 8 }}>
              {completed.map(c => {
                const bestAttempt = c.attempts[0];
                return (
                  <CompletedTaskCard
                    key={c.assignedTaskId}
                    exercise={c}
                    onPress={() => bestAttempt && (nav.getParent() as any)?.navigate('ReportStack', {
                      screen: 'Results',
                      params: { solvedTaskId: bestAttempt.solvedTaskId },
                    })}
                  />
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

      <AlertDialog
        visible={showBiometricPrompt}
        title={getBiometricPromptTitle()}
        message={getBiometricPromptMessage()}
        buttons={[
          {
            text: 'Not now',
            style: 'cancel',
            onPress: handleDismissBiometric,
          },
          {
            text: 'Enable',
            onPress: handleEnableBiometric,
          },
        ]}
        onClose={handleDismissBiometric}
      />
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16, paddingVertical: 16,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  greeting: { fontFamily: fonts.sansSb, fontSize: 26, letterSpacing: -0.5, color: colors.textPrimary },

  errorBox:  { backgroundColor: colors.dangerSoft, borderRadius: radii.md, padding: 14, marginBottom: 16 },
  errorText: { fontFamily: fonts.sans, fontSize: 14, color: colors.danger },

  empty:     { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontFamily: fonts.sans, fontSize: 16, color: colors.textTertiary },
});
