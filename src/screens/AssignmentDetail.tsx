// 03 · Assignment Detail
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenSurface, ScreenScroll } from '@/components/Screen';
import Card from '@/components/Card';
import IconButton from '@/components/IconButton';
import LevelBadge from '@/components/LevelBadge';
import StatusPill from '@/components/StatusPill';
import Button from '@/components/Button';
import StatTile from '@/components/StatTile';
import { IconChevLeft, IconArrow } from '@/components/Icons';
import { colors, fonts, radii, type } from '@/theme';
import type { HomeStackParamList } from '@/navigation/types';

export default function AssignmentDetail() {
  const nav = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  return (
    <ScreenSurface>
      <View style={styles.header}>
        <IconButton onPress={() => nav.goBack()}>
          <IconChevLeft size={18} color={colors.textPrimary}/>
        </IconButton>
        <Text style={styles.headerTitle}>Assignment</Text>
        <IconButton>
          <Text style={{ letterSpacing: 2 }}>···</Text>
        </IconButton>
      </View>

      <ScreenScroll contentStyle={{ paddingBottom: 120 }}>
        {/* Title block */}
        <View style={{ padding: 20 }}>
          <View style={styles.metaRow}>
            <LevelBadge level="A2" size="sm"/>
            <Text style={[type.labelSm, { color: colors.textSecondary }]}>ESSAY</Text>
            <StatusPill kind="due">Due today</StatusPill>
          </View>
          <Text style={styles.title}>My Town & Neighbourhood</Text>
          <Text style={styles.assigned}>Assigned Apr 26</Text>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {/* Prompt */}
          <Card padding={16}>
            <Text style={[type.label, { marginBottom: 8 }]}>PROMPT</Text>
            <Text style={styles.prompt}>
              Write an essay about the{' '}
              <Text style={styles.bold}>advantages and disadvantages</Text> of living in
              your town or neighbourhood. End with your own opinion.
            </Text>
          </Card>

          {/* Stat tiles */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <StatTile label="LENGTH" value="80–130w"/>
            <StatTile label="TIME"   value="45 min"/>
            <StatTile label="RUBRIC" value="4 dims"/>
          </View>

          {/* Suggested structure */}
          <Card padding={16}>
            <Text style={[type.label, { marginBottom: 12 }]}>SUGGESTED STRUCTURE</Text>
            <StructureRow para="¶1" text="Introduction — name your town"  w="~25w"/>
            <StructureRow para="¶2" text="Advantages (2 points)"          w="~30w"/>
            <StructureRow para="¶3" text="Disadvantages (2 points)"       w="~25w"/>
            <StructureRow para="¶4" text="Your opinion & conclusion"      w="~20w" last/>
          </Card>

          {/* Graded on */}
          <Card padding={16}>
            <Text style={[type.label, { marginBottom: 12 }]}>YOU'LL BE GRADED ON</Text>
            <GradedRow color={colors.rubricTask}     label="Task Achievement"     pct="25%"/>
            <GradedRow color={colors.rubricCohesion} label="Coherence & Cohesion" pct="25%"/>
            <GradedRow color={colors.rubricLexical}  label="Lexical Range"        pct="25%"/>
            <GradedRow color={colors.rubricGrammar}  label="Grammatical Accuracy" pct="25%" last/>
          </Card>
        </View>
      </ScreenScroll>

      {/* Sticky CTA */}
      <View style={styles.stickyCta}>
        <Button kind="dark" onPress={() => nav.navigate('Compose', { id: 1 })}
          icon={<IconArrow size={16} color="#fff"/>}>
          Start writing
        </Button>
      </View>
    </ScreenSurface>
  );
}

function StructureRow({ para, text, w, last }: { para: string; text: string; w: string; last?: boolean }) {
  return (
    <View style={[styles.structRow, !last && styles.structDivider]}>
      <Text style={styles.structPara}>{para}</Text>
      <Text style={styles.structText}>{text}</Text>
      <Text style={styles.structW}>{w}</Text>
    </View>
  );
}

function GradedRow({ color, label, pct, last }: { color: string; label: string; pct: string; last?: boolean }) {
  return (
    <View style={[styles.gradedRow, !last && styles.structDivider]}>
      <View style={[styles.gradedDot, { backgroundColor: color }]}/>
      <Text style={styles.gradedLabel}>{label}</Text>
      <Text style={styles.structW}>{pct}</Text>
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

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  title:   { fontFamily: fonts.sansSb, fontSize: 28, lineHeight: 32, letterSpacing: -0.4, color: colors.textPrimary },
  assigned:{ fontFamily: fonts.sans, fontSize: 13, color: colors.textSecondary, marginTop: 6 },

  prompt:  { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, color: colors.textPrimary },
  bold:    { fontFamily: fonts.sansEb },

  structRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  structDivider: { borderBottomWidth: 1, borderBottomColor: colors.hairline, borderStyle: 'dashed' },
  structPara: { fontFamily: fonts.monoSb, fontSize: 13, color: colors.brandBlue, width: 26 },
  structText: { flex: 1, fontFamily: fonts.sans, fontSize: 15, color: colors.textPrimary },
  structW:    { fontFamily: fonts.mono, fontSize: 12, color: colors.textTertiary },

  gradedRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  gradedDot: { width: 8, height: 8, borderRadius: 99 },
  gradedLabel: { flex: 1, fontFamily: fonts.sansSb, fontSize: 15, color: colors.textPrimary },

  stickyCta: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 20, paddingBottom: 22, paddingTop: 14,
    backgroundColor: colors.bgApp,
    borderTopWidth: 1, borderTopColor: colors.hairline,
  },
});
