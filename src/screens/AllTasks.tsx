// Assignments tab — tüm görevler listesi + filter bottom sheet
import React, { useState, useMemo } from 'react';
import {
  View, Text, Pressable, ScrollView,
  Modal, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenSurface } from '@/components/Screen';
import Card from '@/components/Card';
import LevelBadge from '@/components/LevelBadge';
import ProgressBar from '@/components/ProgressBar';
import { IconCheck, IconFilter } from '@/components/Icons';
import { colors, fonts, radii, spacing, type } from '@/theme';
import type { AssignmentsStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<AssignmentsStackParamList, 'AllTasks'>;

type Task = {
  id: number; level: string; type: string; len: string; title: string;
  due: string; dueIn: number; status: string; sub: string; progress: number;
  accent: string;
};

const ALL_TASKS: Task[] = [
  { id: 1,  level: 'A2',  type: 'Essay',           len: '80–130w',  title: 'My Town & Neighbourhood',
    due: 'Due today',       dueIn: 0,   status: 'active',      sub: 'Not started', progress: 0,   accent: colors.rubricTask },
  { id: 2,  level: 'A2',  type: 'Informal letter', len: '60–100w',  title: 'A letter to my pen-friend about summer plans',
    due: 'Due Fri · 3d',    dueIn: 3,   status: 'in-progress', sub: 'In progress', progress: 38,  accent: colors.rubricCohesion },
  { id: 3,  level: 'B1',  type: 'Review',          len: '100–150w', title: 'Review of a film you liked recently',
    due: 'Due Mon · 6d',    dueIn: 6,   status: 'active',      sub: 'Not started', progress: 0,   accent: colors.rubricLexical },
  { id: 4,  level: 'B1',  type: 'Opinion essay',   len: '120–180w', title: 'Should social media be limited for teenagers?',
    due: 'Due Wed · 8d',    dueIn: 8,   status: 'in-progress', sub: 'Draft saved', progress: 22,  accent: colors.rubricGrammar },
  { id: 5,  level: 'A2',  type: 'Description',     len: '60–100w',  title: 'Describe your dream holiday',
    due: 'Due Fri · 10d',   dueIn: 10,  status: 'active',      sub: 'Not started', progress: 0,   accent: colors.rubricTask },
  { id: 6,  level: 'B1',  type: 'Essay',           len: '120–180w', title: 'The advantages of learning two languages',
    due: 'Due 22 May',      dueIn: 14,  status: 'active',      sub: 'Not started', progress: 0,   accent: colors.rubricCohesion },
  { id: 7,  level: 'A2',  type: 'Story',           len: '80–130w',  title: 'A funny thing happened to me',
    due: 'Overdue · 2d',    dueIn: -2,  status: 'overdue',     sub: 'Not started', progress: 0,   accent: colors.danger },
  { id: 8,  level: 'B1',  type: 'Essay',           len: '120–180w', title: 'A day in my life',
    due: 'Returned Apr 25', dueIn: -7,  status: 'completed',   sub: '5.8/9',       progress: 100, accent: colors.brandGreen },
  { id: 9,  level: 'A2+', type: 'Description',     len: '80–130w',  title: 'My favourite season',
    due: 'Returned Apr 12', dueIn: -18, status: 'completed',   sub: '5.2/9',       progress: 100, accent: colors.brandGreen },
  { id: 10, level: 'A2+', type: 'Letter',          len: '60–100w',  title: 'A letter to a friend',
    due: 'Returned Mar 30', dueIn: -29, status: 'completed',   sub: '5.1/9',       progress: 100, accent: colors.brandGreen },
];

type Filters = { status: string[]; level: string[]; type: string[] };

const DEFAULT_STATUS = ['active', 'in-progress', 'overdue'];

export default function AllTasks() {
  const nav = useNavigation<Nav>();
  const [filters, setFilters] = useState<Filters>({
    status: DEFAULT_STATUS, level: [], type: [],
  });
  const [showFilter, setShowFilter] = useState(false);

  const filtered = useMemo(() => ALL_TASKS.filter(t => {
    if (filters.status.length && !filters.status.includes(t.status)) return false;
    if (filters.level.length  && !filters.level.includes(t.level))   return false;
    if (filters.type.length   && !filters.type.includes(t.type))     return false;
    return true;
  }), [filters]);

  const filterCount =
    (filters.status.length !== DEFAULT_STATUS.length ? 1 : 0) +
    (filters.level.length  ? 1 : 0) +
    (filters.type.length   ? 1 : 0);

  return (
    <ScreenSurface>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={type.label}>ALL ASSIGNMENTS · {filtered.length}</Text>
          <Text style={styles.title}>Your tasks</Text>
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

      {/* Task list */}
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 110, gap: 8 }}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No tasks match these filters.</Text>
            <Text style={styles.emptyBody}>Try removing some filters.</Text>
          </View>
        ) : (
          filtered.map(t => (
            <TaskRow
              key={t.id}
              t={t}
              onPress={() => nav.navigate('AssignmentDetail', { id: t.id })}
            />
          ))
        )}
      </ScrollView>

      {/* Filter modal */}
      <FilterSheet
        visible={showFilter}
        filters={filters}
        onApply={(f) => { setFilters(f); setShowFilter(false); }}
        onClose={() => setShowFilter(false)}
      />
    </ScreenSurface>
  );
}

// ── Task row ────────────────────────────────────────────────
function TaskRow({ t, onPress }: { t: Task; onPress: () => void }) {
  const dueColor =
    t.status === 'overdue'   ? colors.danger :
    t.status === 'completed' ? colors.brandGreenDeep :
    t.due.startsWith('Due today') ? colors.brandBlue :
    colors.textSecondary;

  return (
    <Card accent={t.accent} padding={14} onPress={onPress}>
      <View style={{ marginLeft: 6 }}>
        <View style={styles.chipsRow}>
          <LevelBadge level={t.level} size="sm"/>
          <Text style={styles.chipType}>{t.type}</Text>
          <Text style={styles.chipDot}>·</Text>
          <Text style={styles.chipLen}>{t.len}</Text>
          <Text style={[styles.dueText, { color: dueColor, marginLeft: 'auto' }]}>{t.due}</Text>
        </View>
        <Text style={styles.taskTitle}>{t.title}</Text>
        <View style={styles.bottomRow}>
          <Text style={[
            styles.subText,
            { color: t.progress > 0 && t.progress < 100 ? t.accent : colors.textTertiary },
          ]}>{t.sub}</Text>
          {t.progress > 0 && t.progress < 100 && (
            <View style={{ flex: 1 }}>
              <ProgressBar value={t.progress} color={t.accent} height={3}/>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
}

// ── Filter bottom sheet ──────────────────────────────────────
function FilterSheet({
  visible, filters, onApply, onClose,
}: {
  visible: boolean;
  filters: Filters;
  onApply: (f: Filters) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState<Filters>(filters);

  // Sync local state when sheet opens
  React.useEffect(() => { if (visible) setLocal(filters); }, [visible]);

  const toggle = (key: keyof Filters, value: string) => {
    setLocal(f => {
      const cur = f[key] as string[];
      return { ...f, [key]: cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value] };
    });
  };

  const reset = () => setLocal({ status: ['active', 'in-progress', 'overdue', 'completed'], level: [], type: [] });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
          <View style={styles.handle}/>

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Filter tasks</Text>
            <Pressable onPress={reset} hitSlop={8}>
              <Text style={styles.resetBtn}>Reset</Text>
            </Pressable>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {/* Status */}
            <FilterGroup label="STATUS">
              {([
                ['active',      'Active'],
                ['in-progress', 'In progress'],
                ['overdue',     'Overdue'],
                ['completed',   'Completed'],
              ] as [string, string][]).map(([id, lbl]) => (
                <FilterOption key={id} label={lbl}
                  checked={local.status.includes(id)}
                  onPress={() => toggle('status', id)}/>
              ))}
            </FilterGroup>

            {/* CEFR Level */}
            <FilterGroup label="CEFR LEVEL">
              <View style={styles.levelPills}>
                {['A1','A2','A2+','B1','B1+','B2','C1'].map(l => {
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

            {/* Type */}
            <FilterGroup label="TYPE">
              {['Essay','Informal letter','Letter','Review','Opinion essay','Description','Story'].map(typ => (
                <FilterOption key={typ} label={typ}
                  checked={local.type.includes(typ)}
                  onPress={() => toggle('type', typ)}/>
              ))}
            </FilterGroup>
          </ScrollView>

          <View style={styles.sheetActions}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.applyBtn} onPress={() => onApply(local)}>
              <Text style={styles.applyBtnText}>Apply filters</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
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
    padding: 20, paddingTop: 18, paddingBottom: 16,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
  },
  title: { fontFamily: fonts.sansSb, fontSize: 26, letterSpacing: -0.3, marginTop: 4 },

  filterBtn: {
    height: 40, paddingHorizontal: 14,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: colors.border, borderRadius: radii.pill,
    backgroundColor: colors.bgCard,
  },
  filterBtnActive: { backgroundColor: colors.brandBlue, borderColor: colors.brandBlue },
  filterBtnLabel:  { fontFamily: fonts.sansSb, fontSize: 13, color: colors.textPrimary },
  filterBadge: {
    minWidth: 18, height: 18, paddingHorizontal: 5,
    backgroundColor: '#fff', borderRadius: radii.pill,
    alignItems: 'center', justifyContent: 'center',
  },
  filterBadgeText: { fontFamily: fonts.sansSb, fontSize: 11, color: colors.brandBlue },

  chipsRow: { flexDirection: 'row', alignItems: 'center', columnGap: 10, rowGap: 8, flexWrap: 'wrap' },
  chipType: { fontFamily: fonts.sans, fontSize: 14, color: colors.textSecondary },
  chipDot:  { color: colors.textTertiary },
  chipLen:  { fontFamily: fonts.mono, fontSize: 13, color: colors.textSecondary },
  dueText:  { fontFamily: fonts.monoSb, fontSize: 12, letterSpacing: 0.4 },

  taskTitle: {
    marginTop: 12, fontFamily: fonts.sansSb, fontSize: 17,
    letterSpacing: -0.3, lineHeight: 22, color: colors.textPrimary,
  },
  bottomRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 14 },
  subText:   { fontFamily: fonts.monoSb, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' },

  empty:      { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontFamily: fonts.sansSb, fontSize: 18, marginBottom: 8 },
  emptyBody:  { fontFamily: fonts.sans, fontSize: 14, color: colors.textTertiary },

  // Filter sheet
  overlay: {
    flex: 1, backgroundColor: 'rgba(14,17,22,0.4)', justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 18, borderTopRightRadius: 18,
    paddingHorizontal: 20, paddingBottom: 28,
    maxHeight: '85%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 99,
    backgroundColor: colors.borderStrong,
    alignSelf: 'center', marginVertical: 12,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  sheetTitle:  { fontFamily: fonts.sansSb, fontSize: 22, letterSpacing: -0.3, flex: 1 },
  resetBtn:    { fontFamily: fonts.sansSb, fontSize: 13, color: colors.textSecondary, padding: 6 },

  levelPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingVertical: 6 },
  levelPill: {
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  levelPillActive: { backgroundColor: colors.brandBlue, borderColor: colors.brandBlue },
  levelPillText:   { fontFamily: fonts.mono, fontSize: 13, fontWeight: '600', color: colors.textPrimary },

  filterOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.hairline,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 4,
    borderWidth: 1.5, borderColor: colors.borderStrong,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.brandBlue, borderColor: colors.brandBlue },
  filterOptionLabel: { fontFamily: fonts.sans, fontSize: 15, fontWeight: '500', flex: 1 },

  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelBtn: {
    flex: 1, height: 50, borderRadius: radii.pill,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  cancelBtnText: { fontFamily: fonts.sansSb, fontSize: 15, color: colors.textPrimary },
  applyBtn: {
    flex: 2, height: 50, borderRadius: radii.pill,
    backgroundColor: colors.bgInverse,
    alignItems: 'center', justifyContent: 'center',
  },
  applyBtnText: { fontFamily: fonts.sansSb, fontSize: 15, color: '#fff' },
});
