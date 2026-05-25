import React from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenSurface } from '@/components/Screen';
import IconButton from '@/components/IconButton';
import { IconChevLeft, IconDownload } from '@/components/Icons';
import { ReportProvider, useReport } from '@/context/ReportContext';
import { colors, fonts, radii, type } from '@/theme';
import type { HomeStackParamList } from '@/navigation/types';

export type ResultsTab = 'Overview' | 'Writing' | 'Task' | 'Cohesion' | 'Vocab' | 'Grammar';
const TABS: ResultsTab[] = ['Overview', 'Writing', 'Task', 'Cohesion', 'Vocab', 'Grammar'];

const ROUTE_MAP: Record<ResultsTab, keyof HomeStackParamList> = {
  Overview: 'ResultsOverview',
  Writing:  'ResultsWriting',
  Task:     'ResultsTask',
  Cohesion: 'ResultsCohesion',
  Vocab:    'ResultsLexical',
  Grammar:  'ResultsGrammar',
};

type ShellProps = {
  active: ResultsTab;
  children: React.ReactNode;
  bottomOverlay?: React.ReactNode;
  solvedTaskId?: string;
};

export default function ResultsShell(props: ShellProps) {
  return (
    <ReportProvider solvedTaskId={props.solvedTaskId ?? ''}>
      <ShellInner {...props}/>
    </ReportProvider>
  );
}

function ShellInner({ active, children, bottomOverlay, solvedTaskId = '' }: ShellProps) {
  const nav = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { loading, error } = useReport();

  return (
    <ScreenSurface>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          <IconButton onPress={() => nav.goBack()} style={{ marginTop: 4 }}>
            <IconChevLeft size={18} color={colors.textPrimary}/>
          </IconButton>
          <View style={{ flex: 1 }}>
            <View style={styles.statusRow}>
              <View style={styles.statusDot}/>
              <Text style={[type.labelSm, { color: colors.brandGreenDeep }]}>EVALUATED</Text>
            </View>
            <Text style={styles.title}>Results</Text>
          </View>
          <IconButton style={{ marginTop: 4 }}>
            <IconDownload size={18} color={colors.textPrimary}/>
          </IconButton>
        </View>

        {/* Tab pills */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
          style={{ marginHorizontal: -20, marginTop: 14 }}
        >
          {TABS.map(t => {
            const isActive = t === active;
            return (
              <Pressable key={t}
                onPress={() => (nav.navigate as any)(ROUTE_MAP[t], { solvedTaskId })}
                style={[
                  styles.pill,
                  isActive
                    ? { backgroundColor: colors.bgInverse, borderColor: colors.bgInverse }
                    : { backgroundColor: 'transparent', borderColor: colors.border },
                ]}
              >
                <Text style={[styles.pillText, { color: isActive ? '#fff' : colors.textPrimary }]}>{t}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Body */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.brandBlue}/>
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontFamily: fonts.sans, fontSize: 15, color: colors.textSecondary, textAlign: 'center' }}>
            Could not load results. Please check your connection.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      )}

      {bottomOverlay && (
        <View pointerEvents="box-none" style={styles.overlayWrap}>
          {bottomOverlay}
        </View>
      )}
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20, paddingTop: 14,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 99, backgroundColor: colors.brandGreen },
  title: { fontFamily: fonts.sansSb, fontSize: 20, color: colors.textPrimary, letterSpacing: -0.3 },

  pillsRow: { paddingHorizontal: 20, paddingBottom: 14, gap: 6 },
  pill: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: radii.pill, borderWidth: 1,
  },
  pillText: { fontFamily: fonts.sansSb, fontSize: 14 },

  overlayWrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
