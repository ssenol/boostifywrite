import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  Dimensions, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Card from '@/components/Card';
import HtmlText from '@/components/HtmlText';
import { IconChevLeft, IconChevRight, IconChevDown, IconClose, IconCheckFilled, IconAlertFilled, IconInfo } from '@/components/Icons';
import {
  useReport, getQuestionText, getUserResponseText, getMechanicsIssues, getOutlineCompliance,
} from '@/context/ReportContext';
import type { OutlineSection } from '@/context/ReportContext';
import { colors, fonts, radii, shadow, type } from '@/theme';
import type { InlineCorrection } from '@/types/api';

const { height: SCREEN_H } = Dimensions.get('window');

// ── Kategori tanımları ───────────────────────────────────────────────────────
export type BSTab = 'Language Convention' | 'Outline' | 'Logic';

type CatDef = { id: string; key: string; label: string; bg: string; color: string; border: string };

const CATEGORY_DEFS: CatDef[] = [
  { id: 'all',            key: 'all',                    label: 'All',                    bg: '#E7E9FF', color: '#929DFF', border: '#ABB3FF' },
  { id: 'grammar',        key: 'grammar-error',          label: 'Grammar',                bg: '#F0F0F0', color: '#6c6c6c', border: '#808080' },
  { id: 'spelling',       key: 'spelling-error',         label: 'Spelling',               bg: '#FFF8C4', color: '#BAAD23', border: '#DACD38' },
  { id: 'punctuation',    key: 'punctuation-error',      label: 'Punctuation',            bg: '#DCFFD6', color: '#65C653', border: '#84E473' },
  { id: 'capitalization', key: 'capitalization-error',   label: 'Capitalization',         bg: '#FEEDFF', color: '#BE59C2', border: '#FDBCFF' },
  { id: 'wordchoice',     key: 'word-choice-error',      label: 'Word Choice',            bg: '#FFF2DE', color: '#CF9842', border: '#EAC790' },
  { id: 'wordform',       key: 'word-form-error',        label: 'Word Form',              bg: '#EFFFF3', color: '#40C862', border: '#8AF2A5' },
  { id: 'redundancy',     key: 'redundancy-error',       label: 'Redundancy',             bg: '#FFFAEB', color: '#B89A30', border: '#E6D78C' },
  { id: 'inappropriate',  key: 'inappropriate-language', label: 'Inappropriate Language', bg: '#FFE5D9', color: '#D2691E', border: '#FFCBA4' },
  { id: 'mixing',         key: 'language-mixing-error',  label: 'Language Mixing',        bg: '#E7D9FF', color: '#A785E1', border: '#C3ABEC' },
];

const LOGIC_DEF: CatDef = { id: 'logic', key: 'logic-error', label: 'Logic', bg: '#FFE3E3', color: '#C04A4A', border: '#F2A8A8' };

function catForType(t: string): CatDef {
  if (t === 'logic-error') return LOGIC_DEF;
  return CATEGORY_DEFS.find(c => c.key === t) ?? CATEGORY_DEFS[0];
}

function formatSubType(s: string): string {
  return s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ── Metin annotasyon ─────────────────────────────────────────────────────────
type Span = { text: string; issue: InlineCorrection | null };

function buildSpans(text: string, issues: InlineCorrection[]): Span[] {
  const marks: { start: number; end: number; issue: InlineCorrection }[] = [];

  for (const issue of issues) {
    if (issue.type === 'logic-error') {
      // Cümle seviyesi: önce wrongContent'i dene, yoksa wrongWord'e düş
      const sentence = issue.wrongContent;
      if (sentence) {
        const idx = text.indexOf(sentence);
        if (idx >= 0) { marks.push({ start: idx, end: idx + sentence.length, issue }); continue; }
      }
      const ww = issue.wrongWord;
      if (!ww) continue;
      const wi = text.indexOf(ww);
      if (wi >= 0) marks.push({ start: wi, end: wi + ww.length, issue });
    } else {
      const ww = issue.wrongWord;
      if (!ww) continue;
      const ctxLen = Math.min(30, issue.wrongContent.length);
      const ctxStart = text.indexOf(issue.wrongContent.substring(0, ctxLen));
      if (ctxStart < 0) continue;
      const wIdx = text.indexOf(ww, ctxStart);
      if (wIdx < 0 || wIdx > ctxStart + issue.wrongContent.length + 20) continue;
      marks.push({ start: wIdx, end: wIdx + ww.length, issue });
    }
  }

  marks.sort((a, b) => a.start - b.start);

  const spans: Span[] = [];
  let pos = 0, lastEnd = 0;
  for (const m of marks) {
    if (m.start < lastEnd) continue;
    if (m.start > pos) spans.push({ text: text.slice(pos, m.start), issue: null });
    spans.push({ text: text.slice(m.start, m.end), issue: m.issue });
    pos = m.end;
    lastEnd = m.end;
  }
  if (pos < text.length) spans.push({ text: text.slice(pos), issue: null });
  return spans;
}

// ── Shared state tipi ────────────────────────────────────────────────────────
export type WritingSharedState = {
  bsTab:        BSTab;
  lcFilter:     string;
  modalIdx:     number | null;
  setBsTab:     React.Dispatch<React.SetStateAction<BSTab>>;
  setLcFilter:  React.Dispatch<React.SetStateAction<string>>;
  setModalIdx:  React.Dispatch<React.SetStateAction<number | null>>;
};

// ── AnnotatedText ────────────────────────────────────────────────────────────
function AnnotatedText({ text, issues, onPress }: {
  text: string;
  issues: InlineCorrection[];
  onPress: (i: InlineCorrection) => void;
}) {
  const spans = useMemo(() => buildSpans(text, issues), [text, issues]);
  let logicCount = 0;
  return (
    <Text style={styles.responseText}>
      {spans.map((span, i) => {
        if (!span.issue) return <Text key={i}>{span.text}</Text>;
        const cat = catForType(span.issue.type);
        const isLogic = span.issue.type === 'logic-error';
        if (isLogic) logicCount += 1;
        const num = logicCount;
        return (
          <Text
            key={i}
            suppressHighlighting
            onPress={() => onPress(span.issue!)}
            style={{
              backgroundColor: cat.bg,
              color: isLogic ? colors.textPrimary : cat.color,
              fontFamily: isLogic ? fonts.sans : fonts.monoSb,
              paddingHorizontal: 3,
            }}
          >
            {isLogic && (
              <Text style={{ fontFamily: fonts.monoSb, fontSize: 11, color: '#fff', backgroundColor: '#c00' }}>
                {` ${num} `}
              </Text>
            )}
            {isLogic ? ` ${span.text}` : span.text}
          </Text>
        );
      })}
    </Text>
  );
}

// ── ErrorModal ───────────────────────────────────────────────────────────────
function ErrorModal({ issue, index, total, onPrev, onNext, onClose }: {
  issue: InlineCorrection;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const cat = catForType(issue.type);
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        {/* Backdrop tap → close */}
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />

        <View style={styles.modalCard}>
          {/* Üst satır: tür başlığı + X */}
          <View style={styles.modalTopRow}>
            <Text style={[styles.errorCatLabel, { color: cat.color }]}>{cat.label} Error</Text>
            <Pressable onPress={onClose} hitSlop={12} style={styles.modalCloseBtn}>
              <IconClose size={14} color={colors.textTertiary} />
            </Pressable>
          </View>

          {/* subType badge */}
          {!!issue.subType && (
            <View style={[styles.subTypePill, { backgroundColor: cat.bg, borderColor: cat.border, alignSelf: 'flex-start', marginTop: 6 }]}>
              <Text style={[styles.subTypeText, { color: cat.color }]}>
                {formatSubType(issue.subType)}
              </Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginTop: 14 }}>
            {/* wrong → correct (mono font) */}
            <View style={styles.errorWords}>
              <Text style={[styles.wrongWord, { color: cat.color }]}>{issue.wrongWord || '—'}</Text>
              {!!issue.correctWord && (
                <>
                  <Text style={styles.wordArrow}>→</Text>
                  <Text style={styles.correctWord}>{issue.correctWord}</Text>
                </>
              )}
            </View>

            {!!issue.detailFeedbackWithReason && (
              <Text style={styles.detailText}>{issue.detailFeedbackWithReason}</Text>
            )}
            {!!issue.exampleOfUsage && (
              <View style={styles.exampleBox}>
                <HtmlText html={issue.exampleOfUsage} style={styles.exampleText} />
              </View>
            )}
          </ScrollView>

          {/* Navigation */}
          {total > 1 && (
            <View style={styles.modalNav}>
              <Pressable
                onPress={onPrev}
                disabled={index === 0}
                style={[styles.modalNavBtn, index === 0 && { opacity: 0.3 }]}
              >
                <IconChevLeft size={16} color={colors.textPrimary} />
              </Pressable>
              <Text style={styles.modalNavCounter}>{index + 1} / {total}</Text>
              <Pressable
                onPress={onNext}
                disabled={index === total - 1}
                style={[styles.modalNavBtn, index === total - 1 && { opacity: 0.3 }]}
              >
                <IconChevRight size={16} color={colors.textPrimary} />
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ── OutlineModal ─────────────────────────────────────────────────────────────
function OutlineModal({ section, onClose }: { section: OutlineSection; onClose: () => void }) {
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={[styles.modalCard, { height: SCREEN_H * 0.72 }]}>
          <View style={styles.modalTopRow}>
            <Text style={[styles.errorCatLabel, { color: colors.textPrimary, flex: 1 }]}>{section.section}</Text>
            <Pressable onPress={onClose} hitSlop={12} style={styles.modalCloseBtn}>
              <IconClose size={14} color={colors.textTertiary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginTop: 14 }}>
            {section.achievements.length > 0 && (
              <View style={[styles.outlineBlock, styles.outlineBlockAchievement]}>
                <View style={styles.outlineBlockHeader}>
                  <IconCheckFilled size={16} bg="#4CAF50" />
                  <Text style={[styles.outlineBlockTitle, { color: '#2E7D32' }]}>ACHIEVEMENTS</Text>
                </View>
                {section.achievements.map((a, i) => (
                  <Text key={i} style={styles.outlineBlockText}>{a}</Text>
                ))}
              </View>
            )}

            {section.issues.length > 0 && (
              <View style={[styles.outlineBlock, styles.outlineBlockIssue]}>
                <View style={styles.outlineBlockHeader}>
                  <IconAlertFilled size={16} bg="#E08A00" />
                  <Text style={[styles.outlineBlockTitle, { color: '#B45309' }]}>ISSUES</Text>
                </View>
                {section.issues.map((issue, i) => (
                  <Text key={i} style={styles.outlineBlockText}>{issue}</Text>
                ))}
              </View>
            )}

            {!!section.finalComment && (
              <View style={[styles.outlineBlock, styles.outlineBlockSummary]}>
                <View style={styles.outlineBlockHeader}>
                  <IconInfo size={16} color={colors.brandBlue} />
                  <Text style={[styles.outlineBlockTitle, { color: colors.brandBlue }]}>SUMMARY</Text>
                </View>
                <Text style={styles.outlineBlockText}>{section.finalComment}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ── WritingList ──────────────────────────────────────────────────────────────
export function WritingList({ bsTab, lcFilter, modalIdx, setBsTab, setLcFilter, setModalIdx }: WritingSharedState) {
  const { report } = useReport();

  const questionText = report ? getQuestionText(report.result) : null;
  const responseText = report ? getUserResponseText(report.result) : null;
  const wordCount    = report?.wordCount ?? null;
  const allIssues    = report ? getMechanicsIssues(report.result) : [];

  const lcIssues = useMemo(() => allIssues.filter(i => i.type !== 'logic-error'), [allIssues.length]);

  // Logic hataları metindeki sıraya göre sırala; aynı cümlede birden fazla hata varsa
  // o cümlenin tüm hataları ardışık gelir (API sırası korunur, pozisyon öncelikli)
  const logicIssues = useMemo(() => {
    const raw = allIssues.filter(i => i.type === 'logic-error');
    if (!responseText) return raw;
    return [...raw].sort((a, b) => {
      const aPos = responseText.indexOf(a.wrongContent);
      const bPos = responseText.indexOf(b.wrongContent);
      if (aPos !== bPos) return aPos - bPos;
      return (a.errorIndex ?? 0) - (b.errorIndex ?? 0);
    });
  }, [allIssues.length, responseText]);

  // Aktif filtreye göre highlight edilecek issue'lar
  const highlightIssues = useMemo(() => {
    if (bsTab === 'Logic')   return logicIssues;
    if (bsTab === 'Outline') return [];
    return lcFilter === 'all' ? lcIssues : lcIssues.filter(i => i.type === lcFilter);
  }, [bsTab, lcFilter, allIssues.length, logicIssues]);

  // Modal için aktif liste — highlightIssues ile aynı
  const modalList = highlightIssues;
  const safeIdx   = modalIdx !== null ? Math.min(modalIdx, Math.max(0, modalList.length - 1)) : null;

  const handleWordPress = (issue: InlineCorrection) => {
    if (issue.type === 'logic-error') {
      setBsTab('Logic');
      // Aynı cümleye ait ilk hatayı bul (sıralı logicIssues içinde)
      const firstForSentence = logicIssues.findIndex(i => i.wrongContent === issue.wrongContent);
      setModalIdx(firstForSentence >= 0 ? firstForSentence : 0);
    } else {
      setBsTab('Language Convention');
      const idx = highlightIssues.findIndex(i => i.errorIndex === issue.errorIndex);
      setModalIdx(idx >= 0 ? idx : 0);
    }
  };

  return (
    <>
      {!!questionText && (
        <View style={{ marginBottom: 16 }}>
          <Text style={[type.label, { marginBottom: 8 }]}>PROMPT</Text>
          <Card padding={14}>
            <ScrollView style={{ maxHeight: 120 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
              <HtmlText html={questionText} style={styles.promptText} />
            </ScrollView>
          </Card>
        </View>
      )}

      {!!responseText && (
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
            <Text style={type.label}>RESPONSE</Text>
            {wordCount != null && (
              <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textTertiary }}>
                ({wordCount} words)
              </Text>
            )}
          </View>
          <Card padding={14}>
            <AnnotatedText
              text={responseText}
              issues={highlightIssues}
              onPress={handleWordPress}
            />
          </Card>
        </View>
      )}

      <View style={{ height: 180 }} />

      {safeIdx !== null && modalList[safeIdx] && (
        <ErrorModal
          issue={modalList[safeIdx]}
          index={safeIdx}
          total={modalList.length}
          onPrev={() => setModalIdx(i => Math.max(0, (i ?? 0) - 1))}
          onNext={() => setModalIdx(i => Math.min(modalList.length - 1, (i ?? 0) + 1))}
          onClose={() => setModalIdx(null)}
        />
      )}
    </>
  );
}

// ── WritingBottomSheet ───────────────────────────────────────────────────────
const BS_TABS: BSTab[] = ['Language Convention', 'Outline', 'Logic'];

export function WritingBottomSheet({ bsTab, setBsTab, lcFilter, setLcFilter, setModalIdx }: WritingSharedState) {
  const { report } = useReport();
  const [expanded, setExpanded] = useState(true);
  const [outlineSection, setOutlineSection] = useState<OutlineSection | null>(null);
  const insets = useSafeAreaInsets();

  const allIssues   = report ? getMechanicsIssues(report.result) : [];
  const responseText = report ? getUserResponseText(report.result) : null;
  const lcIssues    = allIssues.filter(i => i.type !== 'logic-error');
  const logicIssues = useMemo(() => {
    const raw = allIssues.filter(i => i.type === 'logic-error');
    if (!responseText) return raw;
    return [...raw].sort((a, b) => {
      const aPos = responseText.indexOf(a.wrongContent);
      const bPos = responseText.indexOf(b.wrongContent);
      if (aPos !== bPos) return aPos - bPos;
      return (a.errorIndex ?? 0) - (b.errorIndex ?? 0);
    });
  }, [allIssues.length, responseText]);

  const counts: Record<string, number> = {};
  for (const issue of lcIssues) counts[issue.type] = (counts[issue.type] ?? 0) + 1;
  const activeCats = CATEGORY_DEFS.filter(c => c.id !== 'all' && (counts[c.key] ?? 0) > 0);
  const zeroCats   = CATEGORY_DEFS.filter(c => c.id !== 'all' && (counts[c.key] ?? 0) === 0);

  const outlineSections = report ? getOutlineCompliance(report.result) : [];

  return (
    <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {outlineSection && (
        <OutlineModal section={outlineSection} onClose={() => setOutlineSection(null)} />
      )}
      {/* Tab bar — her zaman görünür */}
      <View style={styles.bsTabBar}>
        {/* Handle çizgisi — ortada */}
        <View style={styles.handleWrap} pointerEvents="none">
          <View style={styles.handle} />
        </View>

        {BS_TABS.map(t => {
          const isActive = t === bsTab;
          const label    = t;
          const badge    = t === 'Logic' && logicIssues.length > 0   ? ` (${logicIssues.length})`
                         : t === 'Language Convention' && lcIssues.length > 0 ? ` (${lcIssues.length})`
                         : '';
          return (
            <Pressable
              key={t}
              onPress={() => { setBsTab(t); setExpanded(true); }}
              style={styles.bsTabItem}
            >
              <Text style={[styles.bsTabText, isActive && styles.bsTabActive]}>
                {label}{badge}
              </Text>
              {isActive && <View style={styles.bsUnderline} />}
            </Pressable>
          );
        })}

        {/* Aç/kapa chevron — sağ uç */}
        <Pressable
          onPress={() => setExpanded(e => !e)}
          hitSlop={12}
          style={styles.bsToggleBtn}
        >
          <View style={expanded ? undefined : { transform: [{ rotate: '180deg' }] }}>
            <IconChevDown size={16} color={colors.textTertiary} />
          </View>
        </Pressable>
      </View>

      {/* İçerik — expanded'da sabit yükseklik, sekmeler arası kayma yok */}
      {expanded && (
        <View style={styles.bsContent}>
          {bsTab === 'Language Convention' && (
            <ScrollView
              contentContainerStyle={styles.pillsWrap}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {[CATEGORY_DEFS[0], ...activeCats].map(cat => {
                const count  = cat.id === 'all' ? lcIssues.length : (counts[cat.key] ?? 0);
                const active = lcFilter === cat.key;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setLcFilter(cat.key)}
                    style={[styles.catPill, {
                      borderColor: cat.border,
                      backgroundColor: active ? cat.bg : 'transparent',
                    }]}
                  >
                    <View style={[styles.catRadio, { borderColor: cat.border }]}>
                      {active && <View style={[styles.catRadioDot, { backgroundColor: cat.color }]} />}
                    </View>
                    <Text style={[styles.catPillText, { color: cat.color }]}>
                      {cat.label} ({count})
                    </Text>
                  </Pressable>
                );
              })}
              {zeroCats.map(cat => (
                <View
                  key={cat.id}
                  style={[styles.catPill, {
                    borderColor: cat.border,
                    backgroundColor: 'transparent',
                    opacity: 0.35,
                  }]}
                >
                  <View style={[styles.catRadio, { borderColor: cat.border }]} />
                  <Text style={[styles.catPillText, { color: cat.color }]}>
                    {cat.label} (0)
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}

          {bsTab === 'Logic' && (
            <ScrollView
              contentContainerStyle={styles.logicList}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {logicIssues.length === 0 ? (
                <Text style={styles.logicEmptyText}>No logic errors found.</Text>
              ) : (
                logicIssues.map((issue, i) => (
                  <Pressable
                    key={i}
                    style={styles.logicListItem}
                    onPress={() => { setBsTab('Logic'); setModalIdx(i); }}
                  >
                    <View style={[styles.logicNumBadge, { backgroundColor: LOGIC_DEF.color }]}>
                      <Text style={styles.logicNumText}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      {!!issue.subType && (
                        <Text style={[styles.logicSubType, { color: LOGIC_DEF.color }]}>
                          {formatSubType(issue.subType)}
                        </Text>
                      )}
                      {!!issue.detailFeedbackWithReason && (
                        <Text style={styles.logicPreview} numberOfLines={2}>
                          {issue.detailFeedbackWithReason}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                ))
              )}
            </ScrollView>
          )}

          {bsTab === 'Outline' && (
            <ScrollView
              contentContainerStyle={styles.outlineSectionList}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {outlineSections.length === 0 ? (
                <Text style={styles.logicEmptyText}>No outline data available.</Text>
              ) : (
                outlineSections.map((s, i) => (
                  <Pressable
                    key={i}
                    style={styles.outlineSectionItem}
                    onPress={() => setOutlineSection(s)}
                  >
                    <View style={[styles.outlineScoreDot, {
                      backgroundColor: s.score >= 75 ? '#4CAF50' : s.score >= 50 ? '#E08A00' : '#C04A4A',
                    }]} />
                    <Text style={styles.outlineSectionName} numberOfLines={1}>{s.section}</Text>
                    <IconChevRight size={14} color={colors.textTertiary} />
                  </Pressable>
                ))
              )}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  promptText:   { fontFamily: fonts.sans, fontSize: 14, lineHeight: 22, color: colors.textSecondary },
  responseText: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 26, color: colors.textPrimary },

  // Modal
  modalOverlay: {
    flex: 1,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    height: SCREEN_H * 0.42,
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: 16,
    ...shadow.md,
  },
  modalTopRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  modalCloseBtn: { padding: 4 },
  modalNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 16, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: colors.hairline,
  },
  modalNavBtn:     { padding: 6 },
  modalNavCounter: { fontFamily: fonts.mono, fontSize: 13, color: colors.textSecondary },

  // Error content (shared by modal)
  errorCatLabel: { fontFamily: fonts.sansSb, fontSize: 18, letterSpacing: 0.1, marginBottom: 4 },
  subTypePill:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.sm, borderWidth: 1 },
  subTypeText:   { fontFamily: fonts.mono, fontSize: 12 },
  errorWords:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  wrongWord:     { fontFamily: fonts.monoSb, fontSize: 15, textDecorationLine: 'line-through' },
  wordArrow:     { fontFamily: fonts.mono,   fontSize: 15, color: colors.textTertiary },
  correctWord:   { fontFamily: fonts.monoSb, fontSize: 15, color: colors.brandGreenDeep },
  detailText:    { fontFamily: fonts.sansSb, fontSize: 13, lineHeight: 19, color: colors.textPrimary, marginBottom: 8 },
  exampleBox:    { backgroundColor: colors.bgApp, borderRadius: radii.sm, padding: 10, marginTop: 4 },
  exampleText:   { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.textSecondary },

  // Bottom sheet
  sheet: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    shadowColor: '#0E1116', shadowOpacity: 0.20, shadowRadius: 20,
    shadowOffset: { width: 0, height: -6 }, elevation: 12,
  },
  handleWrap: { position: 'absolute', top: 8, left: 0, right: 0, alignItems: 'center' },
  handle:     { width: 36, height: 4, borderRadius: 99, backgroundColor: colors.hairline },

  bsTabBar:    { flexDirection: 'row', gap: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.hairline, paddingHorizontal: 16, paddingTop: 14 },
  bsTabItem:   { alignItems: 'flex-start', paddingVertical: 10, position: 'relative' },
  bsToggleBtn: { marginLeft: 'auto', paddingVertical: 10, paddingLeft: 4 },
  bsTabText:   { fontFamily: fonts.sansSb, fontSize: 13, color: colors.textTertiary },
  bsTabActive: { color: colors.textPrimary },
  bsUnderline: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: colors.brandBlue, borderRadius: 1 },

  bsContent: { height: 150 },

  pillsWrap: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: 14, paddingTop: 10, paddingBottom: 14,
  },
  catPill:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.pill, borderWidth: 1 },
  catRadio:    { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  catRadioDot: { width: 7, height: 7, borderRadius: 4 },
  catPillText: { fontFamily: fonts.sansSb, fontSize: 12 },

  logicList:      { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 14, gap: 10 },
  logicListItem:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  logicNumBadge:  { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  logicNumText:   { fontFamily: fonts.monoSb, fontSize: 11, color: '#fff' },
  logicSubType:   { fontFamily: fonts.sansSb, fontSize: 12, marginBottom: 2 },
  logicPreview:   { fontFamily: fonts.sans, fontSize: 12, color: colors.textSecondary, lineHeight: 17 },
  logicEmptyText: { fontFamily: fonts.sans, fontSize: 13, color: colors.textTertiary },

  // Outline BS list
  outlineSectionList: { paddingHorizontal: 14, paddingVertical: 8, gap: 2 },
  outlineSectionItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 9, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
  },
  outlineScoreDot:  { width: 8, height: 8, borderRadius: 4 },
  outlineSectionName: { flex: 1, fontFamily: fonts.sansSb, fontSize: 13, color: colors.textPrimary },

  // Outline modal blocks
  outlineBlock: {
    borderRadius: radii.md, borderWidth: 1,
    padding: 12, marginBottom: 10,
    gap: 6,
  },
  outlineBlockAchievement: { backgroundColor: '#F0FBF0', borderColor: '#A5D6A7' },
  outlineBlockIssue:       { backgroundColor: '#FFF8EC', borderColor: '#F6C980' },
  outlineBlockSummary:     { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' },
  outlineBlockHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  outlineBlockTitle:  { fontFamily: fonts.sansSb, fontSize: 11, letterSpacing: 0.5 },
  outlineBlockText:   { fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, color: colors.textPrimary },
});
