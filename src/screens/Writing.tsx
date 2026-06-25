// 04 · Writing — yazma yüzeyi, gerçek API ile
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Keyboard, Animated, PanResponder, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';

import { ScreenSurface } from '@/components/Screen';
import IconButton from '@/components/IconButton';
import ProgressBar from '@/components/ProgressBar';
import BottomSheet from '@/components/BottomSheet';
import { IconChevLeft, IconCheck, IconArrow, IconChevDown, IconScanText } from '@/components/Icons';
import { fetchTaskContent, submitWriting, imageToText } from '@/api';
import HtmlText from '@/components/HtmlText';
import { colors, fonts, radii, type } from '@/theme';
import type { HomeStackParamList } from '@/navigation/types';
import type { ExerciseQuestion } from '@/types/api';

type Nav   = NativeStackNavigationProp<HomeStackParamList>;
type Route = RouteProp<HomeStackParamList, 'Writing'>;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function wordColor(count: number, min: number): string {
  if (min === 0) return colors.brandGreen;
  const pct = (count / min) * 100;
  if (pct <= 50) return colors.danger;
  if (pct <= 90) return colors.warning;
  return colors.brandGreen;
}

export default function Writing() {
  const nav    = useNavigation<Nav>();
  const route  = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { exercise: ex, exerciseToken } = route.params;
  const meta = ex.assignmentMetaData.details;

  const scrollRef   = useRef<ScrollView>(null);
  const inputRef    = useRef<TextInput>(null);
  const panY        = useRef(new Animated.Value(0)).current;
  const expandAnim  = useRef(new Animated.Value(1)).current; // 1=açık, 0=kapalı
  const expandedRef = useRef(true);

  const peekMaxHeight    = expandAnim.interpolate({ inputRange: [0, 1], outputRange: [76, 220] });
  const chevronRotation  = expandAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '0deg'] });

  function animateExpand(toExpanded: boolean) {
    expandedRef.current = toExpanded;
    setExpanded(toExpanded);
    Animated.spring(expandAnim, { toValue: toExpanded ? 1 : 0, useNativeDriver: false, bounciness: 4 }).start();
  }

  const [tab,            setTab]            = useState<'Prompt' | 'Outline' | 'Keywords'>('Outline');
  const [expanded,       setExpanded]       = useState(true);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, { dy, dx }) =>
        expandedRef.current && dy > 8 && dy > Math.abs(dx),
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) panY.setValue(dy);
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > 60 || vy > 0.5) {
          panY.setValue(0);
          Animated.spring(expandAnim, { toValue: 0, useNativeDriver: false, bounciness: 4 }).start();
          expandedRef.current = false;
          setExpanded(false);
        } else {
          Animated.spring(panY, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(panY, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  // Klavye açılınca peek kapat, kapanınca sıfırla
  useEffect(() => {
    const show = Keyboard.addListener('keyboardWillShow', e => {
      setKeyboardHeight(e.endCoordinates.height);
      animateExpand(false);
    });
    const hide = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardHeight(0);
    });
    return () => { show.remove(); hide.remove(); };
  }, []);

  // peek sheet güncel yüksekliği — animasyon outputRange ile eşleşmeli
  const peekHeight = expanded ? 220 : 76;
  // Klavye açıkken safe area gerek yok (klavye kaplar), kapalıyken home indicator için ekle
  const barPaddingBottom = keyboardHeight > 0 ? 12 : Math.max(20, insets.bottom + 10);
  const barHeight        = 12 + 48 + barPaddingBottom;
  // Tüm alt öğeler klavye yüksekliği kadar yukarı kayar
  const barBottom        = keyboardHeight;
  const [text,       setText]       = useState('');
  const [done,       setDone]       = useState<string[]>([]);
  const [question,   setQuestion]   = useState<ExerciseQuestion | null>(null);
  const [loadingQ,   setLoadingQ]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showOcrSheet,  setShowOcrSheet]  = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);

  const wordCount = countWords(text);
  const minWords  = meta.minWordCount ?? 0;
  const maxWords  = meta.maxWordCount ?? 0;
  const progress = minWords > 0 ? Math.min((wordCount / minWords) * 100, 100) : 0;
  const wColor = wordColor(wordCount, minWords);

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

  const handleTextChange = (newText: string) => {
    if (maxWords > 0 && countWords(newText) > maxWords) {
      // Orijinal metindeki whitespace/satır sonlarını koruyarak maxWords'üncü
      // kelimenin bittiği konumu bul, sonrasını kes
      let count = 0;
      let i = 0;
      while (i < newText.length) {
        while (i < newText.length && /\s/.test(newText[i])) i++;
        if (i >= newText.length) break;
        count++;
        while (i < newText.length && !/\s/.test(newText[i])) i++;
        if (count === maxWords) break;
      }
      setText(newText.slice(0, i));
      return;
    }
    setText(newText);
  };

  // Yazı varken geri dönmeye çalışınca onay iste
  useEffect(() => {
    const unsubscribe = nav.addListener('beforeRemove', (e) => {
      if (text.trim().length === 0 || submitting) return;
      e.preventDefault();
      Alert.alert(
        'Discard draft?',
        'You have unsaved text. Going back will discard your writing.',
        [
          { text: 'Keep writing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => nav.dispatch(e.data.action) },
        ]
      );
    });
    return unsubscribe;
  }, [nav, text, submitting]);

  const toggle = (id: string) =>
    setDone(d => d.includes(id) ? d.filter(x => x !== id) : [...d, id]);

  const pickAndOcr = async (source: 'camera' | 'library') => {
    setShowOcrSheet(false);
    await new Promise(resolve => setTimeout(resolve, 350));

    const perm = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!perm.granted) {
      Alert.alert(
        'Permission required',
        source === 'camera'
          ? 'Camera access is needed to take a photo.'
          : 'Photo library access is needed to choose a photo.',
      );
      return;
    }

    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 0.9 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 0.9 });

    if (result.canceled) return;

    setShowOcrSheet(true);
    setOcrProcessing(true);
    let failed = false;
    try {
      const ocrText = await imageToText(result.assets[0].uri);
      const combined = text + (text ? '\n' : '') + ocrText;
      handleTextChange(combined);
    } catch {
      failed = true;
    } finally {
      setOcrProcessing(false);
      setShowOcrSheet(false);
    }
    // Modal kapandıktan sonra alert göster — modal açıkken Alert çakışma yaratıyor
    if (failed) {
      setTimeout(() => Alert.alert('Could not read image', 'Please try again with a clearer photo.'), 350);
    }
  };

  const handleSubmit = async () => {
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

  const textLower = text.toLowerCase();
  const usedKeywords = new Set(keywords.filter(k => textLower.includes(k.toLowerCase())));

  return (
    <ScreenSurface edges={['top']}>
      {/* Header */}
      <Pressable style={styles.header} onPress={() => Keyboard.dismiss()}>
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
      </Pressable>

      {/* Yazı alanı — peek + bar kadar marginBottom, içerik büyüdükçe otomatik scroll */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1, marginBottom: barBottom + barHeight + peekHeight }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        <View>
          <TextInput
            ref={inputRef}
            multiline
            scrollEnabled={false}
            style={styles.bodyText}
            textAlignVertical="top"
            placeholder="Start writing here…"
            placeholderTextColor={colors.textTertiary}
            value={text}
            onChangeText={handleTextChange}
            editable={!submitting}
          />
          {keyboardHeight === 0 && !submitting && (
            <Pressable
              style={StyleSheet.absoluteFillObject}
              onPress={() => inputRef.current?.focus()}
            />
          )}
        </View>
      </ScrollView>

      {/* Peek sheet */}
      <Animated.View style={[styles.peek, { height: peekMaxHeight, bottom: barBottom + barHeight, transform: [{ translateY: panY }] }]}>
        {/* Sürükleme bölgesi: handle + sekme satırı — içerik scroll'uyla çakışmaz */}
        <View {...panResponder.panHandlers}>
          <Pressable onPress={() => { Keyboard.dismiss(); animateExpand(!expandedRef.current); }} style={styles.peekHandle}/>

          <View style={styles.peekTabs}>
            {(['Prompt', 'Outline', 'Keywords'] as const).map(t => {
              const active = tab === t;
              const count  =
                t === 'Outline' && outlines.length > 0 ? `${done.length}/${outlines.length}` :
                t === 'Keywords'   && keywords.length  > 0 ? String(keywords.length) :
                null;
              return (
                <Pressable key={t} onPress={() => { Keyboard.dismiss(); setTab(t); animateExpand(true); }} style={[
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
            <IconButton
              size={32}
              onPress={() => { Keyboard.dismiss(); animateExpand(!expandedRef.current); }}
              style={{ marginLeft: 'auto' }}
            >
              <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
                <IconChevDown size={14} color={colors.textSecondary}/>
              </Animated.View>
            </IconButton>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1, marginTop: 14 }}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 12 }}
        >
          {tab === 'Outline' && (
            outlines.length === 0 ? (
              <Text style={styles.emptyHint}>No structure guide for this assignment.</Text>
            ) : (
              outlines.map((o, i) => {
                const isDone = done.includes(o.id);
                const isLast = i === outlines.length - 1;
                return (
                  <Pressable key={o.id} onPress={() => toggle(o.id)} style={[
                    styles.outlineRow,
                    !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hairline },
                  ]}>
                    <View style={[styles.checkbox, isDone && { backgroundColor: colors.brandGreen, borderWidth: 0 }]}>
                      {isDone && <IconCheck size={12} color="#fff"/>}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[
                        styles.outlineLabel,
                        isDone && { textDecorationLine: 'line-through' },
                      ]}>{o.label}</Text>
                      {!!o.purpose && (
                        <Text style={[styles.outlinePurpose, isDone && { color: colors.textDisabled }]}>
                          {o.purpose}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                );
              })
            )
          )}
          {tab === 'Prompt' && (
            loadingQ
              ? <ActivityIndicator color={colors.brandBlue}/>
              : <HtmlText
                  html={question?.question.questionContent ?? ex.name}
                  style={styles.promptText}
                />
          )}
          {tab === 'Keywords' && (
            keywords.length === 0
              ? <Text style={styles.emptyHint}>No vocabulary hints for this assignment.</Text>
              : <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingBottom: 12 }}>
                  {keywords.map(k => {
                    const used = usedKeywords.has(k);
                    return (
                      <View key={k} style={[styles.vocabChip, used && styles.vocabChipUsed]}>
                        <Text style={[styles.vocabText, used && styles.vocabTextUsed]}>{k}</Text>
                      </View>
                    );
                  })}
                </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Alt çubuk: kelime sayısı + gönder */}
      <Pressable style={[styles.bottomBar, { bottom: barBottom, paddingBottom: barPaddingBottom }]} onPress={() => Keyboard.dismiss()}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={[
              styles.wordCount,
              { color: wColor },
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
              color={wordCount === 0 ? colors.textDisabled : wColor}
              height={2}
            />
          </View>
        </View>
        <IconButton
          size={44}
          onPress={() => setShowOcrSheet(true)}
          style={styles.ocrBtn}
        >
          <IconScanText size={20} color={colors.textSecondary}/>
        </IconButton>
        <Pressable
          onPress={handleSubmit}
          disabled={submitting || wordCount < minWords}
          style={[styles.submit, (submitting || wordCount < minWords) && { opacity: 0.35 }]}
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
      </Pressable>

      {/* OCR / El yazısı bottom sheet */}
      <BottomSheet
        visible={showOcrSheet}
        onClose={ocrProcessing ? () => {} : () => setShowOcrSheet(false)}
        maxHeight="45%"
      >
        {ocrProcessing ? (
          <View style={styles.ocrProcessing}>
            <ActivityIndicator size="large" color={colors.brandBlue}/>
            <Text style={styles.ocrProcessingTitle}>Reading your handwriting…</Text>
            <Text style={styles.ocrProcessingSpot}>This usually takes 2–6 seconds.</Text>
          </View>
        ) : (
          <>
            <View style={styles.ocrSheetHeader}>
              <Text style={styles.ocrSheetTitle}>Handwritten draft</Text>
              <Text style={styles.ocrSheetSpot}>
                Take a photo or upload an image of your handwritten text. It will be converted and added to your essay — you can review and edit before submitting.
              </Text>
            </View>
            <View style={styles.ocrSheetActions}>
              <Pressable style={[styles.ocrSheetRow, styles.ocrSheetDivider]} onPress={() => pickAndOcr('camera')}>
                <Text style={styles.ocrSheetRowText}>Take a photo</Text>
              </Pressable>
              <Pressable style={styles.ocrSheetRow} onPress={() => pickAndOcr('library')}>
                <Text style={styles.ocrSheetRowText}>Choose from library</Text>
              </Pressable>
            </View>
          </>
        )}
      </BottomSheet>
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
    fontFamily: fonts.sans, fontSize: 17, lineHeight: 29, color: colors.textPrimary,
    minHeight: 200,
  },

  peek: {
    position: 'absolute', left: 0, right: 0,
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 16, paddingBottom: 14, paddingTop: 8,
    shadowColor: '#0E1116', shadowOpacity: 0.08, shadowRadius: 28,
    shadowOffset: { width: 0, height: -8 }, elevation: 8,
  },
  peekHandle: {
    alignSelf: 'center', width: 40, height: 4, borderRadius: 99,
    backgroundColor: colors.borderStrong, marginBottom: 12, marginTop: 4,
  },
  peekTabs:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  peekTab:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.pill, flexDirection: 'row', alignItems: 'center', gap: 6 },
  peekTabLabel: { fontFamily: fonts.sansSb, fontSize: 13.5 },
  peekTabCount: { fontFamily: fonts.mono, fontSize: 11 },

  outlineRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    paddingVertical: 8, paddingHorizontal: 4,
    borderRadius: radii.sm,
  },
  checkbox: {
    width: 18, height: 18, borderRadius: 4,
    borderWidth: 1.5, borderColor: colors.borderStrong,
    alignItems: 'center', justifyContent: 'center',
  },
  outlineLabel:   { fontFamily: fonts.sansSb, fontSize: 13, color: colors.brandBlue },
  outlinePurpose: { fontFamily: fonts.sans, fontSize: 11, color: colors.textTertiary, marginTop: 2 },

  promptText: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, color: colors.brandBlue },
  emptyHint:  { fontFamily: fonts.sans, fontSize: 14, color: colors.textTertiary },

  vocabChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.pill,
    backgroundColor: colors.brandBlueSoft,
  },
  vocabChipUsed: { backgroundColor: colors.bgCardTint },
  vocabText: { fontFamily: fonts.sansSb, fontSize: 13, color: colors.brandBlue },
  vocabTextUsed: { color: colors.textDisabled, textDecorationLine: 'line-through' },

  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 16, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: colors.hairline,
    backgroundColor: colors.bgApp,
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

  ocrBtn: {
    borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },

  ocrProcessing: {
    paddingVertical: 32, alignItems: 'center', gap: 14,
  },
  ocrProcessingTitle: {
    fontFamily: fonts.sansSb, fontSize: 17, color: colors.textPrimary,
  },
  ocrProcessingSpot: {
    fontFamily: fonts.sans, fontSize: 13, color: colors.textSecondary,
  },

  ocrSheetHeader: {
    paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
  },
  ocrSheetTitle: {
    fontFamily: fonts.sansSb, fontSize: 18, color: colors.textPrimary, marginBottom: 4,
  },
  ocrSheetSpot: {
    fontFamily: fonts.sans, fontSize: 13, color: colors.textSecondary, lineHeight: 19,
  },
  ocrSheetActions: {
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radii.lg, overflow: 'hidden',
    marginTop: 16,
  },
  ocrSheetRow: {
    paddingVertical: 15, paddingHorizontal: 16,
    backgroundColor: colors.bgCard,
  },
  ocrSheetDivider: {
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
  },
  ocrSheetRowText: {
    fontFamily: fonts.sansSb, fontSize: 15, color: colors.textPrimary,
  },
});
