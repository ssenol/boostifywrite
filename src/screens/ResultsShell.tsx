import React, { useState, useRef } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { SlideInRight, SlideInLeft, SlideOutRight, SlideOutLeft } from 'react-native-reanimated';

import { ScreenSurface } from '@/components/Screen';
import IconButton from '@/components/IconButton';
import { IconChevLeft, IconDownload } from '@/components/Icons';
import { ReportProvider, useReport } from '@/context/ReportContext';
import { colors, fonts, radii, type } from '@/theme';
import type { ResultsTab } from '@/navigation/types';

import { OverviewContent } from './ResultsOverview';
import { WritingList, WritingPeekSheet } from './ResultsWriting';
import type { WritingSharedState, FilterKind } from './ResultsWriting';
import { DimensionContent } from './DimensionScreen';

const TABS: ResultsTab[] = ['Overview', 'Writing', 'Task', 'Cohesion', 'Vocab', 'Grammar'];

type Props = { solvedTaskId: string };

export default function ResultsShell({ solvedTaskId }: Props) {
  return (
    <ReportProvider solvedTaskId={solvedTaskId}>
      <ShellInner/>
    </ReportProvider>
  );
}

function ShellInner() {
  const nav = useNavigation();
  const { loading, error } = useReport();

  const [tab, setTab]       = useState<ResultsTab>('Overview');
  const prevTabRef          = useRef<ResultsTab>('Overview');
  const directionRef        = useRef<1 | -1>(1); // 1 = ileri (sağdan), -1 = geri (soldan)

  // Writing sekmesi için paylaşılan state
  const [wFilter,   setWFilter]   = useState<FilterKind>('All');
  const [wPick,     setWPick]     = useState(0);
  const [wExpanded, setWExpanded] = useState(true);
  const writingState: WritingSharedState = {
    filter: wFilter, pick: wPick, expanded: wExpanded,
    setFilter: setWFilter, setPick: setWPick, setExpanded: setWExpanded,
  };

  const changeTab = (newTab: ResultsTab) => {
    const oldIdx = TABS.indexOf(tab);
    const newIdx = TABS.indexOf(newTab);
    directionRef.current = newIdx >= oldIdx ? 1 : -1;
    prevTabRef.current = tab;
    setTab(newTab);
  };

  const entering = directionRef.current >= 0
    ? SlideInRight.duration(220)
    : SlideInLeft.duration(220);
  const exiting  = directionRef.current >= 0
    ? SlideOutLeft.duration(180)
    : SlideOutRight.duration(180);

  return (
    <ScreenSurface>
      {/* ── Header (sabit, kaymaz) ── */}
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

        {/* ── Tab pills (sabit) ── */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
          style={{ marginHorizontal: -20, marginTop: 14 }}
        >
          {TABS.map(t => {
            const isActive = t === tab;
            return (
              <Pressable key={t} onPress={() => changeTab(t)}
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

      {/* ── İçerik alanı ── */}
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
        // key değişince Reanimated eski içeriği çıkarır, yenisini kaydırarak getirir
        <Animated.View key={tab} entering={entering} exiting={exiting} style={{ flex: 1, overflow: 'hidden' }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {tab === 'Overview' && <OverviewContent onTabChange={changeTab}/>}
            {tab === 'Writing'  && <WritingList {...writingState}/>}
            {tab === 'Task'     && <DimensionContent tab="Task"/>}
            {tab === 'Cohesion' && <DimensionContent tab="Cohesion"/>}
            {tab === 'Vocab'    && <DimensionContent tab="Vocab"/>}
            {tab === 'Grammar'  && <DimensionContent tab="Grammar"/>}
          </ScrollView>
        </Animated.View>
      )}

      {/* ── Writing peek overlay (yalnızca Writing sekmesinde) ── */}
      {!loading && !error && tab === 'Writing' && (
        <View pointerEvents="box-none" style={styles.overlayWrap}>
          <WritingPeekSheet {...writingState}/>
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
