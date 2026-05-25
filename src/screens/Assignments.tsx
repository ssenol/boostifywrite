// 02 · Assignments — home screen
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenSurface, ScreenScroll } from '@/components/Screen';
import Card from '@/components/Card';
import LevelBadge from '@/components/LevelBadge';
import ProgressBar from '@/components/ProgressBar';
import SectionHeader from '@/components/SectionHeader';
import Avatar from '@/components/Avatar';
import { colors, fonts, radii, type } from '@/theme';
import type { HomeStackParamList } from '@/navigation/types';

const ACTIVE = [
  { id: 1, level: 'A2', type: 'Essay',           len: '80–130w',  title: 'My Town & Neighbourhood',
    due: 'Due today', sub: 'Not started', progress: 0,  accent: colors.rubricTask },
  { id: 2, level: 'A2', type: 'Informal letter', len: '60–100w', title: 'A letter to my pen-friend about summer plans',
    due: 'Due Fri · 3d', sub: 'In progress', progress: 38, accent: colors.rubricCohesion },
  { id: 3, level: 'B1', type: 'Review',          len: '100–150w', title: 'Review of a film you liked recently',
    due: 'Due Mon · 6d', sub: 'Not started', progress: 0,  accent: colors.rubricLexical },
];

const COMPLETED = [
  { title: 'A day in my life',    when: 'Returned Apr 25', score: '5.8/9', level: 'B1'  },
  { title: 'My favourite season', when: 'Returned Apr 12', score: '5.2/9', level: 'A2+' },
];

export default function Assignments() {
  const nav = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  return (
    <ScreenSurface>
      {/* Date / greeting header */}
      <View style={styles.header}>
        <View>
          <Text style={[type.label, { marginBottom: 4 }]}>TUESDAY · APR 28</Text>
          <Text style={styles.greeting}>Hi, Elif.</Text>
        </View>
        <Avatar initials="EY"/>
      </View>

      <ScreenScroll contentStyle={{ padding: 20, paddingBottom: 110 }}>
        {/* Dark "your level" card */}
        <View style={styles.levelCard}>
          <View>
            <Text style={[type.label, { color: colors.textInverseSoft, marginBottom: 2 }]}>YOUR LEVEL</Text>
            <Text style={styles.levelText}>
              B1+ <Text style={{ color: colors.textInverseSoft, fontFamily: fonts.sans }}>· Strong B1 writer</Text>
            </Text>
          </View>
          <Text style={styles.levelBig}>B1+</Text>
        </View>

        {/* Active */}
        <View style={{ marginTop: 22 }}>
          <SectionHeader label="ACTIVE · 3"/>
          <View style={{ gap: 10 }}>
            {ACTIVE.map(a => (
              <AssignmentCard key={a.id} a={a}
                onPress={() => nav.navigate('AssignmentDetail', { id: a.id })}/>
            ))}
          </View>
        </View>

        {/* Completed */}
        <View style={{ marginTop: 22 }}>
          <SectionHeader label="COMPLETED"/>
          <View style={{ gap: 8 }}>
            {COMPLETED.map((c, i) => (
              <Card key={i} padding={14}>
                <View style={styles.completedRow}>
                  <View style={[styles.dot, { backgroundColor: colors.brandGreen }]}/>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.completedTitle}>{c.title}</Text>
                    <Text style={styles.completedWhen}>{c.when}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.completedLevel}>{c.level}</Text>
                    <Text style={styles.completedScore}>{c.score}</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </View>
      </ScreenScroll>
    </ScreenSurface>
  );
}

// ── Single assignment card (active) ─────────────────────────
function AssignmentCard({ a, onPress }: { a: typeof ACTIVE[number]; onPress: () => void }) {
  const isDueToday = a.due.startsWith('Due today');
  return (
    <Card accent={a.accent} padding={14} onPress={onPress}>
      <View style={{ marginLeft: 6 }}>
        {/* Chips row + due pill */}
        <View style={styles.chipsRow}>
          <LevelBadge level={a.level} size="sm"/>
          <Text style={styles.chipType}>{a.type}</Text>
          <Text style={styles.chipDot}>·</Text>
          <Text style={styles.chipLen}>{a.len}</Text>
          <View style={{ flex: 1 }}/>
          <View style={[
            styles.duePill,
            isDueToday && { backgroundColor: colors.brandBlueSoft, paddingHorizontal: 10, paddingVertical: 3 },
          ]}>
            <Text style={[
              styles.dueText,
              { color: isDueToday ? colors.brandBlue : colors.textPrimary },
            ]}>{a.due}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{a.title}</Text>

        {/* Status + progress */}
        <View style={styles.bottomRow}>
          <Text style={[
            styles.subText,
            { color: a.progress > 0 ? a.accent : colors.textTertiary },
          ]}>{a.sub}</Text>
          {a.progress > 0 ? (
            <View style={{ flex: 1 }}>
              <ProgressBar value={a.progress} color={a.accent} height={3}/>
            </View>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
  },
  greeting: { fontFamily: fonts.sansSb, fontSize: 26, letterSpacing: -0.5, color: colors.textPrimary },

  levelCard: {
    backgroundColor: colors.bgInverse,
    borderRadius: radii.lg, padding: 16, paddingHorizontal: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  levelText: { fontFamily: fonts.sansSb, fontSize: 15, color: colors.textInverse },
  levelBig:  { fontFamily: fonts.monoSb, fontSize: 30, color: colors.brandBlue, letterSpacing: -0.3 },

  chipsRow: { flexDirection: 'row', alignItems: 'center', columnGap: 10, rowGap: 8, flexWrap: 'wrap' },
  chipType: { fontFamily: fonts.sans, fontSize: 14, color: colors.textSecondary },
  chipDot:  { color: colors.textTertiary },
  chipLen:  { fontFamily: fonts.mono, fontSize: 13, color: colors.textSecondary },

  duePill:  { borderRadius: 9999 },
  dueText:  { fontFamily: fonts.monoSb, fontSize: 12, letterSpacing: 0.4 },

  title: {
    marginTop: 12, fontFamily: fonts.sansSb, fontSize: 18,
    letterSpacing: -0.3, lineHeight: 23,
    color: colors.textPrimary,
  },

  bottomRow: {
    marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12,
    minHeight: 14,
  },
  subText: {
    fontFamily: fonts.monoSb, fontSize: 11, letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  completedRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 8, height: 8, borderRadius: 99 },
  completedTitle: { fontFamily: fonts.sansSb, fontSize: 16, color: colors.textPrimary, letterSpacing: -0.2 },
  completedWhen:  { fontFamily: fonts.mono, fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  completedLevel: { fontFamily: fonts.sansEb, fontSize: 18, color: colors.textPrimary },
  completedScore: { fontFamily: fonts.mono, fontSize: 12, color: colors.textTertiary },
});
