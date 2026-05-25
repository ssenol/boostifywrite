// 04 · Compose — writing surface with peek sheet
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenSurface } from '@/components/Screen';
import IconButton from '@/components/IconButton';
import ProgressBar from '@/components/ProgressBar';
import { IconChevLeft, IconCheck, IconArrow } from '@/components/Icons';
import { colors, fonts, radii, type } from '@/theme';
import type { HomeStackParamList } from '@/navigation/types';

const OUTLINE = [
  { id: 'intro', label: 'Introduction',           w: '25w' },
  { id: 'adv',   label: 'Body 1 — Advantages',    w: '30w', active: true },
  { id: 'dis',   label: 'Body 2 — Disadvantages', w: '25w' },
  { id: 'con',   label: 'Conclusion',             w: '20w' },
];

export default function Compose() {
  const nav = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const [tab, setTab] = useState<'Prompt' | 'Outline' | 'Vocab'>('Outline');
  const [expanded, setExpanded] = useState(true);
  const [done, setDone] = useState<string[]>(['intro']);
  const toggle = (id: string) =>
    setDone(d => d.includes(id) ? d.filter(x => x !== id) : [...d, id]);

  // Countdown timer — 44:12 → ...
  const [time, setTime] = useState(44 * 60 + 12);
  useEffect(() => {
    const t = setInterval(() => setTime(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(time / 60)).padStart(2, '0');
  const ss = String(time % 60).padStart(2, '0');

  return (
    <ScreenSurface>
      {/* Header */}
      <View style={styles.header}>
        <IconButton onPress={() => nav.goBack()}>
          <IconChevLeft size={18} color={colors.textPrimary}/>
        </IconButton>
        <View style={{ flex: 1 }}>
          <Text style={type.label}>ESSAY · A2</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>My Town & Neighbourhood</Text>
        </View>
        <View style={styles.timer}>
          <Text style={styles.timerText}>{mm}:{ss}</Text>
        </View>
      </View>

      {/* Body — editable essay text. Single TextInput keeps this minimal;
          in production you'd swap for a rich editor that supports inline
          marks (the wavy underline for "facilities", etc). */}
      <View style={{ flex: 1, paddingHorizontal: 22, paddingTop: 20 }}>
        <TextInput
          multiline
          style={styles.bodyText}
          textAlignVertical="top"
          defaultValue={
`My town is called Bursa. It is a big city in the north-west of Turkey.

There are many good things about living here. For example, we have a lot of historic places and facilities for young people. The food is also delicious and…`
          }
        />
      </View>

      {/* Peek sheet — collapsible */}
      <View style={[styles.peek, expanded ? styles.peekExpanded : styles.peekCollapsed]}>
        <Pressable onPress={() => setExpanded(e => !e)} style={styles.peekHandle}/>

        {/* Tabs */}
        <View style={styles.peekTabs}>
          {(['Prompt','Outline','Vocab'] as const).map(t => {
            const active = tab === t;
            const count = t === 'Outline' ? '1/4' : (t === 'Vocab' ? '10' : null);
            return (
              <Pressable key={t} onPress={() => { setTab(t); setExpanded(true); }} style={[
                styles.peekTab,
                active ? { backgroundColor: colors.bgInverse } : { backgroundColor: colors.bgCardTint, borderWidth: 1, borderColor: colors.border },
              ]}>
                <Text style={[styles.peekTabLabel, { color: active ? '#fff' : colors.textPrimary }]}>{t}</Text>
                {count ? <Text style={[styles.peekTabCount, { color: active ? 'rgba(255,255,255,0.7)' : colors.textTertiary }]}>{count}</Text> : null}
              </Pressable>
            );
          })}
        </View>

        {/* Tab body */}
        {expanded && (
          <View style={{ marginTop: 14 }}>
            {tab === 'Outline' && (
              <View style={{ gap: 6 }}>
                {OUTLINE.map(r => {
                  const isDone = done.includes(r.id);
                  return (
                    <Pressable key={r.id} onPress={() => toggle(r.id)} style={[
                      styles.outlineRow,
                      r.active && { borderColor: colors.brandBlue, backgroundColor: colors.brandBlueSoft },
                    ]}>
                      <View style={[styles.checkbox, isDone && { backgroundColor: colors.brandGreen, borderWidth: 0 }]}>
                        {isDone && <IconCheck size={12} color="#fff"/>}
                      </View>
                      <Text style={[
                        styles.outlineLabel,
                        isDone && { color: colors.textSecondary, textDecorationLine: 'line-through' },
                      ]}>{r.label}</Text>
                      <Text style={styles.outlineW}>{r.w}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
            {tab === 'Prompt' && (
              <Text style={styles.promptText}>
                Write an essay about the <Text style={styles.bold}>advantages and disadvantages</Text> of living in
                your town or neighbourhood. End with your own opinion.
              </Text>
            )}
            {tab === 'Vocab' && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {['urban','rural','crowded','peaceful','commute','facilities','historic','traffic jam','noise pollution','green space'].map(v => (
                  <View key={v} style={styles.vocabChip}>
                    <Text style={styles.vocabText}>{v}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>

      {/* Bottom: word count + submit */}
      <View style={styles.bottomBar}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={styles.wordCount}>47</Text>
            <Text style={styles.wordTarget}>/ 80–130w</Text>
          </View>
          <View style={{ marginTop: 4 }}>
            <ProgressBar value={(47 / 130) * 100} color={colors.brandBlue} height={2}/>
          </View>
        </View>
        <Pressable
          onPress={() => nav.navigate('Evaluating', { id: 1 })}
          style={styles.submit}
        >
          <Text style={styles.submitText}>Submit</Text>
          <IconArrow size={16} color="#fff"/>
        </Pressable>
      </View>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16, paddingVertical: 14,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  headerTitle: { fontFamily: fonts.sansSb, fontSize: 14, color: colors.textPrimary, lineHeight: 18 },
  timer: {
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: radii.sm, backgroundColor: colors.brandBlueSoft,
  },
  timerText: { fontFamily: fonts.monoSb, fontSize: 14, color: colors.brandBlue, letterSpacing: 0.4 },

  bodyText: {
    flex: 1,
    fontFamily: fonts.sans, fontSize: 17, lineHeight: 29, color: colors.textPrimary,
  },

  peek: {
    position: 'absolute', left: 0, right: 0, bottom: 70,
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 16, paddingBottom: 14, paddingTop: 8,
    shadowColor: '#0E1116', shadowOpacity: 0.08, shadowRadius: 28, shadowOffset: { width: 0, height: -8 }, elevation: 8,
  },
  peekExpanded:  { maxHeight: 320 },
  peekCollapsed: { maxHeight: 60, overflow: 'hidden' },
  peekHandle: {
    alignSelf: 'center', width: 40, height: 4, borderRadius: 99,
    backgroundColor: colors.borderStrong, marginBottom: 12, marginTop: 4,
  },
  peekTabs: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  peekTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9999, flexDirection: 'row', alignItems: 'center', gap: 6 },
  peekTabLabel: { fontFamily: fonts.sansSb, fontSize: 13.5 },
  peekTabCount: { fontFamily: fonts.mono, fontSize: 11 },

  outlineRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5, borderColor: colors.borderStrong,
    alignItems: 'center', justifyContent: 'center',
  },
  outlineLabel: { flex: 1, fontFamily: fonts.sansSb, fontSize: 15, color: colors.textPrimary },
  outlineW: { fontFamily: fonts.mono, fontSize: 12, color: colors.textTertiary },

  promptText: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  bold: { fontFamily: fonts.sansEb },

  vocabChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, backgroundColor: colors.bgCardTint, borderWidth: 1, borderColor: colors.border },
  vocabText: { fontFamily: fonts.sans, fontSize: 13, color: colors.textPrimary },

  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 16, paddingBottom: 20, paddingTop: 12,
    backgroundColor: colors.bgApp,
    borderTopWidth: 1, borderTopColor: colors.hairline,
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  wordCount:  { fontFamily: fonts.sansEb, fontSize: 16, color: colors.brandBlue },
  wordTarget: { fontFamily: fonts.mono, fontSize: 13, color: colors.textTertiary },
  submit: {
    height: 48, paddingHorizontal: 22, borderRadius: radii.pill,
    backgroundColor: colors.bgInverse,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  submitText: { fontFamily: fonts.sansSb, fontSize: 15, color: '#fff' },
});
