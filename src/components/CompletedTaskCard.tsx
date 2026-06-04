import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import Card from '@/components/Card';
import { IconChevRight } from '@/components/Icons';
import { colors, fonts } from '@/theme';
import type { CompletedExercise } from '@/types/api';

function getScoreColor(score: number): string {
  if (score >= 81) return '#16A34A'; // yeşil
  if (score >= 61) return '#EA580C'; // turuncu
  if (score >= 31) return '#CA8A04'; // sarı
  return '#DC2626'; // kırmızı
}

type Props = {
  exercise: CompletedExercise;
  onPress: () => void;
};

export default function CompletedTaskCard({ exercise: e, onPress }: Props) {
  const bestAttempt = e.attempts.reduce(
    (best, a) => a.mainScore > best.mainScore ? a : best,
    e.attempts[0],
  );

  if (!bestAttempt) return null;

  return (
    <Card accent={getScoreColor(bestAttempt.mainScore)} padding={14} onPress={onPress}>
      <View style={[styles.row, { marginLeft: 6 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{e.taskName}</Text>
          <Text style={styles.when}>
            RETURNED {new Date(e.lastSolvedDate).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric',
            }).toUpperCase()}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.when}>SCORE</Text>
            <Text style={styles.score}>{bestAttempt.mainScore}</Text>
          </View>
          <IconChevRight size={14} color={colors.textTertiary}/>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontFamily: fonts.sansSb, fontSize: 16, color: colors.textPrimary, lineHeight: 22 },
  when:  { fontFamily: fonts.mono, fontSize: 11, color: colors.textTertiary, marginTop: 10 },
  score: { fontFamily: fonts.sansEb, fontSize: 18, color: colors.textPrimary },
});
