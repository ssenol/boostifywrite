import React, { useState, useRef } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { SlideInRight, SlideInLeft, SlideOutRight, SlideOutLeft } from 'react-native-reanimated';

import { ScreenSurface } from '@/components/Screen';
import IconButton from '@/components/IconButton';
import { IconChevLeft } from '@/components/Icons';
import { ReportProvider, useReport } from '@/context/ReportContext';
import { colors, fonts, radii, type } from '@/theme';
import type { ResultsTab } from '@/navigation/types';

import { OverviewContent } from './ResultsOverview';
import { WritingList, WritingBottomSheet } from './ResultsWriting';
import type { WritingSharedState, BSTab } from './ResultsWriting';
import { FeedbackContent } from './ResultsFeedback';
import { ContentFulfillmentContent, OrganisationCohesionContent, VocabularyWordChoiceContent, GrammarLanguageContent } from './DimensionScreen';

const TABS: ResultsTab[] = [
  'Overview',
  'Your Writing',
  'Feedback',
  'Content & Fulfillment',
  'Organization & Cohesion',
  'Vocabulary & Word Choice',
  'Grammar & Language Use',
];

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
  const { loading, error, report } = useReport();

  const [tab, setTab]       = useState<ResultsTab>('Overview');
  const prevTabRef          = useRef<ResultsTab>('Overview');
  const directionRef        = useRef<1 | -1>(1);
  const pillsScrollRef      = useRef<ScrollView>(null);
  const pillLayouts         = useRef<{ x: number; width: number }[]>([]);
  const pillsContainerWidth = useRef<number>(0);

  // Writing sekmesi için paylaşılan state
  const [bsTab,     setBsTab]     = useState<BSTab>('Language Convention');
  const [lcFilter,  setLcFilter]  = useState('all');
  const [modalIdx,  setModalIdx]  = useState<number | null>(null);
  const writingState: WritingSharedState = {
    bsTab, setBsTab, lcFilter, setLcFilter, modalIdx, setModalIdx,
  };

  const changeTab = (newTab: ResultsTab) => {
    const oldIdx = TABS.indexOf(tab);
    const newIdx = TABS.indexOf(newTab);
    directionRef.current = newIdx >= oldIdx ? 1 : -1;
    prevTabRef.current = tab;
    setTab(newTab);
    const layout = pillLayouts.current[newIdx];
    if (layout && pillsContainerWidth.current > 0) {
      const center = layout.x + layout.width / 2 - pillsContainerWidth.current / 2;
      pillsScrollRef.current?.scrollTo({ x: Math.max(0, center), animated: true });
    }
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <IconButton onPress={() => nav.goBack()}>
            <IconChevLeft size={18} color={colors.textPrimary}/>
          </IconButton>
          <Text style={[styles.title, { flex: 1 }]} numberOfLines={1} ellipsizeMode="tail">
            {report?.taskName ?? 'Results'}
          </Text>
        </View>

        {/* ── Tab pills (sabit) ── */}
        <ScrollView
          ref={pillsScrollRef}
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
          style={{ marginHorizontal: -20, marginTop: 14 }}
          onLayout={e => { pillsContainerWidth.current = e.nativeEvent.layout.width; }}
        >
          {TABS.map((t, idx) => {
            const isActive = t === tab;
            return (
              <Pressable key={t} onPress={() => changeTab(t)}
                onLayout={e => {
                  pillLayouts.current[idx] = {
                    x: e.nativeEvent.layout.x,
                    width: e.nativeEvent.layout.width,
                  };
                }}
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
            contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {tab === 'Overview'                && <OverviewContent onTabChange={changeTab}/>}
            {tab === 'Your Writing'            && <WritingList {...writingState}/>}
            {tab === 'Feedback'                && <FeedbackContent/>}
            {tab === 'Content & Fulfillment'   && <ContentFulfillmentContent/>}
            {tab === 'Organization & Cohesion' && <OrganisationCohesionContent/>}
            {tab === 'Vocabulary & Word Choice' && <VocabularyWordChoiceContent/>}
            {tab === 'Grammar & Language Use'  && <GrammarLanguageContent/>}
          </ScrollView>
        </Animated.View>
      )}

      {/* ── Writing peek overlay (yalnızca Writing sekmesinde) ── */}
      {!loading && !error && tab === 'Your Writing' && (
        <View pointerEvents="box-none" style={styles.overlayWrap}>
          <WritingBottomSheet {...writingState}/>
        </View>
      )}
    </ScreenSurface>
  );
}


const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16, paddingTop: 14,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
  },
  title: { fontFamily: fonts.sansSb, fontSize: 20, color: colors.textPrimary, letterSpacing: -0.3 },

  pillsRow: { paddingHorizontal: 16, paddingBottom: 14, gap: 6 },
  pill: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: radii.pill, borderWidth: 1,
  },
  pillText: { fontFamily: fonts.sansSb, fontSize: 14 },

  overlayWrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
