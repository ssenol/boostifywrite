import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import Card from '@/components/Card';
import { IconChevDown, IconCheckFilled, IconInfo } from '@/components/Icons';
import { useReport, getSandwichFeedback } from '@/context/ReportContext';
import type { SandwichPoint, FillingPoint } from '@/context/ReportContext';
import { colors, fonts, radii, type } from '@/theme';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({
  num, title, color, children,
}: {
  num: number;
  title: string;
  color: { bg: string; border: string; badge: string; text: string };
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={[styles.sectionHeader, { backgroundColor: color.bg, borderColor: color.border }]}>
        <View style={[styles.sectionNum, { backgroundColor: color.badge, borderColor: color.border }]}>
          <Text style={[styles.sectionNumText, { color: color.text }]}>{num}</Text>
        </View>
        <Text style={[styles.sectionTitle, { color: color.text }]}>{title}</Text>
      </View>
      <Card padding={0} style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTopWidth: 0 }}>
        {children}
      </Card>
    </View>
  );
}

// ── What's Working — kompakt satır, tap ile detail ────────────────────────────
function TopBreadRow({ point, last }: { point: SandwichPoint; last: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable
      onPress={() => setOpen(o => !o)}
      style={[styles.row, !last && styles.rowDivider]}
    >
      <View style={styles.rowMain}>
        <IconCheckFilled size={16} bg="#4CAF50" />
        <Text style={styles.rowLabel}>{point.label}</Text>
        <View style={open ? styles.chevOpen : styles.chevClosed}>
          <IconChevDown size={14} color={colors.textTertiary} />
        </View>
      </View>
      {open && !!point.detail && (
        <Text style={styles.rowDetail}>{point.detail}</Text>
      )}
    </Pressable>
  );
}

// ── What to Work On — collapsed by default, tap ile full detail ───────────────
function FillingRow({ point, index, last }: { point: FillingPoint; index: number; last: boolean }) {
  const [open, setOpen] = useState(false);
  const letter = LETTERS[index] ?? String(index + 1);

  return (
    <View style={[styles.row, !last && styles.rowDivider]}>
      <Pressable onPress={() => setOpen(o => !o)} style={styles.rowMain}>
        <View style={styles.letterBadge}>
          <Text style={styles.letterText}>{letter}</Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.rowLabel}>{point.label}</Text>
          {!!point.criterion && (
            <Text style={styles.criterionTag}>{point.criterion}</Text>
          )}
        </View>
        <View style={open ? styles.chevOpen : styles.chevClosed}>
          <IconChevDown size={14} color={colors.textTertiary} />
        </View>
      </Pressable>

      {open && (
        <View style={styles.fillingDetail}>
          {!!point.issue && (
            <Text style={styles.rowDetail}>{point.issue}</Text>
          )}

          {(!!point.before || !!point.after) && (
            <View style={styles.beforeAfterRow}>
              {!!point.before && (
                <View style={[styles.beforeAfterBox, styles.beforeBox]}>
                  <Text style={styles.beforeAfterLabel}>BEFORE</Text>
                  <Text style={styles.beforeAfterText}>{point.before}</Text>
                </View>
              )}
              {!!point.after && (
                <View style={[styles.beforeAfterBox, styles.afterBox]}>
                  <Text style={styles.beforeAfterLabel}>AFTER</Text>
                  <Text style={styles.beforeAfterText}>{point.after}</Text>
                </View>
              )}
            </View>
          )}

          {!!point.tip && (
            <View style={styles.tipBox}>
              <View style={styles.tipHeader}>
                <IconInfo size={13} color={colors.textTertiary} />
                <Text style={styles.tipLabel}>TIP</Text>
              </View>
              <Text style={styles.tipText}>{point.tip}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ── Keep Going — kompakt numaralı satırlar ────────────────────────────────────
function NextStepRow({ text, index, last }: { text: string; index: number; last: boolean }) {
  const letter = LETTERS[index] ?? String(index + 1);
  return (
    <View style={[styles.row, styles.nextStepRow, !last && styles.rowDivider]}>
      <View style={styles.nextStepBadge}>
        <Text style={styles.nextStepBadgeText}>{letter}</Text>
      </View>
      <Text style={styles.nextStepText}>{text}</Text>
    </View>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function FeedbackContent() {
  const { report } = useReport();

  if (!report) return null;

  const feedback  = getSandwichFeedback(report.result);
  const firstName = report.studentInfo?.studentName ?? '';

  if (!feedback) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.textSecondary }}>
          Feedback not available for this submission.
        </Text>
      </View>
    );
  }

  const { topBread, filling, bottomBread } = feedback;

  return (
    <>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>
          Keep building{firstName ? `, ${firstName}` : ''}. Here's the full bite.
        </Text>
        <Text style={styles.pageSubtitle}>
          Strengths first — then the detailed improvements with before & after — encouragement and next steps to close.
        </Text>
      </View>

      {/* 1. What's Working */}
      <Section num={1} title="What's Working"
        color={{ bg: '#EDF7EE', border: '#A5D6A7', badge: '#C8EACB', text: '#2E7D32' }}>
        {topBread.points.map((p, i) => (
          <TopBreadRow key={i} point={p} last={i === topBread.points.length - 1} />
        ))}
      </Section>

      {/* 2. What to Work On */}
      <Section num={2} title="What to Work On"
        color={{ bg: '#FFF4E5', border: '#F6C980', badge: '#FFE4B3', text: '#B45309' }}>
        {filling.points.map((p, i) => (
          <FillingRow key={i} point={p} index={i} last={i === filling.points.length - 1} />
        ))}
      </Section>

      {/* 3. Keep Going */}
      <Section num={3} title="Keep Going"
        color={{ bg: '#EEF2FF', border: '#C7D2FE', badge: '#D4DCFF', text: '#3730A3' }}>
        {!!bottomBread.summary && (
          <View style={[styles.row, styles.summaryRow, styles.rowDivider]}>
            <Text style={styles.summaryText}>{bottomBread.summary}</Text>
          </View>
        )}
        {bottomBread.nextSteps.map((step, i) => (
          <NextStepRow
            key={i}
            text={step}
            index={i}
            last={i === bottomBread.nextSteps.length - 1}
          />
        ))}
      </Section>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  pageHeader: { marginBottom: 16 },
  pageTitle: {
    fontFamily: fonts.sansSb, fontSize: 18, color: colors.textPrimary,
    lineHeight: 26, letterSpacing: -0.2, marginBottom: 5,
  },
  pageSubtitle: {
    fontFamily: fonts.sans, fontSize: 14, color: colors.textSecondary, lineHeight: 20,
  },

  // Section
  section: { marginBottom: 16 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 11, paddingHorizontal: 14,
    borderRadius: radii.md, borderWidth: 1,
    borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  sectionNum: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionNumText: { fontFamily: fonts.monoSb, fontSize: 11 },
  sectionTitle:   { flex: 1, fontFamily: fonts.sansB, fontSize: 15 },

  // Shared row
  row:        { paddingHorizontal: 14, paddingVertical: 13 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  rowMain:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowLabel:   { flex: 1, fontFamily: fonts.sansSb, fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  rowDetail:  { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.textSecondary, marginTop: 8 },

  chevClosed: {},
  chevOpen:   { transform: [{ rotate: '180deg' }] },

  criterionTag: {
    fontFamily: fonts.mono, fontSize: 11, color: colors.textTertiary,
  },

  // Letter badge (filling)
  letterBadge: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.bgApp,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  letterText: { fontFamily: fonts.monoSb, fontSize: 12, color: colors.textSecondary },

  // Filling expanded detail
  fillingDetail: { marginTop: 4 },
  beforeAfterRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  beforeAfterBox: { flex: 1, borderRadius: radii.sm, padding: 10, gap: 4 },
  beforeBox:      { backgroundColor: '#FFF8EC', borderWidth: 1, borderColor: '#F6C980' },
  afterBox:       { backgroundColor: '#F0FBF0', borderWidth: 1, borderColor: '#A5D6A7' },
  beforeAfterLabel: {
    fontFamily: fonts.sansSb, fontSize: 10, letterSpacing: 0.5,
    color: colors.textTertiary, marginBottom: 2,
  },
  beforeAfterText: { fontFamily: fonts.mono, fontSize: 12, lineHeight: 17, color: colors.textPrimary },

  tipBox:    { backgroundColor: colors.bgApp, borderRadius: radii.sm, padding: 10, marginTop: 10 },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  tipLabel:  { fontFamily: fonts.sansSb, fontSize: 10, letterSpacing: 0.5, color: colors.textTertiary },
  tipText:   { fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, color: colors.textSecondary },

  // Summary (bottomBread)
  summaryRow: {},
  summaryText: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, color: colors.textSecondary },

  // Next step rows
  nextStepRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  nextStepBadge:    {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#EEF2FF',
    borderWidth: 1, borderColor: '#C7D2FE',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  nextStepBadgeText: { fontFamily: fonts.monoSb, fontSize: 11, color: colors.brandBlue },
  nextStepText:      { flex: 1, fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, color: colors.textPrimary },
});
