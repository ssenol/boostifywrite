// Assignments tab — tüm aktif görevler + filter bottom sheet
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenSurface } from '@/components/Screen';
import AssignmentCard from '@/components/AssignmentCard';
import SectionHeader from '@/components/SectionHeader';
import BottomSheet from '@/components/BottomSheet';
import { IconCheck, IconFilter } from '@/components/Icons';
import { useGridColumnWidth } from '@/hooks/useIsTablet';
import { useAuth } from '@/context/AuthContext';
import { fetchAssignedTasks } from '@/api';
import { colors, fonts, radii, spacing, layout, type } from '@/theme';
import type { AssignmentsStackParamList } from '@/navigation/types';
import type { AssignedExercise } from '@/types/api';

type Nav = NativeStackNavigationProp<AssignmentsStackParamList, 'AllTasks'>;

type Filters = { level: string[]; genre: string[] };

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function AllTasks() {
  const nav    = useNavigation<Nav>();
  const { user } = useAuth();
  const gridColumnWidth = useGridColumnWidth();
  const isTablet = gridColumnWidth !== undefined;

  const [tasks,      setTasks]      = useState<AssignedExercise[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [filters,    setFilters]    = useState<Filters>({ level: [], genre: [] });
  const [showFilter, setShowFilter] = useState(false);
  const lastLoadTime = useRef<number>(0);
  const CACHE_DURATION = 60 * 60 * 1000; // 1 saat

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
      const res = await fetchAssignedTasks({
        userId: user.userId,
        institutionId: user.schoolId,
        institutionSubSchoolId: user.campusId,
        perPageCount: 50,
      });
      setTasks(res.data.exercises);
      lastLoadTime.current = Date.now();
    } catch {
      setError('Could not load tasks.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, CACHE_DURATION]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => tasks.filter(t => {
    const meta = t.assignmentMetaData.details;
    if (filters.level.length && !filters.level.includes(meta.cefrLevel)) return false;
    if (filters.genre.length && !filters.genre.includes(meta.writingGenre ?? '')) return false;
    return true;
  }), [tasks, filters]);

  const { overdue, active } = useMemo(() => {
    const now = Date.now();
    const overdueTasks = filtered.filter(t => new Date(t.dueDate).getTime() < now);
    const activeTasks = filtered.filter(t => new Date(t.dueDate).getTime() >= now);
    return { overdue: overdueTasks, active: activeTasks };
  }, [filtered]);

  const filterCount = (filters.level.length ? 1 : 0) + (filters.genre.length ? 1 : 0);

  // Level ve genre seçeneklerini görevlerden çıkar
  const availableLevels = [...new Set(tasks.map(t => t.assignmentMetaData.details.cefrLevel))].sort();
  const availableGenres = [...new Set(tasks.map(t => t.assignmentMetaData.details.writingGenre).filter(Boolean))] as string[];

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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={type.label}>ASSIGNMENTS</Text>
          <Text style={styles.title}>Your Tasks</Text>
        </View>
        <Pressable
          onPress={() => setShowFilter(true)}
          style={[styles.filterBtn, filterCount > 0 && styles.filterBtnActive]}
        >
          <IconFilter size={14} color={filterCount > 0 ? '#fff' : colors.textPrimary}/>
          <Text style={[styles.filterBtnLabel, filterCount > 0 && { color: '#fff' }]}>Filter</Text>
          {filterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{filterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true, true); }} tintColor={colors.brandBlue}/>
        }
      >
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No tasks match these filters.</Text>
            <Text style={styles.emptyBody}>Try removing some filters.</Text>
          </View>
        ) : (
          <>
            {overdue.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <SectionHeader label={`OVERDUE · ${overdue.length}`}/>
                <View style={[styles.list, isTablet && styles.listGrid]}>
                  {overdue.map(ex => (
                    <View key={ex.id} style={gridColumnWidth !== undefined && { width: gridColumnWidth }}>
                      <AssignmentCard exercise={ex} onPress={() => nav.navigate('AssignmentDetail', { exercise: ex })}/>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {active.length > 0 && (
              <View>
                <SectionHeader label={`ACTIVE · ${active.length}`}/>
                <View style={[styles.list, isTablet && styles.listGrid]}>
                  {active.map(ex => (
                    <View key={ex.id} style={gridColumnWidth !== undefined && { width: gridColumnWidth }}>
                      <AssignmentCard exercise={ex} onPress={() => nav.navigate('AssignmentDetail', { exercise: ex })}/>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <FilterSheet
        visible={showFilter}
        filters={filters}
        availableLevels={availableLevels}
        availableGenres={availableGenres}
        onApply={(f) => { setFilters(f); setShowFilter(false); }}
        onClose={() => setShowFilter(false)}
      />
    </ScreenSurface>
  );
}

// ── Filter bottom sheet ─────────────────────────────────────
function FilterSheet({
  visible, filters, availableLevels, availableGenres, onApply, onClose,
}: {
  visible: boolean; filters: Filters;
  availableLevels: string[]; availableGenres: string[];
  onApply: (f: Filters) => void; onClose: () => void;
}) {
  const [local, setLocal] = useState<Filters>(filters);
  useEffect(() => { if (visible) setLocal(filters); }, [visible]);

  const toggle = (key: keyof Filters, value: string) => {
    setLocal(f => {
      const cur = f[key];
      return { ...f, [key]: cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value] };
    });
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.sheetContent}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Filter Tasks</Text>
          <Pressable onPress={() => setLocal({ level: [], genre: [] })} hitSlop={8}>
            <Text style={styles.resetBtn}>Reset</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
          {availableLevels.length > 0 && (
            <FilterGroup label="CEFR LEVEL">
              <View style={styles.levelPills}>
                {availableLevels.map(l => {
                  const active = local.level.includes(l);
                  return (
                    <Pressable key={l} onPress={() => toggle('level', l)}
                      style={[styles.levelPill, active && styles.levelPillActive]}>
                      <Text style={[styles.levelPillText, active && { color: '#fff' }]}>{l}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </FilterGroup>
          )}
          {availableGenres.length > 0 && (
            <FilterGroup label="TYPE">
              {availableGenres.map(g => (
                <FilterOption key={g} label={capitalize(g)}
                  checked={local.genre.includes(g)}
                  onPress={() => toggle('genre', g)}/>
              ))}
            </FilterGroup>
          )}
        </ScrollView>

        <View style={styles.sheetActions}>
          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.applyBtn} onPress={() => onApply(local)}>
            <Text style={styles.applyBtnText}>Apply Filters</Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={[type.label, { marginBottom: 8 }]}>{label}</Text>
      {children}
    </View>
  );
}

function FilterOption({ label, checked, onPress }: { label: string; checked: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.filterOption}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <IconCheck size={13} color="#fff"/>}
      </View>
      <Text style={styles.filterOptionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16, paddingVertical: 16,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  title: { fontFamily: fonts.sansSb, fontSize: 26, letterSpacing: -0.3, marginTop: 4 },

  list:     { gap: spacing.s2 },
  listGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.s4 },

  filterBtn: {
    height: 40, paddingHorizontal: 14,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: colors.border, borderRadius: radii.pill,
    backgroundColor: colors.bgCard,
  },
  filterBtnActive:   { backgroundColor: colors.brandBlue, borderColor: colors.brandBlue },
  filterBtnLabel:    { fontFamily: fonts.sansSb, fontSize: 13, color: colors.textPrimary },
  filterBadge:       { minWidth: 18, height: 18, paddingHorizontal: 5, backgroundColor: '#fff', borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  filterBadgeText:   { fontFamily: fonts.sansSb, fontSize: 11, color: colors.brandBlue },

  errorBox:  { backgroundColor: colors.dangerSoft, borderRadius: radii.md, padding: 14 },
  errorText: { fontFamily: fonts.sans, fontSize: 14, color: colors.danger },
  empty:     { alignItems: 'center', paddingVertical: 60 },
  emptyTitle:{ fontFamily: fonts.sansSb, fontSize: 18, marginBottom: 8 },
  emptyBody: { fontFamily: fonts.sans, fontSize: 14, color: colors.textTertiary },

  sheetContent: { width: '100%', maxWidth: layout.maxActionWidth, alignSelf: 'center' },

  sheetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, marginTop: 8 },
  sheetTitle:  { fontFamily: fonts.sansSb, fontSize: 22, letterSpacing: -0.3, flex: 1 },
  resetBtn:    { fontFamily: fonts.sansSb, fontSize: 13, color: colors.textSecondary, padding: 6 },

  levelPills:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingVertical: 6 },
  levelPill:     { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard },
  levelPillActive: { backgroundColor: colors.brandBlue, borderColor: colors.brandBlue },
  levelPillText: { fontFamily: fonts.mono, fontSize: 13, fontWeight: '600', color: colors.textPrimary },

  filterOption:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.hairline },
  checkbox:          { width: 22, height: 22, borderRadius: 4, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked:   { backgroundColor: colors.brandBlue, borderColor: colors.brandBlue },
  filterOptionLabel: { fontFamily: fonts.sans, fontSize: 15, fontWeight: '500', flex: 1 },

  sheetActions:  { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelBtn:     { flex: 1, height: 50, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontFamily: fonts.sansSb, fontSize: 15, color: colors.textPrimary },
  applyBtn:      { flex: 2, height: 50, borderRadius: radii.pill, backgroundColor: colors.bgInverse, alignItems: 'center', justifyContent: 'center' },
  applyBtnText:  { fontFamily: fonts.sansSb, fontSize: 15, color: '#fff' },
});
