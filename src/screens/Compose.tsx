// 04 · Compose — yazma yüzeyi, gerçek API ile
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenSurface } from '@/components/Screen';
import IconButton from '@/components/IconButton';
import ProgressBar from '@/components/ProgressBar';
import { IconChevLeft, IconCheck, IconArrow } from '@/components/Icons';
import { fetchTaskContent, submitWriting } from '@/api';
import { colors, fonts, radii, type } from '@/theme';
import type { HomeStackParamList } from '@/navigation/types';
import type { ExerciseQuestion } from '@/types/api';

type Nav   = NativeStackNavigationProp<HomeStackParamList>;
type Route = RouteProp<HomeStackParamList, 'Compose'>;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function Compose() {
  const nav   = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { exercise: ex, exerciseToken } = route.params;
  const meta = ex.assignmentMetaData.details;

  const [tab,        setTab]        = useState<'Prompt' | 'Outline' | 'Vocab'>('Outline');
  const [expanded,   setExpanded]   = useState(true);
  const [text,       setText]       = useState('');
  const [done,       setDone]       = useState<string[]>([]);
  const [question,   setQuestion]   = useState<ExerciseQuestion | null>(null);
  const [loadingQ,   setLoadingQ]   = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const wordCount = countWords(text);
  const minWords  = meta.minWordCount ?? 0;
  const maxWords  = meta.maxWordCount ?? 0;
  const progress  = maxWords > 0
    ? Math.min((wordCount / maxWords) * 100, 100)
    : minWords > 0 ? Math.min((wordCount / minWords) * 100, 100) : 0;
  const withinRange = wordCount >= minWords && (maxWords === 0 || wordCount <= maxWords);

  // Zamanlayıcı
  const timeLimit = ex.assignmentTimeLimit > 0 ? ex.assignmentTimeLimit * 60 : 0;
  const [time, setTime] = useState(timeLimit);
  useEffect(() => {
    if (timeLimit === 0) return;
    const t = setInterval(() => setTime(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [timeLimit]);
  const mm = String(Math.floor(time / 60)).padStart(2, '0');
  const ss = String(time % 60).padStart(2, '0');

  // Görev içeriğini çek (prompt metni)
  useEffect(() => {
    fetchTaskContent(exerciseToken)
      .then(res => {
        const q = res.data.exercise.exercise.questions[0];
        if (q) setQuestion(q);
      })
      .catch(() => {/* prompt yüklenemedi, exercise.name ile devam */})
      .finally(() => setLoadingQ(false));
  }, [exerciseToken]);

  const toggle = (id: string) =>
    setDone(d => d.includes(id) ? d.filter(x => x !== id) : [...d, id]);

  const handleSubmit = async () => {
    if (wordCount < minWords) {
      Alert.alert(
        'Too short',
        `You need at least ${minWords} words. You have ${wordCount}.`,
      );
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitWriting(text, exerciseToken);
      nav.replace('Evaluating', {
        solvedTaskId: res.data.solvedTaskId,
        taskName: ex.name,
        wordCount,
      });
    } catch {
      Alert.alert('Submission failed', 'Please check your connection and try again.');
      setSubmitting(false);
    }
  };

  const outlines = meta.outlines ?? [];
  const keywords = meta.keywords
    ? meta.keywords.split(',').map(k => k.trim()).filter(Boolean)
    : [];

  return (
    <ScreenSurface>
      {/* Header */}
      <View style={styles.header}>
        <IconButton onPress={() => nav.goBack()}>
          <IconChevLeft size={18} color={colors.textPrimary}/>
        </IconButton>
        <View style={{ flex: 1 }}>
          <Text style={type.label}>
            {meta.writingGenre?.toUpperCase() ?? 'WRITING'} · {meta.cefrLevel}
          </Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{ex.name}</Text>
        </View>
        {timeLimit > 0 && (
          <View style={styles.timer}>
            <Text style={styles.timerText}>{mm}:{ss}</Text>
          </View>
        )}
      </View>

      {/* Yazı alanı */}
      <View style={{ flex: 1, paddingHorizontal: 22, paddingTop: 20 }}>
        <TextInput
          multiline
          style={styles.bodyText}
          textAlignVertical="top"
          placeholder="Start writing here…"
          placeholderTextColor={colors.textTertiary}
          value={text}
          onChangeText={setText}
          editable={!submitting}
        />
      </View>

      {/* Peek sheet */}
      <View style={[styles.peek, expanded ? styles.peekExpanded : styles.peekCollapsed]}>
        <Pressable onPress={() => setExpanded(e => !e)} style={styles.peekHandle}/>

        <View style={styles.peekTabs}>
          {(['Prompt', 'Outline', 'Vocab'] as const).map(t => {
            const active = tab === t;
            const count  =
              t === 'Outline' && outlines.length > 0 ? `${done.length}/${outlines.length}` :
              t === 'Vocab'   && keywords.length  > 0 ? String(keywords.length) :
              null;
            return (
              <Pressable key={t} onPress={() => { setTab(t); setExpanded(true); }} style={[
                styles.peekTab,
                active
                  ? { backgroundColor: colors.bgInverse }
                  : { backgroundColor: colors.bgCardTint, borderWidth: 1, borderColor: colors.border },
              ]}>
                <Text style={[styles.peekTabLabel, { color: active ? '#fff' : colors.textPrimary }]}>{t}</Text>
                {count ? (
                  <Text style={[styles.peekTabCount, { color: active ? 'rgba(255,255,255,0.7)' : colors.textTertiary }]}>
                    {count}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {expanded && (
          <View style={{ marginTop: 14 }}>
            {tab === 'Outline' && (
              <View style={{ gap: 6 }}>
                {outlines.length === 0 ? (
                  <Text style={styles.emptyHint}>No structure guide for this assignment.</Text>
                ) : outlines.map((o, i) => {
                  const isDone  = done.includes(o.id);
                  const isFirst = i === 0 && !isDone;
                  return (
                    <Pressable key={o.id} onPress={() => toggle(o.id)} style={[
                      styles.outlineRow,
                      isFirst && { borderColor: colors.brandBlue, backgroundColor: colors.brandBlueSoft },
                    ]}>
                      <View style={[styles.checkbox, isDone && { backgroundColor: colors.brandGreen, borderWidth: 0 }]}>
                        {isDone && <IconCheck size={12} color="#fff"/>}
                      </View>
                      <Text style={[
                        styles.outlineLabel,
                        isDone && { color: colors.textSecondary, textDecorationLine: 'line-through' },
                      ]}>{o.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
            {tab === 'Prompt' && (
              loadingQ
                ? <ActivityIndicator color={colors.brandBlue}/>
                : <Text style={styles.promptText}>
                    {question?.question.questionContent ?? ex.name}
                  </Text>
            )}
            {tab === 'Vocab' && (
              keywords.length === 0
                ? <Text style={styles.emptyHint}>No vocabulary hints for this assignment.</Text>
                : <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {keywords.map(k => (
                      <View key={k} style={styles.vocabChip}>
                        <Text style={styles.vocabText}>{k}</Text>
                      </View>
                    ))}
                  </View>
            )}
          </View>
        )}
      </View>

      {/* Alt çubuk: kelime sayısı + gönder */}
      <View style={styles.bottomBar}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={[
              styles.wordCount,
              { color: wordCount >= minWords ? colors.brandBlue : colors.textTertiary },
            ]}>
              {wordCount}
            </Text>
            <Text style={styles.wordTarget}>
              {maxWords > 0 ? `/ ${minWords}–${maxWords}w` : `/ ${minWords}+w`}
            </Text>
          </View>
          <View style={{ marginTop: 4 }}>
            <ProgressBar
              value={progress}
              color={withinRange ? colors.brandBlue : wordCount > maxWords && maxWords > 0 ? colors.warning : colors.textDisabled}
              height={2}
            />
          </View>
        </View>
        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          style={[styles.submit, submitting && { opacity: 0.65 }]}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small"/>
          ) : (
            <>
              <Text style={styles.submitText}>Submit</Text>
              <IconArrow size={16} color="#fff"/>
            </>
          )}
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
    shadowColor: '#0E1116', shadowOpacity: 0.08, shadowRadius: 28,
    shadowOffset: { width: 0, height: -8 }, elevation: 8,
  },
  peekExpanded:  { maxHeight: 320 },
  peekCollapsed: { maxHeight: 60, overflow: 'hidden' },
  peekHandle: {
    alignSelf: 'center', width: 40, height: 4, borderRadius: 99,
    backgroundColor: colors.borderStrong, marginBottom: 12, marginTop: 4,
  },
  peekTabs:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  peekTab:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.pill, flexDirection: 'row', alignItems: 'center', gap: 6 },
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

  promptText: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  emptyHint:  { fontFamily: fonts.sans, fontSize: 14, color: colors.textTertiary },

  vocabChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.pill,
    backgroundColor: colors.bgCardTint, borderWidth: 1, borderColor: colors.border,
  },
  vocabText: { fontFamily: fonts.sans, fontSize: 13, color: colors.textPrimary },

  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 16, paddingBottom: 20, paddingTop: 12,
    backgroundColor: colors.bgApp,
    borderTopWidth: 1, borderTopColor: colors.hairline,
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  wordCount:  { fontFamily: fonts.sansEb, fontSize: 16 },
  wordTarget: { fontFamily: fonts.mono, fontSize: 13, color: colors.textTertiary },
  submit: {
    height: 48, paddingHorizontal: 22, borderRadius: radii.pill,
    backgroundColor: colors.bgInverse,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    minWidth: 100,
  },
  submitText: { fontFamily: fonts.sansSb, fontSize: 15, color: '#fff' },
});
