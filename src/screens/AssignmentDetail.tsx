// 03 · Assignment Detail — gerçek exercise parametresiyle çalışır
import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenSurface, ScreenScroll } from '@/components/Screen';
import Card from '@/components/Card';
import IconButton from '@/components/IconButton';
import LevelBadge from '@/components/LevelBadge';
import Button from '@/components/Button';
import StatTile from '@/components/StatTile';
import { IconChevLeft, IconArrow } from '@/components/Icons';
import { useAuth } from '@/context/AuthContext';
import { generateExerciseToken } from '@/api';
import { colors, fonts, radii, type } from '@/theme';
import type { HomeStackParamList } from '@/navigation/types';

type Nav   = NativeStackNavigationProp<HomeStackParamList>;
type Route = RouteProp<HomeStackParamList, 'AssignmentDetail'>;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function dueBadge(dueDate: string): { label: string; color: string } {
  const diff = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
  if (diff < 0)   return { label: `Overdue · ${Math.abs(diff)}d`, color: colors.danger };
  if (diff === 0) return { label: 'Due today', color: colors.brandBlue };
  if (diff === 1) return { label: 'Due tomorrow', color: colors.textSecondary };
  return { label: `Due in ${diff}d`, color: colors.textSecondary };
}

const RUBRIC_COLORS = [
  colors.rubricTask, colors.rubricCohesion, colors.rubricLexical, colors.rubricGrammar,
];

export default function AssignmentDetail() {
  const nav      = useNavigation<Nav>();
  const route    = useRoute<Route>();
  const { user } = useAuth();
  const { exercise: ex } = route.params;
  const meta = ex.assignmentMetaData.details;
  const due  = dueBadge(ex.dueDate);

  const [starting, setStarting] = useState(false);

  const handleStart = async () => {
    if (!user) return;
    setStarting(true);
    try {
      const exerciseToken = await generateExerciseToken(ex, user.userId);
      nav.navigate('Compose', { exercise: ex, exerciseToken });
    } catch {
      Alert.alert('Could not start', 'Please check your connection and try again.');
    } finally {
      setStarting(false);
    }
  };

  const rubricCriteria = meta.taskBaseCustomRubricDetails ?? [];
  const keywords = meta.keywords
    ? meta.keywords.split(',').map(k => k.trim()).filter(Boolean)
    : [];

  return (
    <ScreenSurface>
      <View style={styles.header}>
        <IconButton onPress={() => nav.goBack()}>
          <IconChevLeft size={18} color={colors.textPrimary}/>
        </IconButton>
        <Text style={styles.headerTitle}>Assignment</Text>
        <View style={{ width: 40 }}/>
      </View>

      <ScreenScroll contentStyle={{ paddingBottom: 120 }}>
        <View style={{ padding: 20 }}>
          <View style={styles.metaRow}>
            <LevelBadge level={meta.cefrLevel} size="sm"/>
            {meta.writingGenre && (
              <Text style={[type.labelSm, { color: colors.textSecondary }]}>
                {meta.writingGenre.toUpperCase()}
              </Text>
            )}
            <Text style={[type.labelSm, { color: due.color, marginLeft: 'auto' }]}>
              {due.label.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.title}>{ex.name}</Text>
          <Text style={styles.assigned}>Assigned {formatDate(ex.startDate)}</Text>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <StatTile
              label="LENGTH"
              value={meta.maxWordCount
                ? `${meta.minWordCount}–${meta.maxWordCount}w`
                : `${meta.minWordCount}+w`}
            />
            {ex.assignmentTimeLimit > 0 && (
              <StatTile label="TIME" value={`${ex.assignmentTimeLimit}min`}/>
            )}
            <StatTile label="ATTEMPTS" value={String(ex.remainingAttemptCount)}/>
          </View>

          {meta.outlines && meta.outlines.length > 0 && (
            <Card padding={16}>
              <Text style={[type.label, { marginBottom: 12 }]}>SUGGESTED STRUCTURE</Text>
              {meta.outlines.map((o, i) => (
                <StructureRow
                  key={o.id}
                  para={`¶${i + 1}`}
                  text={o.label}
                  purpose={o.purpose}
                  last={i === meta.outlines!.length - 1}
                />
              ))}
            </Card>
          )}

          {rubricCriteria.length > 0 && (
            <Card padding={16}>
              <Text style={[type.label, { marginBottom: 12 }]}>YOU'LL BE GRADED ON</Text>
              {rubricCriteria.map((c, i) => (
                <GradedRow
                  key={c.name}
                  color={RUBRIC_COLORS[i % RUBRIC_COLORS.length]}
                  label={c.name}
                  pct={`${Math.round(c.weight * 100)}%`}
                  last={i === rubricCriteria.length - 1}
                />
              ))}
            </Card>
          )}

          {keywords.length > 0 && (
            <Card padding={16}>
              <Text style={[type.label, { marginBottom: 10 }]}>KEY VOCABULARY</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {keywords.map(k => (
                  <View key={k} style={styles.keyword}>
                    <Text style={styles.keywordText}>{k}</Text>
                  </View>
                ))}
              </View>
            </Card>
          )}
        </View>
      </ScreenScroll>

      <View style={styles.stickyCta}>
        {starting ? (
          <ActivityIndicator color={colors.brandBlue} style={{ height: 50 }}/>
        ) : (
          <Button kind="dark" onPress={handleStart}
            icon={<IconArrow size={16} color="#fff"/>}>
            Start writing
          </Button>
        )}
      </View>
    </ScreenSurface>
  );
}

function StructureRow({
  para, text, purpose, last,
}: { para: string; text: string; purpose: string; last?: boolean }) {
  return (
    <View style={[styles.structRow, !last && styles.structDivider]}>
      <Text style={styles.structPara}>{para}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.structText}>{text}</Text>
        {!!purpose && <Text style={styles.structPurpose}>{purpose}</Text>}
      </View>
    </View>
  );
}

function GradedRow({
  color, label, pct, last,
}: { color: string; label: string; pct: string; last?: boolean }) {
  return (
    <View style={[styles.gradedRow, !last && styles.structDivider]}>
      <View style={[styles.gradedDot, { backgroundColor: color }]}/>
      <Text style={styles.gradedLabel}>{label}</Text>
      <Text style={styles.gradedPct}>{pct}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20, paddingTop: 12, paddingBottom: 14,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  headerTitle: { flex: 1, fontFamily: fonts.sansSb, fontSize: 16, color: colors.textPrimary },

  metaRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' },
  title:    { fontFamily: fonts.sansSb, fontSize: 28, lineHeight: 32, letterSpacing: -0.4, color: colors.textPrimary },
  assigned: { fontFamily: fonts.sans, fontSize: 13, color: colors.textSecondary, marginTop: 6 },

  structRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 11 },
  structDivider: { borderBottomWidth: 1, borderBottomColor: colors.hairline, borderStyle: 'dashed' },
  structPara:    { fontFamily: fonts.monoSb, fontSize: 13, color: colors.brandBlue, width: 26, paddingTop: 2 },
  structText:    { fontFamily: fonts.sans, fontSize: 15, color: colors.textPrimary },
  structPurpose: { fontFamily: fonts.sans, fontSize: 12, color: colors.textTertiary, marginTop: 2 },

  gradedRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  gradedDot:   { width: 8, height: 8, borderRadius: 99 },
  gradedLabel: { flex: 1, fontFamily: fonts.sansSb, fontSize: 15, color: colors.textPrimary },
  gradedPct:   { fontFamily: fonts.mono, fontSize: 12, color: colors.textTertiary },

  keyword:     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.pill, backgroundColor: colors.bgCardTint, borderWidth: 1, borderColor: colors.border },
  keywordText: { fontFamily: fonts.sans, fontSize: 13, color: colors.textPrimary },

  stickyCta: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 20, paddingBottom: 22, paddingTop: 14,
    backgroundColor: colors.bgApp,
    borderTopWidth: 1, borderTopColor: colors.hairline,
  },
});
